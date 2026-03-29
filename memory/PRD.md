# United Hands Foundation - Omni-Platform PRD

## Original Problem Statement
Build a production-grade NGO ecosystem for United Hands Foundation using React, FastAPI, MongoDB. Features include Multi-Cause Architecture, Admin CMS, Dual-mode payments, Automated 80G Receipts, AI Chief of Staff, and Identity Lock CSS protocol.

## Core Requirements
- **Multi-Cause Architecture**: Projects module with categories (Healthcare, Education, Disaster Relief, Elderly Care, General)
- **Admin Command Center CMS**: Dynamic asset management for Pillars, Projects, Gallery, Media
- **Dual-mode Payments**: Manual QR (default) + Razorpay (ready toggle)
- **80G Receipts**: Automated via Resend email
- **AI Chief of Staff**: Gemini for PDF/News extraction
- **Identity Lock CSS**: `filter: contrast(1.05) sepia(0.1) brightness(1.02)` for founder photos
- **Color Scheme**: Peaceful teal + warm amber gradients (updated from Blue/Orange)
- **UHF Logo**: See-through effect with `mix-blend-mode: luminosity`

## Architecture
- **Frontend**: React + Tailwind + Shadcn/UI + GSAP animations
- **Backend**: FastAPI + Motor (MongoDB) + JWT Auth
- **Database**: MongoDB (local, Atlas ready)
- **File Storage**: Cloudinary (cloud_name: dvmb3mzcy, preset: uhf_unsigned)
- **Color System**: CSS custom properties in App.css (:root variables)

## What's Been Implemented (as of March 29, 2026)

### Core Pages
- [x] Homepage with dynamic sections (Hero, Heartiest Moments Gallery, Impact Stats, Founders from CMS, Pillars, Authority Ticker, CTA)
- [x] About Us page
- [x] Donate page with Multi-cause selector and Manual QR mode
- [x] Press & Media page
- [x] Transparency page
- [x] Track My Impact page (Email + PAN based)
- [x] Unified Login/Register page (/login) — works for both users and admin

### Admin Dashboard (/uhf-admin/dashboard)
- [x] JWT-protected with admin email restriction
- [x] 6 CMS tabs: Donations, Projects, Gallery, Media Library, Team Pillars, Settings
- [x] **Projects Management**: Full CRUD (Add/Edit/Delete) with Cloudinary image upload
- [x] **Gallery Management**: "Heartiest Moments" CRUD with Cloudinary upload
- [x] **Media Library**: Site assets management (logo, QR code, hero, founders, etc.)
- [x] **Team Pillars**: Team member management with photos
- [x] **Donations**: Approve/Reject pending donations
- [x] **Settings**: Payment mode toggle (Manual QR / Razorpay)

### Authentication
- [x] Unified login at /login (admin auto-detected by email, redirected to dashboard)
- [x] User registration with JWT tokens
- [x] Admin logout clears all tokens
- [x] User logout clears session

### Dynamic Content Pipeline
- [x] Homepage fetches site_assets for founder photos (no hardcoded URLs)
- [x] Homepage fetches gallery images for "Heartiest Moments" section
- [x] Homepage fetches pillars for "Our Pillars" section  
- [x] Homepage fetches projects for "Pillars of Impact" with progress bars
- [x] All admin CMS changes reflect live on the public website

### Visual Design
- [x] Peaceful color palette (teal #4DA8A0, warm amber #D4A373, gold #C9B458)
- [x] CSS custom properties for consistent theming
- [x] Glass-morphism effects
- [x] Identity Lock CSS on all founder/field photos
- [x] See-through logo effect
- [x] GSAP scroll animations

## Pending / Backlog

### P1 - High Priority
- [ ] AI "Chief of Staff" PDF OCR (Gemini 1.5 Flash via Emergent LLM key)
- [ ] Video Clips Section in Press & Media
- [ ] Automated 80G Receipt Delivery via Resend (email + PDF)
- [ ] MongoDB Atlas connection (needs IP whitelist 0.0.0.0/0 in Atlas Network Access)

### P2 - Medium Priority
- [ ] Razorpay Standard Checkout SDK integration (when KYC complete)
- [ ] Success Stories CMS management in admin

### P3 - Low Priority
- [ ] Admin dashboard refactoring (DashboardLayout component)
- [ ] PWA support for mobile

## Key API Endpoints
- POST /api/auth/login (unified: admin + user)
- POST /api/auth/register
- GET/POST/PUT/DELETE /api/projects
- GET/POST/PUT/DELETE /api/gallery
- GET/POST/PUT/DELETE /api/pillars
- GET/POST /api/site-assets
- GET /api/stats
- POST /api/donate
- POST /api/donor/track

## Admin Credentials
- Email: avdhut456@gmail.com
- Password: Omkar@123123
