# United Hands Foundation - Omni-Platform PRD

## Original Problem Statement
Build a production-grade NGO ecosystem for United Hands Foundation using React, FastAPI, MongoDB Atlas. Multi-Cause Architecture, Admin CMS, Dual-mode payments (Manual QR + Razorpay), 80G Receipts via Resend, AI Chief of Staff (Gemini), Identity Lock CSS.

## Architecture
- **Frontend**: React + Tailwind + Shadcn/UI + GSAP
- **Backend**: FastAPI + Motor (MongoDB Atlas) + JWT Auth
- **Database**: MongoDB Atlas (cluster0.qrcpjs1.mongodb.net)
- **File Storage**: Cloudinary (dvmb3mzcy, preset: uhf_unsigned)
- **Email**: Resend (real key active)
- **AI**: Gemini 2.5 Flash via emergentintegrations
- **Payments**: Razorpay SDK (admin-configurable keys)

## Color Palette (Royal, Calm, Trustworthy)
- Royal Navy: #0B1F3A
- Midnight Blue: #102A43
- Royal Gold: #C6A15B
- Soft Teal: #3FA7A3
- Ivory: #F5F3EE
- Muted Gray: #A7B1BC

## Implemented (as of March 30, 2026)

### Public Pages
- [x] Homepage: Hero with dynamic background from CMS, Heartiest Moments, Impact Stats, Founders/Pillars, Stories
- [x] About Us: Dynamic CMS page - Mission/Vision, Founders, Field Work photos, Pillars, Locations, Legal
- [x] Donate: Dual-mode (Manual QR default, Razorpay when admin enables)
- [x] Press & Media: Press Clippings + Video Clips (YouTube/Facebook/Instagram)
- [x] Transparency: FCRA Compliance + Legally Registered NGO banner (document cards removed per user request)
- [x] Track My Impact
- [x] Unified Login/Register (/login)

### Admin Dashboard (10 CMS Tabs)
- [x] **Donations**: Approve/Reject + 80G receipt email via Resend
- [x] **Projects**: Full CRUD + Cloudinary + auto-cleanup
- [x] **Gallery**: "Heartiest Moments" CRUD + auto-cleanup
- [x] **Media Library**: Site assets (logo, QR, founders, hero)
- [x] **Team Pillars**: Team members + photos
- [x] **Videos**: YouTube/Facebook/Instagram clips CRUD
- [x] **AI Staff**: PDF/image upload -> Gemini extraction -> Save as Story/Press
- [x] **Stories**: Success Stories full CRUD (add/edit/delete)
- [x] **Settings**: Payment mode toggle + Razorpay key_id/secret + Social media links CRUD (FB/Insta/YouTube)

### UI/UX (Iteration 5 - Royal Navy & Gold Theme)
- [x] Royal Navy & Gold theme applied globally
- [x] Dynamic hero background from site_assets
- [x] Contact Us link in navbar with phone icon
- [x] Increased logo size in navbar
- [x] Updated contact details: phone 9730267630, address Ratnai Niwas, Kaikadi Chal, Bhoi Galli, Latur
- [x] Removed "TA JI LATUR" from all pages
- [x] Dynamic social media icons in footer (FB/Insta/YouTube from admin settings)
- [x] Transparency page cleaned up (removed all document download cards)
- [x] Project funds progress bars showing real raised_amount from API

### Payments
- [x] Manual QR mode (default): QR code from CMS, UTR + screenshot form
- [x] Razorpay SDK: Dynamic keys from DB, admin enters credentials in Settings
- [x] 80G receipt email sent on approval via Resend

### Infrastructure
- [x] MongoDB Atlas connected
- [x] Cloudinary old image auto-deletion
- [x] Identity Lock CSS on all photos
- [x] Cormorant Garamond + Outfit fonts

## Pending / Backlog

### P1 - High Priority
- [ ] About Us text CRUD: Create backend endpoints & admin UI for editing About Us text content (Mission, Vision paragraphs) from dashboard

### P2 - Medium Priority
- [ ] Refactor server.py into modular route files (/routes/auth.py, /routes/donations.py, etc.)

### P3 - Low Priority
- [ ] Admin dashboard layout refactoring
- [ ] PWA mobile support

## Key API Endpoints
- Auth: POST /api/auth/login, /api/auth/register
- CRUD: /api/projects, /api/gallery, /api/pillars, /api/videos, /api/success-stories
- Payments: POST /api/razorpay/create-order, /api/razorpay/verify
- AI: POST /api/ai/extract-story (multipart)
- CMS: /api/site-assets, /api/admin/settings
