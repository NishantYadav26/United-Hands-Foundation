from fastapi import FastAPI, APIRouter, HTTPException, Body, Depends, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import time
import cloudinary
import cloudinary.utils
import cloudinary.uploader
import asyncio
import resend
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from io import BytesIO
import razorpay
import jwt
import bcrypt
import hashlib

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# JWT Configuration
SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'uhf-secret-key-2026-change-in-production')
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hours

# Admin email (only this email can access admin)
ADMIN_EMAIL = 'avdhut456@gmail.com'
ADMIN_NAME = 'Omkar'

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

# Security
security = HTTPBearer()

def delete_cloudinary_image(image_url: str):
    """Delete an image from Cloudinary given its URL."""
    if not image_url or 'res.cloudinary.com' not in image_url:
        return
    try:
        parts = image_url.split('/upload/')
        if len(parts) == 2:
            path = parts[1]
            # Remove version prefix (v1234567890/)
            if path.startswith('v') and '/' in path:
                path = path.split('/', 1)[1]
            # Remove file extension
            public_id = path.rsplit('.', 1)[0]
            cloudinary.uploader.destroy(public_id)
            logger.info(f"Deleted Cloudinary image: {public_id}")
    except Exception as e:
        logger.error(f"Failed to delete Cloudinary image: {e}")

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ===== AUTH MODELS & FUNCTIONS =====

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    pan: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class DonorTrackRequest(BaseModel):
    email: EmailStr
    pan: str

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email != ADMIN_EMAIL:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        return email
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

def verify_user_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role", "user")
        if not email:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return {"email": email, "role": role}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

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
    project_id: Optional[str] = None

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
    project_id: Optional[str] = None
    project_title: Optional[str] = None
    status: str = "pending"
    receipt_number: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = "settings"
    payment_mode: str = "manual_qr"
    qr_code_url: str = ""
    upi_id: str = "unitedhands@upi"
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""
    razorpay_enabled: bool = False
    facebook_url: str = "https://www.facebook.com/share/g/17PHfXpM2Q/"
    instagram_url: str = ""
    youtube_url: str = ""

class DonationApproval(BaseModel):
    donation_id: str
    status: str

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
    category: str = "General"
    images: List[str] = []

class PressMedia(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    publication: str
    district: str
    year: str
    image_url: str
    category: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PressMediaCreate(BaseModel):
    title: str
    publication: str
    district: str
    year: str
    image_url: str
    category: Optional[str] = None

class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    category: str
    description: str
    hero_image: str
    images: List[str] = []
    target_amount: int
    raised_amount: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProjectCreate(BaseModel):
    title: str
    category: str
    description: str
    hero_image: str
    images: List[str] = []
    target_amount: int
    is_active: bool = True

class VideoContent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    video_url: str
    thumbnail_url: str
    category: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VideoContentCreate(BaseModel):
    title: str
    description: str
    video_url: str
    thumbnail_url: str
    category: str

class SiteAsset(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    asset_key: str  # logo, qr_code, hero_bg, founder_1, founder_2, etc.
    asset_url: str
    asset_name: str
    description: Optional[str] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SiteAssetUpdate(BaseModel):
    asset_key: str
    asset_url: str
    asset_name: str
    description: Optional[str] = None

class Pillar(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: str
    bio_brief: str
    bio_detailed: str
    specialty: str
    image_url: str
    category: str  # President, Founder, Team
    display_priority: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PillarCreate(BaseModel):
    name: str
    role: str
    bio_brief: str
    bio_detailed: str
    specialty: str
    image_url: str
    category: str
    display_priority: int = 0

class WorkLocation(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    image_id: Optional[str] = None
    display_priority: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WorkLocationCreate(BaseModel):
    name: str
    description: str
    image_id: Optional[str] = None
    display_priority: int = 0

class LocationImageUpdate(BaseModel):
    image_id: Optional[str] = None

class ImageAsset(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    public_id: str
    url: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    usage_count: int = 1

class ImageUploadResponse(BaseModel):
    id: str
    public_id: str
    url: str
    usage_count: int
    reused: bool

class GalleryImage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    image_url: str
    category: str = "impact"  # impact, field_work, events
    display_priority: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GalleryImageCreate(BaseModel):
    title: str
    description: str
    image_url: str
    category: str = "impact"
    display_priority: int = 0

# ===== HELPER FUNCTIONS =====

def generate_image_hash(file_bytes: bytes) -> str:
    return hashlib.md5(file_bytes).hexdigest()

async def fetch_image_by_id(image_id: str) -> dict:
    image_doc = await db.images.find_one({"id": image_id}, {"_id": 0})
    if not image_doc:
        raise HTTPException(status_code=404, detail="Image not found")
    return image_doc

async def upload_or_reuse_image(file_bytes: bytes, filename: str, folder: str = "uploads") -> dict:
    public_id = generate_image_hash(file_bytes)
    existing_image = await db.images.find_one({"public_id": public_id}, {"_id": 0})

    if existing_image:
        await db.images.update_one({"id": existing_image["id"]}, {"$inc": {"usage_count": 1}})
        existing_image["usage_count"] = existing_image.get("usage_count", 0) + 1
        existing_image["reused"] = True
        return existing_image

    try:
        upload_result = await asyncio.to_thread(
            cloudinary.uploader.upload,
            file_bytes,
            folder=folder,
            public_id=public_id,
            overwrite=False,
            unique_filename=False,
            resource_type="image",
            filename=filename
        )
    except Exception as exc:
        logger.error(f"Cloudinary upload failed: {exc}")
        raise HTTPException(status_code=502, detail="Failed to upload image to Cloudinary")

    image_asset = ImageAsset(public_id=public_id, url=upload_result["secure_url"], usage_count=1)
    image_doc = image_asset.model_dump()
    image_doc["created_at"] = image_doc["created_at"].isoformat()
    await db.images.insert_one(image_doc)

    image_doc["reused"] = False
    return image_doc

async def decrement_image_usage(image_id: str):
    image_doc = await fetch_image_by_id(image_id)
    current_usage = max(0, image_doc.get("usage_count", 0))
    next_usage = current_usage - 1

    if next_usage > 0:
        await db.images.update_one({"id": image_id}, {"$set": {"usage_count": next_usage}})
        return

    try:
        await asyncio.to_thread(cloudinary.uploader.destroy, image_doc["public_id"], resource_type="image")
    except Exception as exc:
        logger.error(f"Failed to delete Cloudinary image '{image_doc['public_id']}': {exc}")
        raise HTTPException(status_code=502, detail="Failed to delete image from Cloudinary")

    await db.images.delete_one({"id": image_id})

async def generate_receipt_number():
    count = await db.donations.count_documents({"status": "approved"})
    year = datetime.now().year
    return f"UHF-80G-{year}-{count + 1:04d}"

def create_80g_receipt_pdf(donation: dict, receipt_number: str) -> BytesIO:
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    c.setFont("Helvetica-Bold", 20)
    c.drawString(100, height - 80, "United Hands Foundation")
    c.setFont("Helvetica", 10)
    c.drawString(100, height - 100, "TA JI LATUR | Est. 2020 | Healthcare, Education & Community Service")
    c.drawString(100, height - 115, "New Bhagya Nagar, Ring Road, Latur, Maharashtra - 413512")
    
    c.setFont("Helvetica-Bold", 9)
    c.drawString(100, height - 135, "PAN: AABTU0797K | 12A: AABTU0797KE20231 | 80G: AABTU0797KF20231")
    c.drawString(100, height - 150, "Societies Reg: Latur/0000171/2020 | Registered: 04/08/2020")
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(100, height - 180, f"Receipt No: {receipt_number}")
    
    c.setFont("Helvetica", 11)
    y_position = height - 220
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
    
    if donation.get('project_title'):
        c.drawString(100, y_position, f"Donated to: {donation['project_title']}")
        y_position -= 20
    
    c.drawString(100, y_position, f"Date: {datetime.now().strftime('%d %B %Y')}")
    
    y_position -= 40
    c.setFont("Helvetica-Bold", 11)
    c.drawString(100, y_position, "80G Tax Exemption Certificate")
    c.setFont("Helvetica", 9)
    y_position -= 20
    c.drawString(100, y_position, "This donation is eligible for 50% tax deduction under Section 80G of the Income Tax Act, 1961.")
    y_position -= 15
    c.drawString(100, y_position, "80G Registration: AABTU0797KF20231 (Valid up to AY 2026-27)")
    y_position -= 15
    c.drawString(100, y_position, "12A Registration: AABTU0797KE20231 (Provisional)")
    
    c.setFont("Helvetica-Oblique", 8)
    c.drawString(100, 50, "Thank you for your generous contribution to United Hands Foundation.")
    c.drawString(100, 35, "For queries: unitedhandsfoundation4@gmail.com")
    
    c.save()
    buffer.seek(0)
    return buffer

async def send_receipt_email(donor_email: str, donor_name: str, receipt_number: str, pdf_buffer: BytesIO):
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
                    <p>Thank you for your generous contribution to United Hands Foundation. Your support helps us continue our healthcare, education, disaster relief, and community service programs.</p>
                    <p>Please find your 80G tax exemption receipt attached to this email.</p>
                    <p><strong>Receipt Number:</strong> {receipt_number}</p>
                    <p>With gratitude,<br>United Hands Foundation<br>New Bhagya Nagar, Ring Road, Latur, Maharashtra - 413512</p>
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

# ===== AUTH ROUTES =====

@api_router.post("/auth/admin-login", response_model=Token)
async def admin_login(login: AdminLogin):
    if login.email != ADMIN_EMAIL:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    admin = await db.admin_users.find_one({"email": ADMIN_EMAIL}, {"_id": 0})
    
    if not admin:
        hashed = bcrypt.hashpw(login.password.encode('utf-8'), bcrypt.gensalt())
        admin_doc = {
            "email": ADMIN_EMAIL,
            "password": hashed.decode('utf-8'),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.admin_users.insert_one(admin_doc)
        access_token = create_access_token(data={"sub": ADMIN_EMAIL})
        return {"access_token": access_token, "token_type": "bearer"}
    
    if not bcrypt.checkpw(login.password.encode('utf-8'), admin.get('password', '').encode('utf-8')):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": ADMIN_EMAIL})
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.post("/donor/track")
async def track_donations(request: DonorTrackRequest):
    donations = await db.donations.find(
        {
            "donor_email": request.email,
            "donor_pan": request.pan,
            "status": "approved"
        },
        {"_id": 0}
    ).to_list(1000)
    
    for donation in donations:
        if isinstance(donation['created_at'], str):
            donation['created_at'] = datetime.fromisoformat(donation['created_at'])
    
    return {"donations": donations}

# ===== USER AUTH ROUTES =====

@api_router.post("/auth/register")
async def user_register(user: UserRegister):
    existing = await db.users.find_one({"email": user.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    user_doc = {
        "id": str(uuid.uuid4()),
        "name": user.name,
        "email": user.email,
        "password": hashed.decode('utf-8'),
        "phone": user.phone or "",
        "pan": user.pan or "",
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    access_token = create_access_token(data={"sub": user.email, "role": "user", "name": user.name})
    return {"access_token": access_token, "token_type": "bearer", "user": {"name": user.name, "email": user.email, "role": "user"}}

@api_router.post("/auth/login")
async def user_login(login: UserLogin):
    # Check if this is an admin login
    if login.email == ADMIN_EMAIL:
        admin = await db.admin_users.find_one({"email": ADMIN_EMAIL}, {"_id": 0})
        if not admin:
            # First admin login - create admin record
            hashed = bcrypt.hashpw(login.password.encode('utf-8'), bcrypt.gensalt())
            admin_doc = {
                "email": ADMIN_EMAIL,
                "password": hashed.decode('utf-8'),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.admin_users.insert_one(admin_doc)
            access_token = create_access_token(data={"sub": ADMIN_EMAIL, "role": "admin", "name": ADMIN_NAME})
            return {"access_token": access_token, "token_type": "bearer", "user": {"name": ADMIN_NAME, "email": ADMIN_EMAIL, "role": "admin"}}
        
        if not bcrypt.checkpw(login.password.encode('utf-8'), admin.get('password', '').encode('utf-8')):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        access_token = create_access_token(data={"sub": ADMIN_EMAIL, "role": "admin", "name": ADMIN_NAME})
        return {"access_token": access_token, "token_type": "bearer", "user": {"name": ADMIN_NAME, "email": ADMIN_EMAIL, "role": "admin"}}
    
    # Regular user login
    user = await db.users.find_one({"email": login.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not bcrypt.checkpw(login.password.encode('utf-8'), user['password'].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": user['email'], "role": "user", "name": user['name']})
    return {"access_token": access_token, "token_type": "bearer", "user": {"name": user['name'], "email": user['email'], "role": "user"}}

@api_router.get("/auth/me")
async def get_current_user(user_data: dict = Depends(verify_user_token)):
    user = await db.users.find_one({"email": user_data["email"]}, {"_id": 0, "password": 0})
    if not user:
        if user_data["email"] == ADMIN_EMAIL:
            return {"name": ADMIN_NAME, "email": ADMIN_EMAIL, "role": "admin"}
        raise HTTPException(status_code=404, detail="User not found")
    return {"name": user["name"], "email": user["email"], "role": user.get("role", "user")}

@api_router.get("/user/donations")
async def get_user_donations(user_data: dict = Depends(verify_user_token)):
    donations = await db.donations.find(
        {"donor_email": user_data["email"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    for donation in donations:
        if isinstance(donation.get('created_at'), str):
            donation['created_at'] = datetime.fromisoformat(donation['created_at'])
    
    return {"donations": donations}

# ===== ROUTES =====

@api_router.get("/")
async def root():
    return {"message": "United Hands Foundation API"}

@api_router.get("/cloudinary/signature")
async def generate_cloudinary_signature(resource_type: str = "image", folder: str = "uploads"):
    ALLOWED_FOLDERS = ("donations", "press", "uploads", "success_stories", "qr_codes", "videos", "projects", "gallery", "site_assets", "team_pillars")
    folder_base = folder.rstrip("/")
    if folder_base not in ALLOWED_FOLDERS:
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

@api_router.post("/images/upload", response_model=ImageUploadResponse)
async def upload_image(
    image_file: UploadFile = File(...),
    folder: str = Form("uploads"),
    admin_email: str = Depends(verify_token)
):
    if not image_file.content_type or not image_file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    file_bytes = await image_file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty file upload is not allowed")

    image_doc = await upload_or_reuse_image(file_bytes=file_bytes, filename=image_file.filename or "upload", folder=folder)
    return ImageUploadResponse(
        id=image_doc["id"],
        public_id=image_doc["public_id"],
        url=image_doc["url"],
        usage_count=image_doc["usage_count"],
        reused=image_doc["reused"]
    )

@api_router.get("/images/{image_id}", response_model=ImageAsset)
async def get_image(image_id: str):
    image_doc = await fetch_image_by_id(image_id)
    if isinstance(image_doc.get("created_at"), str):
        image_doc["created_at"] = datetime.fromisoformat(image_doc["created_at"])
    return ImageAsset(**image_doc)

@api_router.delete("/images/{image_id}")
async def delete_image_safely(image_id: str, admin_email: str = Depends(verify_token)):
    await decrement_image_usage(image_id)
    return {"status": "success", "message": "Image usage decremented (deleted from Cloudinary if unused)"}

@api_router.post("/donations", response_model=Donation)
async def create_donation(donation: DonationCreate):
    donation_obj = Donation(**donation.model_dump())
    
    if donation.project_id:
        project = await db.projects.find_one({"id": donation.project_id}, {"_id": 0})
        if project:
            donation_obj.project_title = project['title']
    
    doc = donation_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.donations.insert_one(doc)
    return donation_obj

@api_router.get("/donations", response_model=List[Donation])
async def get_donations(status: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    
    donations = await db.donations.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for donation in donations:
        if isinstance(donation['created_at'], str):
            donation['created_at'] = datetime.fromisoformat(donation['created_at'])
    
    return donations

@api_router.post("/donations/approve")
async def approve_donation(approval: DonationApproval, admin_email: str = Depends(verify_token)):
    donation = await db.donations.find_one({"id": approval.donation_id}, {"_id": 0})
    
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    if approval.status == "approved":
        receipt_number = await generate_receipt_number()
        
        await db.donations.update_one(
            {"id": approval.donation_id},
            {"$set": {"status": "approved", "receipt_number": receipt_number}}
        )
        
        if donation.get('project_id'):
            await db.projects.update_one(
                {"id": donation['project_id']},
                {"$inc": {"raised_amount": donation['amount']}}
            )
        
        pdf_buffer = create_80g_receipt_pdf(donation, receipt_number)
        
        try:
            await send_receipt_email(
                donation['donor_email'],
                donation['donor_name'],
                receipt_number,
                pdf_buffer
            )
            return {
                "status": "success",
                "message": "Donation approved and receipt sent",
                "receipt_number": receipt_number
            }
        except Exception as e:
            logger.error(f"Email sending failed: {str(e)}")
            return {
                "status": "success",
                "message": f"Donation approved but email failed: {str(e)}",
                "receipt_number": receipt_number
            }
    else:
        await db.donations.update_one(
            {"id": approval.donation_id},
            {"$set": {"status": "rejected"}}
        )
        return {"status": "success", "message": "Donation rejected"}

@api_router.get("/donations/{donation_id}/receipt")
async def download_receipt(donation_id: str):
    donation = await db.donations.find_one({"id": donation_id}, {"_id": 0})
    
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    if donation['status'] != 'approved' or not donation.get('receipt_number'):
        raise HTTPException(status_code=400, detail="Receipt not available")
    
    pdf_buffer = create_80g_receipt_pdf(donation, donation['receipt_number'])
    
    from fastapi.responses import StreamingResponse
    return StreamingResponse(
        pdf_buffer,
        media_type='application/pdf',
        headers={"Content-Disposition": f"attachment; filename=Receipt_{donation['receipt_number']}.pdf"}
    )

@api_router.get("/admin/settings", response_model=AdminSettings)
async def get_admin_settings():
    settings = await db.admin_settings.find_one({"id": "settings"}, {"_id": 0})
    
    if not settings:
        default_settings = AdminSettings()
        doc = default_settings.model_dump()
        await db.admin_settings.insert_one(doc)
        return default_settings
    
    return AdminSettings(**settings)

@api_router.put("/admin/settings")
async def update_admin_settings(settings: AdminSettings, admin_email: str = Depends(verify_token)):
    await db.admin_settings.update_one(
        {"id": "settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"status": "success", "message": "Settings updated"}

@api_router.post("/success-stories", response_model=SuccessStory)
async def create_success_story(story: SuccessStoryCreate, admin_email: str = Depends(verify_token)):
    story_obj = SuccessStory(**story.model_dump())
    doc = story_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.success_stories.insert_one(doc)
    return story_obj

@api_router.get("/success-stories", response_model=List[SuccessStory])
async def get_success_stories(limit: int = 50):
    stories = await db.success_stories.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    
    for story in stories:
        if isinstance(story['created_at'], str):
            story['created_at'] = datetime.fromisoformat(story['created_at'])
    
    return stories

@api_router.put("/success-stories/{story_id}")
async def update_success_story(story_id: str, story: SuccessStoryCreate, admin_email: str = Depends(verify_token)):
    await db.success_stories.update_one({"id": story_id}, {"$set": story.model_dump()})
    return {"status": "success", "message": "Story updated"}

@api_router.delete("/success-stories/{story_id}")
async def delete_success_story(story_id: str, admin_email: str = Depends(verify_token)):
    result = await db.success_stories.delete_one({"id": story_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Story not found")
    return {"status": "success", "message": "Story deleted"}

# ===== RAZORPAY PAYMENT =====

@api_router.post("/razorpay/create-order")
async def create_razorpay_order(data: dict = Body(...)):
    settings = await db.admin_settings.find_one({"id": "settings"}, {"_id": 0})
    if not settings or not settings.get("razorpay_key_id") or not settings.get("razorpay_key_secret"):
        raise HTTPException(status_code=400, detail="Razorpay not configured")
    
    import razorpay
    try:
        client = razorpay.Client(auth=(settings["razorpay_key_id"], settings["razorpay_key_secret"]))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Razorpay credentials")
    
    amount_paise = int(data.get("amount", 0)) * 100
    if amount_paise < 100:
        raise HTTPException(status_code=400, detail="Minimum amount is ₹1")
    
    try:
        order = client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "payment_capture": 1,
            "notes": {
                "donor_name": data.get("donor_name", ""),
                "donor_email": data.get("donor_email", ""),
                "project_id": data.get("project_id", "")
            }
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Razorpay error: {str(e)}")
    
    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "key_id": settings["razorpay_key_id"]
    }

@api_router.post("/razorpay/verify")
async def verify_razorpay_payment(data: dict = Body(...)):
    settings = await db.admin_settings.find_one({"id": "settings"}, {"_id": 0})
    if not settings or not settings.get("razorpay_key_id") or not settings.get("razorpay_key_secret"):
        raise HTTPException(status_code=400, detail="Razorpay not configured")
    
    import razorpay
    client = razorpay.Client(auth=(settings["razorpay_key_id"], settings["razorpay_key_secret"]))
    
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": data.get("razorpay_order_id"),
            "razorpay_payment_id": data.get("razorpay_payment_id"),
            "razorpay_signature": data.get("razorpay_signature")
        })
    except Exception:
        raise HTTPException(status_code=400, detail="Payment verification failed")
    
    # Auto-create and approve donation
    donation_doc = {
        "id": str(uuid.uuid4()),
        "donor_name": data.get("donor_name", ""),
        "donor_email": data.get("donor_email", ""),
        "donor_phone": data.get("donor_phone", ""),
        "donor_pan": data.get("donor_pan", ""),
        "amount": data.get("amount", 0),
        "utr_number": data.get("razorpay_payment_id"),
        "project_id": data.get("project_id", ""),
        "status": "approved",
        "payment_method": "razorpay",
        "razorpay_order_id": data.get("razorpay_order_id"),
        "razorpay_payment_id": data.get("razorpay_payment_id"),
        "screenshot_url": "",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.donations.insert_one(donation_doc)
    
    return {"status": "success", "message": "Payment verified and donation recorded", "donation_id": donation_doc["id"]}

@api_router.post("/press-media", response_model=PressMedia)
async def create_press_media(media: PressMediaCreate):
    media_obj = PressMedia(**media.model_dump())
    doc = media_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.press_media.insert_one(doc)
    return media_obj

@api_router.get("/press-media", response_model=List[PressMedia])
async def get_press_media(district: Optional[str] = None, year: Optional[str] = None):
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

@api_router.post("/projects", response_model=Project)
async def create_project(project: ProjectCreate):
    project_obj = Project(**project.model_dump())
    doc = project_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.projects.insert_one(doc)
    return project_obj

@api_router.get("/projects", response_model=List[Project])
async def get_projects(active_only: bool = False):
    query = {}
    if active_only:
        query["is_active"] = True
    
    projects = await db.projects.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for project in projects:
        if isinstance(project['created_at'], str):
            project['created_at'] = datetime.fromisoformat(project['created_at'])
    
    return projects

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if isinstance(project['created_at'], str):
        project['created_at'] = datetime.fromisoformat(project['created_at'])
    
    return Project(**project)

@api_router.get("/projects/{project_id}/images", response_model=List[str])
async def get_project_images(project_id: str):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0, "images": 1, "hero_image": 1})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    images = project.get("images") or []
    if not images and project.get("hero_image"):
        images = [project["hero_image"]]
    return images

@api_router.put("/projects/{project_id}")
async def update_project(project_id: str, project: ProjectCreate, admin_email: str = Depends(verify_token)):
    old = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if old and old.get('hero_image') and old['hero_image'] != project.hero_image:
        delete_cloudinary_image(old['hero_image'])
    await db.projects.update_one(
        {"id": project_id},
        {"$set": project.model_dump()}
    )
    return {"status": "success", "message": "Project updated"}

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, admin_email: str = Depends(verify_token)):
    old = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if old:
        delete_cloudinary_image(old.get('hero_image', ''))
    result = await db.projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"status": "success", "message": "Project deleted"}

@api_router.post("/videos", response_model=VideoContent)
async def create_video(video: VideoContentCreate, admin_email: str = Depends(verify_token)):
    video_obj = VideoContent(**video.model_dump())
    doc = video_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.videos.insert_one(doc)
    return video_obj

@api_router.get("/videos", response_model=List[VideoContent])
async def get_videos():
    videos = await db.videos.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for video in videos:
        if isinstance(video['created_at'], str):
            video['created_at'] = datetime.fromisoformat(video['created_at'])
    
    return videos

@api_router.delete("/videos/{video_id}")
async def delete_video(video_id: str, admin_email: str = Depends(verify_token)):
    result = await db.videos.delete_one({"id": video_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Video not found")
    return {"status": "success", "message": "Video deleted"}

# Site Assets Management (CMS)
@api_router.get("/site-assets")
async def get_site_assets():
    """Get all site assets for CMS"""
    assets = await db.site_assets.find({}, {"_id": 0}).to_list(1000)
    
    for asset in assets:
        if isinstance(asset.get('updated_at'), str):
            asset['updated_at'] = datetime.fromisoformat(asset['updated_at'])
    
    return {"assets": assets}

@api_router.get("/site-assets/{asset_key}")
async def get_site_asset(asset_key: str):
    """Get specific site asset by key"""
    asset = await db.site_assets.find_one({"asset_key": asset_key}, {"_id": 0})
    
    if not asset:
        return {"asset_key": asset_key, "asset_url": "", "asset_name": "Not Set"}
    
    if isinstance(asset.get('updated_at'), str):
        asset['updated_at'] = datetime.fromisoformat(asset['updated_at'])
    
    return asset

@api_router.post("/site-assets", response_model=SiteAsset)
async def update_site_asset(asset: SiteAssetUpdate, admin_email: str = Depends(verify_token)):
    """Update or create a site asset"""
    # Delete old Cloudinary image if exists
    old_asset = await db.site_assets.find_one({"asset_key": asset.asset_key}, {"_id": 0})
    if old_asset and old_asset.get('asset_url') and old_asset['asset_url'] != asset.asset_url:
        delete_cloudinary_image(old_asset['asset_url'])
    
    asset_obj = SiteAsset(**asset.model_dump())
    doc = asset_obj.model_dump()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.site_assets.update_one(
        {"asset_key": asset.asset_key},
        {"$set": doc},
        upsert=True
    )
    
    return asset_obj

@api_router.post("/seed/site-assets")
async def seed_site_assets():
    """Seed default site assets"""
    default_assets = [
        {
            "asset_key": "logo",
            "asset_url": "https://customer-assets.emergentagent.com/job_hands-omni-platform/artifacts/p9nc55rj_WhatsApp%20Image%202026-03-29%20at%2017.08.49.jpeg",
            "asset_name": "UHF Logo",
            "description": "Official United Hands Foundation logo with laurel wreath"
        },
        {
            "asset_key": "qr_code",
            "asset_url": "https://customer-assets.emergentagent.com/job_hands-omni-platform/artifacts/g8ji028s_WhatsApp%20Image%202026-03-29%20at%2017.12.39.jpeg",
            "asset_name": "GPay QR Code",
            "description": "Google Pay QR code for donations"
        },
        {
            "asset_key": "hero_background",
            "asset_url": "https://customer-assets.emergentagent.com/job_hands-omni-platform/artifacts/p87903ja_WhatsApp%20Image%202026-03-29%20at%2014.49.29.jpeg",
            "asset_name": "Hero Background",
            "description": "Main hero section background"
        },
        {
            "asset_key": "founder_1",
            "asset_url": "",
            "asset_name": "Dr. Rahul Sarwade",
            "description": "Co-Founder photo (upload via admin)"
        },
        {
            "asset_key": "founder_2",
            "asset_url": "",
            "asset_name": "Dr. Jagruti Hankare",
            "description": "Co-Founder photo (upload via admin)"
        },
        {
            "asset_key": "center_photo",
            "asset_url": "https://customer-assets.emergentagent.com/job_hands-omni-platform/artifacts/p87903ja_WhatsApp%20Image%202026-03-29%20at%2014.49.29.jpeg",
            "asset_name": "UHF Daycare Center",
            "description": "Geriatric Daycare Health Center"
        }
    ]
    
    for asset_data in default_assets:
        asset_obj = SiteAsset(**asset_data)
        doc = asset_obj.model_dump()
        doc['updated_at'] = doc['updated_at'].isoformat()
        
        await db.site_assets.update_one(
            {"asset_key": asset_data["asset_key"]},
            {"$set": doc},
            upsert=True
        )
    
    return {"status": "success", "message": f"Seeded {len(default_assets)} default assets"}

# Team Pillars Management
@api_router.get("/pillars", response_model=List[Pillar])
async def get_pillars():
    """Get all team pillars"""
    pillars = await db.pillars.find({}, {"_id": 0}).sort("display_priority", 1).to_list(1000)
    
    for pillar in pillars:
        if isinstance(pillar.get('created_at'), str):
            pillar['created_at'] = datetime.fromisoformat(pillar['created_at'])
    
    return pillars

@api_router.post("/pillars", response_model=Pillar)
async def create_pillar(pillar: PillarCreate, admin_email: str = Depends(verify_token)):
    """Create a new pillar"""
    pillar_obj = Pillar(**pillar.model_dump())
    doc = pillar_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.pillars.insert_one(doc)
    return pillar_obj

@api_router.put("/pillars/{pillar_id}")
async def update_pillar(pillar_id: str, pillar: PillarCreate, admin_email: str = Depends(verify_token)):
    """Update a pillar"""
    old = await db.pillars.find_one({"id": pillar_id}, {"_id": 0})
    if old and old.get('image_url') and old['image_url'] != pillar.image_url:
        delete_cloudinary_image(old['image_url'])
    await db.pillars.update_one(
        {"id": pillar_id},
        {"$set": pillar.model_dump()}
    )
    return {"status": "success", "message": "Pillar updated"}

@api_router.delete("/pillars/{pillar_id}")
async def delete_pillar(pillar_id: str, admin_email: str = Depends(verify_token)):
    """Delete a pillar"""
    old = await db.pillars.find_one({"id": pillar_id}, {"_id": 0})
    if old:
        delete_cloudinary_image(old.get('image_url', ''))
    result = await db.pillars.delete_one({"id": pillar_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pillar not found")
    return {"status": "success", "message": "Pillar deleted"}

@api_router.post("/seed/pillars")
async def seed_pillars():
    """Seed default team pillars"""
    default_pillars = [
        {
            "name": "Dr. Rahul Sarwade",
            "role": "President",
            "bio_brief": "Former Government of India medical officer leading strategic vision",
            "bio_detailed": "As the President of UHF, Dr. Rahul Sarwade provides the strategic vision that transforms clinical medicine into a community movement. He specializes in building institutional partnerships that ensure long-term sustainability for our 5 Pillars of Impact.",
            "specialty": "Humanitarian Vision & Strategic Governance",
            "image_url": "",
            "category": "President",
            "display_priority": 1
        },
        {
            "name": "Dr. Jagruti Hankare",
            "role": "Co-Founder & Chief Medical Officer",
            "bio_brief": "Dedicated healthcare professional leading Vayorang elderly care",
            "bio_detailed": "A dedicated medical practitioner leading our Vayorang elderly care initiative. Dr. Jagruti ensures that every medical camp is executed with clinical precision and deep empathy for the marginalized.",
            "specialty": "Geriatric Care & Rural Health Outreach",
            "image_url": "",
            "category": "Founder",
            "display_priority": 2
        },
        {
            "name": "Field Operations Team",
            "role": "Our Ground Force",
            "bio_brief": "Community support and distribution across Maharashtra",
            "bio_detailed": "The heartbeat of UHF. Our team members manage the day-to-day operations in the field—from Latur to Solapur—ensuring relief reaches the last person in line.",
            "specialty": "Community Support & Distribution",
            "image_url": "https://customer-assets.emergentagent.com/job_hands-omni-platform/artifacts/p87903ja_WhatsApp%20Image%202026-03-29%20at%2014.49.29.jpeg",
            "category": "Team",
            "display_priority": 3
        }
    ]
    
    await db.pillars.delete_many({})
    
    for pillar_data in default_pillars:
        pillar_obj = Pillar(**pillar_data)
        doc = pillar_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.pillars.insert_one(doc)
    
    return {"status": "success", "message": f"Seeded {len(default_pillars)} default pillars"}

# Work Locations Management
@api_router.get("/locations", response_model=List[WorkLocation])
async def get_locations():
    """Get all work locations"""
    locations = await db.locations.find({}, {"_id": 0}).sort("display_priority", 1).to_list(1000)

    for location in locations:
        if isinstance(location.get('created_at'), str):
            location['created_at'] = datetime.fromisoformat(location['created_at'])

    return locations

@api_router.post("/locations", response_model=WorkLocation)
async def create_location(location: WorkLocationCreate, admin_email: str = Depends(verify_token)):
    """Create a new work location"""
    if location.image_id:
        await fetch_image_by_id(location.image_id)
    location_obj = WorkLocation(**location.model_dump())
    doc = location_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()

    await db.locations.insert_one(doc)
    return location_obj

@api_router.put("/locations/{location_id}")
async def update_location(location_id: str, location: WorkLocationCreate, admin_email: str = Depends(verify_token)):
    """Update a work location"""
    old_location = await db.locations.find_one({"id": location_id}, {"_id": 0, "image_id": 1})
    if not old_location:
        raise HTTPException(status_code=404, detail="Location not found")

    if location.image_id:
        await fetch_image_by_id(location.image_id)

    if old_location.get("image_id") and old_location.get("image_id") != location.image_id:
        await decrement_image_usage(old_location["image_id"])

    await db.locations.update_one(
        {"id": location_id},
        {"$set": location.model_dump()}
    )
    return {"status": "success", "message": "Location updated"}

@api_router.put("/locations/{location_id}/image")
async def update_location_image_reference(location_id: str, payload: LocationImageUpdate, admin_email: str = Depends(verify_token)):
    old_location = await db.locations.find_one({"id": location_id}, {"_id": 0, "image_id": 1})
    if not old_location:
        raise HTTPException(status_code=404, detail="Location not found")

    if payload.image_id:
        await fetch_image_by_id(payload.image_id)

    if old_location.get("image_id") and old_location.get("image_id") != payload.image_id:
        await decrement_image_usage(old_location["image_id"])

    await db.locations.update_one(
        {"id": location_id},
        {"$set": {"image_id": payload.image_id}}
    )
    return {"status": "success", "message": "Location image updated"}

@api_router.delete("/locations/{location_id}")
async def delete_location(location_id: str, admin_email: str = Depends(verify_token)):
    """Delete a work location"""
    old_location = await db.locations.find_one({"id": location_id}, {"_id": 0, "image_id": 1})
    if old_location and old_location.get("image_id"):
        await decrement_image_usage(old_location["image_id"])

    result = await db.locations.delete_one({"id": location_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Location not found")
    return {"status": "success", "message": "Location deleted"}

@api_router.post("/seed/locations")
async def seed_locations():
    """Seed default work locations"""
    default_locations = [
        {"name": "Dharashiv", "description": "Medical camps & elderly care", "display_priority": 1},
        {"name": "Solapur", "description": "Education & health awareness", "display_priority": 2},
        {"name": "Latur", "description": "Headquarters & community hub", "display_priority": 3},
        {"name": "Palghar", "description": "Tribal healthcare outreach", "display_priority": 4},
        {"name": "Panchgani", "description": "Rural health programs", "display_priority": 5}
    ]

    await db.locations.delete_many({})

    for location_data in default_locations:
        location_obj = WorkLocation(**location_data)
        doc = location_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.locations.insert_one(doc)

    return {"status": "success", "message": f"Seeded {len(default_locations)} default locations"}

# Gallery Management (Heartiest Moments)
@api_router.get("/gallery", response_model=List[GalleryImage])
async def get_gallery_images():
    """Get all gallery images"""
    images = await db.gallery.find({}, {"_id": 0}).sort("display_priority", 1).to_list(1000)
    
    for image in images:
        if isinstance(image.get('created_at'), str):
            image['created_at'] = datetime.fromisoformat(image['created_at'])
    
    return images

@api_router.post("/gallery", response_model=GalleryImage)
async def create_gallery_image(image: GalleryImageCreate, admin_email: str = Depends(verify_token)):
    """Create a new gallery image"""
    image_obj = GalleryImage(**image.model_dump())
    doc = image_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.gallery.insert_one(doc)
    return image_obj

@api_router.put("/gallery/{image_id}")
async def update_gallery_image(image_id: str, image: GalleryImageCreate, admin_email: str = Depends(verify_token)):
    """Update a gallery image"""
    old = await db.gallery.find_one({"id": image_id}, {"_id": 0})
    if old and old.get('image_url') and old['image_url'] != image.image_url:
        delete_cloudinary_image(old['image_url'])
    await db.gallery.update_one(
        {"id": image_id},
        {"$set": image.model_dump()}
    )
    return {"status": "success", "message": "Gallery image updated"}

@api_router.delete("/gallery/{image_id}")
async def delete_gallery_image(image_id: str, admin_email: str = Depends(verify_token)):
    """Delete a gallery image"""
    old = await db.gallery.find_one({"id": image_id}, {"_id": 0})
    if old:
        delete_cloudinary_image(old.get('image_url', ''))
    result = await db.gallery.delete_one({"id": image_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Gallery image not found")
    return {"status": "success", "message": "Gallery image deleted"}

@api_router.get("/stats")
async def get_stats():
    total_donations = await db.donations.count_documents({"status": "approved"})
    total_amount = 0
    
    approved_donations = await db.donations.find({"status": "approved"}, {"_id": 0}).to_list(1000)
    for donation in approved_donations:
        total_amount += donation.get('amount', 0)
    
    return {
        "patients_served": 2000,
        "districts_covered": 5,
        "total_donations": total_donations,
        "total_amount": total_amount
    }

@api_router.post("/seed/projects")
async def seed_projects():
    default_projects = [
        {
            "title": "Vayorang Elderly Care",
            "category": "Elderly",
            "description": "Comprehensive geriatric daycare program providing medical care, companionship, and dignity to senior citizens across Maharashtra.",
            "hero_image": "https://images.unsplash.com/photo-1752084794888-0b27a762b6fd?w=1200&q=85",
            "target_amount": 500000,
            "raised_amount": 0,
            "is_active": True
        },
        {
            "title": "Child Education Support",
            "category": "Education",
            "description": "Providing quality education, books, and learning materials to underprivileged children in rural Maharashtra.",
            "hero_image": "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=1200&q=85",
            "target_amount": 300000,
            "raised_amount": 0,
            "is_active": True
        },
        {
            "title": "Healthcare for All",
            "category": "Health",
            "description": "Mobile medical camps and health checkups for communities with limited access to healthcare facilities.",
            "hero_image": "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=1200&q=85",
            "target_amount": 400000,
            "raised_amount": 0,
            "is_active": True
        },
        {
            "title": "Disaster Relief Fund",
            "category": "Disaster Relief",
            "description": "Emergency response and relief for communities affected by natural disasters across Maharashtra.",
            "hero_image": "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&q=85",
            "target_amount": 1000000,
            "raised_amount": 0,
            "is_active": True
        },
        {
            "title": "General Fund",
            "category": "General",
            "description": "Support our overall mission and operations to continue serving communities across all our programs.",
            "hero_image": "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200&q=85",
            "target_amount": 200000,
            "raised_amount": 0,
            "is_active": True
        }
    ]
    
    await db.projects.delete_many({})
    
    for proj_data in default_projects:
        project_obj = Project(**proj_data)
        doc = project_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.projects.insert_one(doc)
    
    return {"status": "success", "message": f"Seeded {len(default_projects)} default projects"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def ensure_indexes():
    await db.images.create_index("id", unique=True)
    await db.images.create_index("public_id", unique=True)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
