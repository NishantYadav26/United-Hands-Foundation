# United Hands Foundation - Omni-Platform PRD

## Original Problem Statement
Build a production-grade NGO ecosystem for United Hands Foundation using React, FastAPI, MongoDB Atlas. Features include Multi-Cause Architecture, Admin CMS, Dual-mode payments, Automated 80G Receipts via Resend, AI Chief of Staff (Gemini), Video Clips, and Identity Lock CSS protocol.

## Architecture
- **Frontend**: React + Tailwind + Shadcn/UI + GSAP
- **Backend**: FastAPI + Motor (MongoDB Atlas) + JWT Auth
- **Database**: MongoDB Atlas (cluster0.qrcpjs1.mongodb.net)
- **File Storage**: Cloudinary (dvmb3mzcy, preset: uhf_unsigned)
- **Email**: Resend (real key active)
- **AI**: Gemini 2.5 Flash via emergentintegrations

## Implemented (as of March 30, 2026)

### Public Pages
- [x] Homepage: Hero, Heartiest Moments Gallery, Impact Stats, Founders (from CMS), Pillars, Authority Ticker, CTA
- [x] Donate: Multi-cause selector, QR code from CMS, Manual QR mode
- [x] Press & Media: Press Clippings + Video Clips toggle sections
- [x] About Us, Transparency, Track My Impact
- [x] Unified Login/Register (/login) for both users and admin

### Admin Dashboard (9 CMS Tabs)
- [x] **Donations**: Approve/Reject with JWT auth + 80G receipt email via Resend
- [x] **Projects**: Full CRUD + Cloudinary upload + old image auto-deletion
- [x] **Gallery**: "Heartiest Moments" CRUD + Cloudinary + auto-cleanup
- [x] **Media Library**: Site assets (logo, QR, founders, hero) + auto-cleanup
- [x] **Team Pillars**: Team members + photos + auto-cleanup
- [x] **Videos**: YouTube video clips CRUD
- [x] **AI Staff**: Upload PDF/image → Gemini extracts data → Save as Story or Press Entry
- [x] **Settings**: Payment mode toggle + Razorpay key_id/secret config (future-ready)

### Infrastructure
- [x] MongoDB Atlas connected (IP whitelisted)
- [x] Resend 80G receipt emails working (PDF attachment)
- [x] Cloudinary old image auto-deletion on update/delete
- [x] Peaceful color scheme (teal + warm amber + gold)
- [x] Identity Lock CSS on all founder/field photos
- [x] See-through logo effect

## Pending / Backlog

### P2 - Medium Priority
- [ ] Razorpay Standard Checkout SDK (when user gets account + adds credentials in Settings)
- [ ] Success Stories CMS management in admin

### P3 - Low Priority
- [ ] Admin dashboard refactoring (DashboardLayout component)
- [ ] PWA support for mobile

## Key API Endpoints
- POST /api/auth/login (unified), POST /api/auth/register
- GET/POST/PUT/DELETE /api/projects, /api/gallery, /api/pillars
- GET/POST/DELETE /api/videos
- POST /api/ai/extract-story (multipart file upload)
- POST /api/donations, POST /api/donations/approve
- GET/POST /api/site-assets, GET/PUT /api/admin/settings
