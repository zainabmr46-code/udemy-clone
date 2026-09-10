# LearnHub — MERN Udemy-Clone Starter

A working MERN scaffold for an online learning platform with three roles (student, instructor, admin): auth, course
browsing, video lectures, quizzes, Stripe payments, progress tracking, certificates, reviews, and admin/instructor
dashboards.

```
udemy-clone/
├── backend/     Express + MongoDB (Mongoose) API
└── frontend/    React (Vite) + Tailwind CSS
```

## 1. Prerequisites

- Node.js 18+
- A MongoDB connection string (Atlas, or local MongoDB — you said you have Compass, so a local
  `mongodb://localhost:27017/udemy-clone` works fine, or point Compass at an Atlas cluster)
- Free-tier accounts for: Cloudinary (video/image hosting), Stripe (payments), and optionally Google Cloud
  (OAuth) and Gmail/SMTP (emails). The app runs and is fully click-through-able without any of these keys —
  Stripe checkout and video upload just won't work until you add them.

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env      # then fill in MONGO_URI, JWT_SECRET, etc.
npm run seed               # creates categories + an admin login (admin@udemyclone.dev / Admin@12345)
npm run dev                 # starts on http://localhost:5000
```

### Connecting with MongoDB Compass
Since you've already got Compass installed: either
- point `MONGO_URI` in `.env` at a local `mongod` instance (`mongodb://localhost:27017/udemy-clone`) and open
  that same URI in Compass to browse collections, or
- create a free MongoDB Atlas cluster, copy its connection string into `MONGO_URI`, and paste the same string
  into Compass's "New Connection" dialog.

Either way, once you run `npm run seed` or start creating data through the app, you'll see the collections
(`users`, `courses`, `sections`, `lectures`, `enrollments`, `reviews`, `payments`, `categories`, `quizzes`)
appear in Compass.

## 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env       # optional: add VITE_GOOGLE_CLIENT_ID for Google sign-in
npm run dev                 # starts on http://localhost:5173
```

The dev server proxies `/api/*` requests to `http://localhost:5000` (see `vite.config.js`), so just run both
servers side by side.

## 4. Try it out

1. Sign up as an **instructor** → Create Course → add sections → upload a lecture video → add a quiz.
2. Log in as the seeded **admin** (`admin@udemyclone.dev` / `Admin@12345`) → Pending Approvals → approve the course.
3. Sign up as a **student** → Browse Courses → enroll (free) or buy (needs Stripe test keys) → watch, take notes,
   bookmark timestamps, take the quiz, mark lectures complete → certificate auto-generates at 100%.
4. Leave a review from the student account once enrolled.
5. Check the instructor dashboard for the revenue chart and student list; check the admin dashboard for
   platform totals and instructor payouts.

## 5. Configuring the external services

| Service     | What it's used for                              | Where to get keys |
|-------------|--------------------------------------------------|--------------------|
| MongoDB     | All data storage                                  | Atlas or local mongod |
| Cloudinary  | Image + video upload/hosting (signed video URLs)  | cloudinary.com free tier |
| Stripe      | Paid course checkout                              | dashboard.stripe.com (test mode keys) |
| Google      | "Sign in with Google" OAuth                       | console.cloud.google.com → OAuth client ID |
| SMTP/Gmail  | Enrollment & completion emails                    | Gmail App Password, or any SMTP provider |

Everything degrades gracefully without keys: uploads/payments will error until configured, but auth, browsing,
free-course enrollment, quizzes, notes/bookmarks, and dashboards all work with just MongoDB running.

## 6. What's included vs. what to extend

**Included and working:**
- JWT auth (signup/login) + Google OAuth, role-based access control (student/instructor/admin)
- Course CRUD, sections, lecture video upload to Cloudinary with *authenticated* (signed) video delivery
- Course browse/search/filter/sort, syllabus preview, reviews & ratings
- Free enrollment; Stripe Checkout + webhook for paid courses with 70/30 instructor/platform split
- Progress tracking, "mark complete", auto-generated PDF certificates (pdfkit), notes & bookmarks
- Section quizzes (MCQ) with scoring
- Instructor dashboard (Recharts revenue trend, per-course stats, student list)
- Admin dashboard (platform totals, course approval queue, user block/unblock, category CRUD, payouts)
- Socket.io wired up for live-class chat/signaling rooms

**Scaffolded but left for you to extend** (kept out to stay a clean, reviewable starting point):
- Wishlist/cart with multi-course checkout
- Dark mode toggle UI (Tailwind `darkMode: 'class'` is already configured, just needs a toggle button + persisted state)
- Multi-language (i18n) strings
- Live class UI (the Socket.io rooms exist in `backend/utils/socket.js`; wire in Agora/ZegoCloud's SDK on a new frontend page)
- Deployment configs for Vercel/Render (the code is deploy-ready — just set the same env vars there)

## 7. Deployment notes

- **Frontend** → Vercel: set `VITE_GOOGLE_CLIENT_ID`, and set the API base URL (swap the dev-only Vite proxy for
  an absolute `VITE_API_URL` env var in `src/api/axios.js` for production).
- **Backend** → Render: set all vars from `.env.example`, plus make sure `CLIENT_URL` matches your deployed
  frontend origin (for CORS + Stripe redirect URLs).
- **Database** → MongoDB Atlas, same URI in both `.env` and Compass.
