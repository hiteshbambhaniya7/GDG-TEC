# Smart Bhavnagar — AI-Driven Civic Issue Management Platform
> **Empowering citizens & Bhavnagar Municipal Corporation (BMC) through multimodal AI triage, geospatial tracking, and ground-truth verified resolution.**

---

## 🏛️ Problem Statement & Overview
In fast-growing tier-2 cities like **Bhavnagar, Gujarat**, citizen grievances regarding potholes, overflowing garbage dumps, burst water pipelines, non-functional streetlights, and stray cattle often experience:
1. **Misrouted complaints** across disparate municipal departments.
2. **Lack of urgency-based prioritization** (e.g., an open manhole near a school versus cosmetic damage).
3. **No ground-truth verification** (citizens never know if an issue was actually fixed).

**Smart Bhavnagar** solves this by introducing a closed-loop civic intelligence system:
- **Citizen Report**: Geo-tagged photo upload with GPS coordinates or landmark selector.
- **AI Triage Engine**: Multimodal analysis (Google Gemini API with zero-failure heuristic fallback) that scores severity from 1 to 10, flags public hazards, and routes the ticket directly to the responsible BMC department.
- **Authority Dispatch**: Officers manage triage queues, dispatch field units, and upload Before/After photo proof.
- **Citizen Audit & Rating**: Citizens inspect side-by-side photographic evidence and submit a 1–5 star quality rating.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, Vite, React Router v7, Lucide Icons, Leaflet Maps, Custom Vanilla CSS (Design Tokens, Glassmorphism, Dark Civic Theme).
- **Backend**: Node.js, Express.js REST API (`/api/v1`), Multer file storage, JWT Authentication, Role-Based Access Control (`citizen`, `officer`, `admin`).
- **Database**: MongoDB & Mongoose ODM (Geospatial 2dsphere indexing for map queries).
- **AI Triage**: Google Generative AI (`@google/generative-ai`) + BMC Department Decision Matrix.

---

## 🚀 Quick Start

### 1. Backend Server
```bash
cd server
npm install
npm run seed     # Seeds realistic Bhavnagar demo issues & users
npm start        # Starts Express on http://localhost:5000
```

### 2. Frontend Client
```bash
cd client
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## 👥 Demo Personas (1-Click Switcher in UI)
- **Citizen**: Hardik Patel (`9898000001` / `password123`)
- **PWD Officer**: Rajesh Vaghela (`9898000002` / `password123`)
- **SWM Officer**: Meena Trivedi (`9898000003` / `password123`)
- **Commissioner**: Dr. Sanjay Bhatt (`9898000004` / `password123`)
