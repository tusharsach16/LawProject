# NyaySetu

A full-stack legal platform that connects users with expert lawyers, provides AI-powered legal assistance, and offers interactive learning through mock trials and quizzes. Built for the Indian legal system with multi-language support.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

NyaySetu is a full-stack web application designed to bridge the gap between legal professionals and individuals seeking legal guidance in India. The platform supports multiple user roles, provides AI-powered legal assistance via Google Gemini, enables real-time mock trials, allows appointment booking with payment integration, and supports video consultations via WebRTC.

## Features

### User Management
- Multi-role authentication: General Users, Law Students, and Lawyers
- JWT-based authentication with bcrypt password hashing
- Comprehensive user profiles with images, banners, bio, and location
- Friend request and social connection system
- Password recovery via OTP email verification

### AI Legal Assistant
- Powered by Google Gemini API
- Persistent conversation history stored in MongoDB, cached in Redis
- Multi-language support including Indian regional languages
- Context-aware responses with automatic legal disclaimers

### Mock Trials
- Real-time mock trial system for law students via WebSocket
- Role-based participation (plaintiff or defendant)
- Automatic opponent matching using Redis queues
- Post-trial AI analysis using Gemini API
- Trial history and result viewing

### Video Consultations
- WebRTC-based peer-to-peer video calls between users and lawyers
- Dedicated signaling server for WebRTC negotiation (offer/answer/ICE)
- Redis pub/sub for horizontal scaling across multiple signaling instances
- Call room access verified via JWT tokens
- Appointment time-window enforcement (±15 min window)

### Quiz System
- Categorized legal quiz questions with randomized selection
- Performance tracking, scoring, and attempt history
- Answer explanations for educational purposes
- Redis caching for improved performance

### Lawyer Services
- Detailed lawyer profiles with specialization, experience, and pricing
- Appointment booking with Razorpay payment integration
- Availability management and time slot selection
- Refund processing for cancellations

### Platform Features
- File uploads via Cloudinary (profile images and documents)
- Email notifications via Nodemailer for appointments and password resets
- API rate limiting for protection against abuse
- Redis caching across chatbot, quiz, and mock trial systems

## Technology Stack

### Frontend
- React 19 with TypeScript
- Vite (build tool and dev server)
- Tailwind CSS 4
- Redux Toolkit (state management)
- React Router DOM 7
- Axios (HTTP client)
- GSAP (animations)
- Lucide React (icons)
- Recharts (analytics)

### Backend (REST API)
- Node.js with Express 5
- TypeScript
- MongoDB with Mongoose
- Redis (caching and pub/sub)
- JWT authentication
- bcryptjs
- WebSocket (ws) — mock trial real-time messaging
- Multer + Cloudinary (file storage)
- Nodemailer (email)
- Razorpay (payments)
- Google Generative AI (Gemini)

### Backend Signaling (WebRTC)
- Node.js with Express and WebSocket (ws)
- TypeScript
- Redis pub/sub for cross-instance message routing
- JWT verification for call room access
- Horizontal scaling support via connection manager

## Project Structure

```
LawProject/
├── backend/                        # REST API server
│   ├── scripts/                    # Utility and test scripts (not compiled)
│   ├── src/
│   │   ├── config/                 # Database and service configurations
│   │   ├── controllers/            # Request handlers
│   │   ├── middleware/             # Auth and rate limiting
│   │   ├── models/                 # MongoDB schemas
│   │   ├── routes/                 # API route definitions
│   │   ├── utils/                  # Redis client and helpers
│   │   ├── webSockets.ts           # Mock trial WebSocket server
│   │   └── index.ts                # Entry point
│   └── package.json
├── backend-signaling/              # WebRTC signaling server
│   ├── src/
│   │   ├── services/
│   │   │   ├── connectionManager.ts  # Per-instance WebSocket registry
│   │   │   └── redisService.ts       # Redis pub/sub helpers
│   │   ├── types/
│   │   │   └── signalling.ts         # Message type definitions
│   │   ├── turn.ts                   # ICE server configuration
│   │   └── index.ts                  # Entry point (HTTP + WebSocket + Redis)
│   └── package.json
├── frontend/                       # React client
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── hooks/                  # Custom React hooks (useWebRTC)
│   │   ├── pages/                  # Page components
│   │   ├── redux/                  # Store and slices
│   │   ├── services/               # API and signaling service functions
│   │   ├── types/                  # TypeScript type definitions
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- MongoDB v6 or higher (local or Atlas)
- Redis v6 or higher (local, Redis Cloud, or Upstash)
- Git

### Optional (for full functionality)
- Google Cloud account — Gemini API access
- Razorpay account — payment processing
- Cloudinary account — file storage
- SMTP email service — Gmail, SendGrid, etc.

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd LawProject
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Signaling server
cd ../backend-signaling
npm install

# Frontend
cd ../frontend
npm install
```

## Configuration

### Backend — `backend/.env`

```env
PORT=5000
NODE_ENV=development

MONGODB_URL=mongodb://localhost:27017/lawconnect

REDIS_URL=redis://localhost:6379

JWT_SECRET=your-secret-key

GOOGLE_GEMINI_API_KEY=your-gemini-api-key

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

CLIENT_URL=http://localhost:5173

SIGNALING_SERVER_URL=http://localhost:8080
SIGNALING_WS_URL=ws://localhost:8080
```

### Signaling Server — `backend-signaling/.env`

```env
PORT=8080

JWT_SECRET=your-secret-key

REDIS_URL=redis://localhost:6379

FRONTEND_URL=http://localhost:5173
```

`JWT_SECRET` and `REDIS_URL` must match the values used in the backend.

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000

REACT_APP_RAZORPAY_KEY_ID=your-razorpay-key-id
```

## Running the Application

Start all three services in separate terminals:

```bash
# Terminal 1 — Backend REST API
cd backend
npm run dev

# Terminal 2 — Signaling server
cd backend-signaling
npm start

# Terminal 3 — Frontend
cd frontend
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Signaling Server | ws://localhost:8080 |

### Database Seeding

```bash
cd backend
npm run seed:categories
npm run seed:questions
npm run seed:mockTrails
```

## API Endpoints

### Authentication
- `POST /api/signup` — Register
- `POST /api/login` — Login
- `GET /api/user` — Get current user (protected)
- `POST /api/forgot-password` — Request OTP
- `POST /api/verify-otp` — Verify OTP
- `POST /api/reset-password` — Reset password

### Chatbot
- `POST /api/chat` — Send message to AI assistant (protected)
- `GET /api/chat/history` — Get conversation history (protected)

### Quiz
- `GET /api/quiz/getQuiz` — Get quiz by category
- `POST /api/quiz/submit` — Submit attempt (protected)
- `GET /api/quiz/categories` — List categories
- `GET /api/quiz/history` — Get attempt history (protected)

### Mock Trials
- `GET /api/mock-trial/categories` — List categories
- `GET /api/mock-trial/situations` — Get situations by category
- `POST /api/mock-trial/join` — Join matchmaking queue (protected)
- `POST /api/mock-trial/cancel-waiting` — Cancel queue (protected)
- `GET /api/mock-trial/:trialId` — Get trial details (protected)
- `POST /api/mock-trial/end` — End trial (protected)
- `POST /api/mock-trial/leave` — Leave trial (protected)
- `GET /api/mock-trial/past` — Get past trials (protected)
- `POST /api/mock-trial/analyze` — Run AI analysis (protected)

### Appointments
- `POST /api/appointments/create-order` — Create payment order (protected)
- `POST /api/appointments/verify-payment` — Verify payment (protected)
- `GET /api/appointments` — Get user appointments (protected)
- `GET /api/appointments/available-slots` — Get available slots
- `POST /api/appointments/cancel` — Cancel appointment (protected)

### Video Calls
- `POST /api/appointments/call-token` — Generate WebRTC call token (protected)
- `GET /api/appointments/call-access/:callRoomId` — Verify call access (protected)
- `POST /api/appointments/call-completed` — Mark call as completed (protected)

### Lawyers
- `GET /api/lawyers` — List lawyers
- `GET /api/lawyers/:id` — Get lawyer details
- `GET /api/lawyers/search` — Search lawyers
- `POST /api/lawyers/availability` — Set availability (protected, lawyer only)
- `GET /api/lawyers/availability/:lawyerId` — Get availability

### Connections
- `POST /apiFriend/send-request` — Send friend request (protected)
- `POST /apiFriend/respond` — Accept/reject request (protected)
- `GET /apiFriend/requests` — List requests (protected)
- `GET /apiFriend/friends` — List friends (protected)
- `GET /apiFriend/profile/:username` — Get profile by username

### Profile
- `GET /api/profile` — Get profile (protected)
- `PUT /api/profile` — Update profile (protected)
- `POST /api/upload` — Upload image/banner (protected)

### Signaling Server Endpoints
- `GET /health` — Health check
- `GET /ice` — Get ICE server configuration
- `POST /cache-call` — Cache call room data (called by backend)
- `POST /generate-call-token` — Generate call JWT
- `WS /` — WebSocket connection for WebRTC signaling

## Database Models

### User
- Name, email, username, hashed password
- Role: `general`, `lawstudent`, or `lawyer`
- Profile image, banner, bio, location
- Friends array

### Role-Specific
- **Lawyer**: Specialization, experience, pricing, availability slots
- **LawStudent**: Academic info, trial participation
- **GeneralUser**: Basic user data

### Quiz
- **Category**: Slug-based categories
- **Question**: Options, correct answer, optional explanation
- **QuizResult / UserQuizAttempt**: Score and answer tracking

### Mock Trial
- **MockTrialSituation**: Predefined scenarios
- **MockTrial**: Active/completed trials with embedded message history

### Appointment
- Linked user and lawyer
- Payment status, Razorpay order/payment IDs
- `callRoomId`, `callToken`, `participants` array, `maxParticipants`
- Appointment time, duration, status

### Other
- **FriendRequest**: Sender, receiver, status
- **ChatHistory**: Per-user AI conversation history

## Deployment

### Current Setup

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend (REST API) | Render |
| Backend Signaling | Render (keep-alive via UptimeRobot) |
| Redis | Upstash (free tier) |

### Environment Variables for Production

**Backend (Render)**
- All variables from the development `.env`
- `CLIENT_URL` — production Vercel URL
- `SIGNALING_SERVER_URL` / `SIGNALING_WS_URL` — production signaling server URL

**Signaling Server (Render)**
- `JWT_SECRET` — must match backend
- `REDIS_URL` — same Redis instance as backend
- `FRONTEND_URL` — production Vercel URL

**Frontend (Vercel)**
- `VITE_API_URL` — production backend URL
- `REACT_APP_RAZORPAY_KEY_ID`

### Build Commands

```bash
# Backend
npm run build
npm start

# Signaling server
npm run build
npm start

# Frontend (Vercel handles this automatically)
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

Follow TypeScript best practices, use meaningful names, and maintain the existing project structure.

## License

This project is licensed under the ISC License.
