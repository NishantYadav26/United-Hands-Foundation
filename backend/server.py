from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, Body
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import time
import cloudinary
import cloudinary.utils
import asyncio
import resend
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from io import BytesIO
import razorpay
from emergentintegrations.llm.chat import LlmChat, UserMessage, FileContentWithMimeType

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Cloudinary configuration
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

# Razorpay client
razorpay_client = razorpay.Client(auth=(
    os.getenv("RAZORPAY_KEY_ID", "rzp_test_placeholder"),
    os.getenv("RAZORPAY_KEY_SECRET", "test_secret_placeholder")
))

# Resend configuration
resend.api_key = os.getenv("RESEND_API_KEY", "re_placeholder")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "onboarding@resend.dev")

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ===== MODELS =====

class DonationCreate(BaseModel):
    donor_name: str
    donor_email: EmailStr
    donor_phone: str
    donor_pan: str
    amount: int
    utr_number: str
    screenshot_url: str
    payment_mode: str = "manual_qr"

class Donation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    donor_name: str
    donor_email: EmailStr
    donor_phone: str
    donor_pan: str
    amount: int
    utr_number: str
    screenshot_url: str
    payment_mode: str = "manual_qr"
    status: str = "pending"  # pending, approved, rejected
    receipt_number: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = "settings"
    payment_mode: str = "manual_qr"  # manual_qr or razorpay
    qr_code_url: str = ""
    upi_id: str = ""

class DonationApproval(BaseModel):
    donation_id: str
    status: str  # approved or rejected

class SuccessStory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    location: str
    patient_count: int
    date: str
    story_text: str
    images: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SuccessStoryCreate(BaseModel):
    location: str
    patient_count: int
    date: str
    story_text: str
    images: List[str] = []

class PressMedia(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    publication: str
    district: str
    year: str
    image_url: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PressMediaCreate(BaseModel):
    title: str
    publication: str
    district: str
    year: str
    image_url: str

# ===== HELPER FUNCTIONS =====

async def generate_receipt_number():
    """Generate serial numbered receipt"""
    count = await db.donations.count_documents({"status": "approved"})
    year = datetime.now().year
    return f"UHF-80G-{year}-{count + 1:04d}"

def create_80g_receipt_pdf(donation: dict, receipt_number: str) -> BytesIO:
    """Generate 80G compliant PDF receipt"""
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Header
    c.setFont("Helvetica-Bold", 20)
    c.drawString(100, height - 80, "United Hands Foundation")
    c.setFont("Helvetica", 10)
    c.drawString(100, height - 100, "Est. 2020 | Vayorang Elderly Care Program")
    c.drawString(100, height - 115, "Registered under Section 80G & 12A")
    
    # Receipt Number
    c.setFont("Helvetica-Bold", 12)
    c.drawString(100, height - 150, f"Receipt No: {receipt_number}")
    
    # Donation Details
    c.setFont("Helvetica", 11)
    y_position = height - 190
    c.drawString(100, y_position, f"Donor Name: {donation['donor_name']}")
    y_position -= 20
    c.drawString(100, y_position, f"Email: {donation['donor_email']}")
    y_position -= 20
    c.drawString(100, y_position, f"Phone: {donation['donor_phone']}")
    y_position -= 20
    c.drawString(100, y_position, f"PAN: {donation['donor_pan']}")
    y_position -= 20
    c.drawString(100, y_position, f"Amount: ₹{donation['amount']}")
    y_position -= 20
    c.drawString(100, y_position, f"UTR: {donation['utr_number']}")
    y_position -= 20
    c.drawString(100, y_position, f"Date: {datetime.now().strftime('%d %B %Y')}")
    
    # 80G Declaration
    y_position -= 40
    c.setFont("Helvetica-Bold", 11)
    c.drawString(100, y_position, "80G Tax Exemption Certificate")
    c.setFont("Helvetica", 9)
    y_position -= 20
    c.drawString(100, y_position, "This donation is eligible for 50% tax deduction under Section 80G of the Income Tax Act, 1961.")
    y_position -= 15
    c.drawString(100, y_position, "PAN: XXXXXXXXXXXXXX | Registration No: XXXXXX")
    
    # Footer
    c.setFont("Helvetica-Oblique", 8)
    c.drawString(100, 50, "Thank you for your generous contribution to United Hands Foundation.")
    
    c.save()
    buffer.seek(0)
    return buffer

async def send_receipt_email(donor_email: str, donor_name: str, receipt_number: str, pdf_buffer: BytesIO):
    """Send 80G receipt via Resend"""
    try:
        import base64
        pdf_base64 = base64.b64encode(pdf_buffer.read()).decode('utf-8')
        
        params = {
            "from": SENDER_EMAIL,
            "to": [donor_email],
            "subject": f"Your 80G Tax Receipt - {receipt_number}",
            "html": f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #D4AF37;">Thank You for Your Donation!</h2>
                    <p>Dear {donor_name},</p>
                    <p>Thank you for your generous contribution to United Hands Foundation. Your support helps us continue our Vayorang Elderly Care program.</p>
                    <p>Please find your 80G tax exemption receipt attached to this email.</p>
                    <p><strong>Receipt Number:</strong> {receipt_number}</p>
                    <p>With gratitude,<br>United Hands Foundation</p>
                </body>
            </html>
            """,
            "attachments": [
                {
                    "filename": f"Receipt_{receipt_number}.pdf",
                    "content": pdf_base64
                }
            ]
        }
        
        email = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Receipt email sent to {donor_email}: {email}")
        return email
    except Exception as e:
        logger.error(f"Failed to send receipt email: {str(e)}")
        raise

# ===== ROUTES =====

@api_router.get("/")
async def root():
    return {"message": "United Hands Foundation API"}

# Cloudinary signature endpoint
@api_router.get("/cloudinary/signature")
async def generate_cloudinary_signature(resource_type: str = "image", folder: str = "uploads"):
    """Generate signed upload parameters for Cloudinary"""
    ALLOWED_FOLDERS = ("donations/", "press/", "uploads/", "success_stories/")
    if not folder.startswith(ALLOWED_FOLDERS):
        raise HTTPException(status_code=400, detail="Invalid folder path")
    
    timestamp = int(time.time())
    params = {
        "timestamp": timestamp,
        "folder": folder,
        "resource_type": resource_type
    }
    
    signature = cloudinary.utils.api_sign_request(
        params,
        os.getenv("CLOUDINARY_API_SECRET")
    )
    
    return {
        "signature": signature,
        "timestamp": timestamp,
        "cloud_name": os.getenv("CLOUDINARY_CLOUD_NAME"),
        "api_key": os.getenv("CLOUDINARY_API_KEY"),
        "folder": folder,
        "resource_type": resource_type
    }

# Donation endpoints
@api_router.post("/donations", response_model=Donation)
async def create_donation(donation: DonationCreate):
    """Create a new donation"""
    donation_obj = Donation(**donation.model_dump())
    doc = donation_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.donations.insert_one(doc)
    return donation_obj

@api_router.get("/donations", response_model=List[Donation])
async def get_donations(status: Optional[str] = None):
    """Get all donations, optionally filtered by status"""
    query = {}
    if status:
        query["status"] = status
    
    donations = await db.donations.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for donation in donations:
        if isinstance(donation['created_at'], str):
            donation['created_at'] = datetime.fromisoformat(donation['created_at'])
    
    return donations

@api_router.post("/donations/approve")
async def approve_donation(approval: DonationApproval):
    """Approve or reject a donation and send 80G receipt if approved"""
    donation = await db.donations.find_one({"id": approval.donation_id}, {"_id": 0})
    
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    if approval.status == "approved":
        # Generate receipt number
        receipt_number = await generate_receipt_number()
        
        # Update donation status
        await db.donations.update_one(
            {"id": approval.donation_id},
            {"$set": {"status": "approved", "receipt_number": receipt_number}}
        )
        
        # Generate PDF
        pdf_buffer = create_80g_receipt_pdf(donation, receipt_number)
        
        # Send email
        try:
            await send_receipt_email(
                donation['donor_email'],
                donation['donor_name'],
                receipt_number,
                pdf_buffer
            )
        except Exception as e:
            logger.error(f"Email sending failed: {str(e)}")
            # Continue even if email fails
        
        return {
            "status": "success",
            "message": "Donation approved and receipt sent",
            "receipt_number": receipt_number
        }
    else:
        await db.donations.update_one(
            {"id": approval.donation_id},
            {"$set": {"status": "rejected"}}
        )
        return {"status": "success", "message": "Donation rejected"}

# Admin settings
@api_router.get("/admin/settings", response_model=AdminSettings)
async def get_admin_settings():
    """Get admin settings"""
    settings = await db.admin_settings.find_one({"id": "settings"}, {"_id": 0})
    
    if not settings:
        # Create default settings
        default_settings = AdminSettings()
        doc = default_settings.model_dump()
        await db.admin_settings.insert_one(doc)
        return default_settings
    
    return AdminSettings(**settings)

@api_router.put("/admin/settings")
async def update_admin_settings(settings: AdminSettings):
    """Update admin settings"""
    await db.admin_settings.update_one(
        {"id": "settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"status": "success", "message": "Settings updated"}

# Success Stories
@api_router.post("/success-stories", response_model=SuccessStory)
async def create_success_story(story: SuccessStoryCreate):
    """Create a new success story"""
    story_obj = SuccessStory(**story.model_dump())
    doc = story_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.success_stories.insert_one(doc)
    return story_obj

@api_router.get("/success-stories", response_model=List[SuccessStory])
async def get_success_stories(limit: int = 10):
    """Get success stories"""
    stories = await db.success_stories.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    
    for story in stories:
        if isinstance(story['created_at'], str):
            story['created_at'] = datetime.fromisoformat(story['created_at'])
    
    return stories

@api_router.post("/ai/extract-story")
async def extract_story_from_pdf(file_path: str = Body(..., embed=True)):
    """Extract success story from PDF using Gemini AI"""
    try:
        # Initialize Gemini chat
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="You are an AI assistant that extracts information from NGO reports and news clippings."
        ).with_model("gemini", "gemini-2.5-flash")
        
        # Create file content
        file_content = FileContentWithMimeType(
            file_path=file_path,
            mime_type="application/pdf"
        )
        
        # Extract information
        user_message = UserMessage(
            text="""Extract the following information from this document:
            1. Location (one of: Dharashiv, Solapur, Latur, Palghar, Panchgani)
            2. Patient Count (number)
            3. Date (in YYYY-MM-DD format)
            4. Generate a 2-3 sentence success story suitable for a homepage
            
            Return ONLY in this JSON format:
            {
                "location": "city name",
                "patient_count": number,
                "date": "YYYY-MM-DD",
                "story": "2-3 sentence story"
            }
            """,
            file_contents=[file_content]
        )
        
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        import json
        result = json.loads(response)
        
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        logger.error(f"AI extraction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Press Media
@api_router.post("/press-media", response_model=PressMedia)
async def create_press_media(media: PressMediaCreate):
    """Create press media entry"""
    media_obj = PressMedia(**media.model_dump())
    doc = media_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.press_media.insert_one(doc)
    return media_obj

@api_router.get("/press-media", response_model=List[PressMedia])
async def get_press_media(district: Optional[str] = None, year: Optional[str] = None):
    """Get press media, optionally filtered"""
    query = {}
    if district:
        query["district"] = district
    if year:
        query["year"] = year
    
    media = await db.press_media.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for item in media:
        if isinstance(item['created_at'], str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    
    return media

# Stats endpoint
@api_router.get("/stats")
async def get_stats():
    """Get impact statistics"""
    total_donations = await db.donations.count_documents({"status": "approved"})
    total_amount = 0
    
    approved_donations = await db.donations.find({"status": "approved"}, {"_id": 0}).to_list(1000)
    for donation in approved_donations:
        total_amount += donation.get('amount', 0)
    
    return {
        "patients_served": 2000,  # Static for now
        "districts_covered": 5,
        "total_donations": total_donations,
        "total_amount": total_amount
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
