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

## Implemented (as of March 30, 2026)

### Public Pages
- [x] Homepage: Hero, Heartiest Moments, Impact Stats, Founders/Pillars from CMS, Stories
- [x] About Us: Dynamic CMS page — Mission/Vision, Founders, Field Work photos, Pillars, Locations, Legal
- [x] Donate: Dual-mode (Manual QR default, Razorpay when admin enables)
- [x] Press & Media: Press Clippings + Video Clips (YouTube/Facebook/Instagram)
- [x] Transparency, Track My Impact
- [x] Unified Login/Register (/login)

### Admin Dashboard (10 CMS Tabs)
- [x] **Donations**: Approve/Reject + 80G receipt email via Resend
- [x] **Projects**: Full CRUD + Cloudinary + auto-cleanup
- [x] **Gallery**: "Heartiest Moments" CRUD + auto-cleanup
- [x] **Media Library**: Site assets (logo, QR, founders, hero)
- [x] **Team Pillars**: Team members + photos
- [x] **Videos**: YouTube/Facebook/Instagram clips CRUD
- [x] **AI Staff**: PDF/image upload → Gemini extraction → Save as Story/Press
- [x] **Stories**: Success Stories full CRUD (add/edit/delete)
- [x] **Settings**: Payment mode toggle + Razorpay key_id/secret config

### Payments
- [x] Manual QR mode (default): QR code from CMS, UTR + screenshot form
- [x] Razorpay SDK: Dynamic keys from DB, admin enters credentials in Settings, toggle to enable
- [x] 80G receipt email sent on approval via Resend

### Infrastructure
- [x] Emergent branding removed
- [x] MongoDB Atlas connected
- [x] Cloudinary old image auto-deletion
- [x] Peaceful color scheme (teal + warm amber + gold)
- [x] Identity Lock CSS on all photos

## Pending / Backlog

### P3 - Low Priority
- [ ] Admin dashboard layout refactoring
- [ ] PWA mobile support

## Key API Endpoints
- Auth: POST /api/auth/login, /api/auth/register
- CRUD: /api/projects, /api/gallery, /api/pillars, /api/videos, /api/success-stories
- Payments: POST /api/razorpay/create-order, /api/razorpay/verify
- AI: POST /api/ai/extract-story (multipart)
- CMS: /api/site-assets, /api/admin/settings
