# Law Connect

A comprehensive legal platform that connects users with expert lawyers, provides AI-powered legal assistance, and offers interactive learning experiences through mock trials and quizzes. Built specifically for the Indian legal system with support for multiple Indian languages.

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
- [Key Features Explained](#key-features-explained)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

Law Connect is a full-stack web application designed to bridge the gap between legal professionals and individuals seeking legal guidance in India. The platform offers multiple user roles, AI-powered legal assistance, interactive mock trials, educational quizzes, and appointment booking with payment integration.

## Features

### User Management
- **Multi-role Authentication**: Support for three distinct user types - General Users, Law Students, and Lawyers
- **Secure Authentication**: JWT-based authentication with password hashing using bcrypt
- **Profile Management**: Comprehensive user profiles with profile images, banners, bio, and location
- **Social Connections**: Friend request system allowing users to connect with each other
- **Password Recovery**: Forgot password functionality with OTP verification via email

### AI Legal Assistant
- **Intelligent Chatbot**: Powered by Google Gemini 2.5 Flash API
- **Conversation History**: Persistent chat history stored in MongoDB and cached in Redis
- **Multi-language Support**: Handles queries in multiple Indian languages
- **Context Awareness**: Maintains conversation context for better responses
- **Legal Disclaimer**: Automatically appends disclaimers to AI-generated legal advice

### Mock Trials
- **Interactive Legal Practice**: Real-time mock trial system for law students
- **Role-based Participation**: Students can participate as plaintiff or defendant
- **Real-time Communication**: WebSocket-based messaging during trials
- **Trial Matching**: Automatic matching system using Redis queues
- **Trial Management**: Start, end, and leave trial functionality
- **Trial History**: View past trials and results
- **AI-powered Analysis**: Post-trial analysis using Gemini API

### Quiz System
- **Categorized Questions**: Multiple legal categories with quiz questions
- **Randomized Questions**: Dynamic question selection per attempt
- **Performance Tracking**: Detailed quiz results with percentage scores
- **Quiz History**: Track all quiz attempts and performance over time
- **Explanation Support**: Questions can include explanations for correct answers

### Lawyer Services
- **Lawyer Profiles**: Detailed profiles with specialization, experience, and pricing
- **Appointment Booking**: Schedule appointments with lawyers
- **Payment Integration**: Razorpay integration for secure payment processing
- **Availability Management**: Lawyers can set their available time slots
- **Appointment Management**: View, cancel, and manage appointments
- **Refund System**: Automated refund processing for cancellations

### Additional Features
- **File Uploads**: Cloudinary integration for profile images and documents
- **Email Notifications**: Nodemailer integration for appointment confirmations and password resets
- **Rate Limiting**: Express rate limiting for API protection
- **Redis Caching**: Performance optimization with Redis caching
- **Real-time Updates**: WebSocket support for live updates
- **Search Functionality**: User and lawyer search capabilities
- [**Activity Tracking**: Comprehensive activity logging and history

## Technology Stack

### Frontend
- **React 19.1.0**: Modern React with latest features
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **Tailwind CSS 4.1.8**: Utility-first CSS framework
- **Redux Toolkit**: State management
- **React Router DOM 7.6.2**: Client-side routing
- **Axios**: HTTP client for API requests
- **GSAP**: Animation library for smooth UI transitions
- **Lucide React**: Icon library
- **Recharts**: Data visualization for analytics

### Backend
- **Node.js**: JavaScript runtime
- **Express 5.1.0**: Web framework
- **TypeScript**: Type-safe backend development
- **MongoDB**: NoSQL database with Mongoose ODM
- **Redis**: Caching and real-time data structures
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **WebSocket (ws)**: Real-time communication
- **Multer**: File upload handling
- **Cloudinary**: Cloud-based image and file storage
- **Nodemailer**: Email service
- **Razorpay**: Payment gateway integration
- **Google Generative AI**: Gemini API for AI features
- **Express Rate Limit**: API rate limiting
- **Node Cron**: Scheduled tasks

## Project Structure

```
LawProject/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and external service configurations
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Authentication and rate limiting
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API route definitions
│   │   ├── scripts/          # Database seeding scripts
│   │   ├── services/         # Business logic services
│   │   ├── types/            # TypeScript type definitions
│   │   ├── utils/            # Utility functions (Redis client)
│   │   ├── webSockets.ts     # WebSocket server implementation
│   │   └── index.ts          # Application entry point
│   ├── data/                 # Seed data files
│   ├── dist/                 # Compiled JavaScript output
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service functions
│   │   ├── redux/            # Redux store and slices
│   │   ├── hooks/            # Custom React hooks
│   │   ├── layouts/          # Layout components
│   │   ├── lib/              # Utility functions
│   │   ├── types/            # TypeScript type definitions
│   │   ├── App.tsx           # Main application component
│   │   └── main.tsx          # Application entry point
│   ├── dist/                 # Production build output
│   └── package.json
└── README.md
```

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn**
- **MongoDB** (v6 or higher) - Local installation or MongoDB Atlas account
- **Redis** (v6 or higher) - Local installation or Redis cloud service
- **Git** for version control

### Optional Services (for full functionality)
- **Google Cloud Account** - For Gemini API access
- **Razorpay Account** - For payment processing
- **Cloudinary Account** - For file uploads
- **SMTP Email Service** - For email notifications (Gmail, SendGrid, etc.)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd LawProject
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Set Up MongoDB

Ensure MongoDB is running on your system. You can either:
- Install MongoDB locally and run it
- Use MongoDB Atlas (cloud) and get a connection string

### 5. Set Up Redis

Ensure Redis is running on your system. You can either:
- Install Redis locally and run it
- Use a Redis cloud service (Redis Cloud, Upstash, etc.)

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URL=mongodb://localhost:27017/lawconnect
# Or for MongoDB Atlas:
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/lawconnect

# Redis Configuration
REDIS_URL=redis://localhost:6379
# Or for Redis Cloud:
# REDIS_URL=redis://username:password@host:port

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google Gemini API
GOOGLE_GEMINI_API_KEY=your-gemini-api-key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Razorpay Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Client URL (for email links)
CLIENT_URL=http://localhost:5173
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000

# WebSocket URL (optional, defaults to API URL)
VITE_WS_URL=ws://localhost:5000

# Razorpay Key (for frontend)
REACT_APP_RAZORPAY_KEY_ID=your-razorpay-key-id
```

### Getting API Keys

1. **Google Gemini API**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy and add to `GOOGLE_GEMINI_API_KEY`

2. **Razorpay**:
   - Sign up at [Razorpay](https://razorpay.com)
   - Get your Key ID and Key Secret from the dashboard
   - Add to both backend and frontend `.env` files

3. **Cloudinary**:
   - Sign up at [Cloudinary](https://cloudinary.com)
   - Get your Cloud Name, API Key, and API Secret
   - Add to backend `.env` file

4. **Email Service**:
   - For Gmail: Enable 2-factor authentication and create an app password
   - For other services: Use their SMTP credentials

## Running the Application

### Development Mode

#### 1. Start MongoDB
```bash
# If installed locally
mongod

# Or ensure MongoDB service is running
```

#### 2. Start Redis
```bash
# If installed locally
redis-server

# Or ensure Redis service is running
```

#### 3. Start Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:5000`

#### 4. Start Frontend Development Server

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### Production Build

#### Build Backend

```bash
cd backend
npm run build
npm start
```

#### Build Frontend

```bash
cd frontend
npm run build
npm run preview
```

### Database Seeding

To populate the database with initial data:

```bash
cd backend

# Seed quiz categories
npm run seed:categories

# Seed quiz questions
npm run seed:questions

# Seed mock trial situations
npm run seed:mockTrails
```

## API Endpoints

### Authentication
- `POST /api/signup` - User registration
- `POST /api/login` - User login
- `GET /api/user` - Get current user (protected)
- `POST /api/forgot-password` - Request password reset
- `POST /api/verify-otp` - Verify OTP
- `POST /api/reset-password` - Reset password

### Chatbot
- `POST /api/chat` - Send message to AI assistant (protected)
- `GET /api/chat/history` - Get chat history (protected)

### Quiz
- `GET /api/quiz/getQuiz` - Get quiz questions by category
- `POST /api/quiz/submit` - Submit quiz attempt (protected)
- `GET /api/quiz/categories` - Get all quiz categories
- `GET /api/quiz/history` - Get user quiz history (protected)

### Mock Trials
- `GET /api/mock-trial/categories` - Get mock trial categories
- `GET /api/mock-trial/situations` - Get situations by category
- `POST /api/mock-trial/join` - Join mock trial queue (protected)
- `POST /api/mock-trial/cancel-waiting` - Cancel waiting in queue (protected)
- `GET /api/mock-trial/:trialId` - Get trial details (protected)
- `POST /api/mock-trial/end` - End a trial (protected)
- `POST /api/mock-trial/leave` - Leave a trial (protected)
- `GET /api/mock-trial/past` - Get past trials (protected)
- `POST /api/mock-trial/analyze` - Analyze trial with AI (protected)

### Lawyers
- `GET /api/lawyers` - Get all lawyers
- `GET /api/lawyers/:id` - Get lawyer details
- `GET /api/lawyers/search` - Search lawyers
- `POST /api/lawyers/availability` - Set availability (lawyer only, protected)
- `GET /api/lawyers/availability/:lawyerId` - Get lawyer availability

### Appointments
- `POST /api/appointments/create-order` - Create payment order (protected)
- `POST /api/appointments/verify-payment` - Verify payment (protected)
- `GET /api/appointments` - Get user appointments (protected)
- `GET /api/appointments/available-slots` - Get available slots
- `POST /api/appointments/cancel` - Cancel appointment (protected)

### Friends/Connections
- `POST /apiFriend/send-request` - Send friend request (protected)
- `POST /apiFriend/respond` - Accept/reject friend request (protected)
- `GET /apiFriend/requests` - Get friend requests (protected)
- `GET /apiFriend/friends` - Get user's friends (protected)
- `GET /apiFriend/profile/:username` - Get user profile by username

### Profile
- `GET /api/profile` - Get current user profile (protected)
- `PUT /api/profile` - Update profile (protected)
- `POST /api/upload` - Upload profile image/banner (protected)

## Database Models

### User Model
- Basic user information (name, email, username, password)
- Role-based system (general, lawstudent, lawyer)
- Profile customization (bio, location, profile image, banner)
- Friends array for connections

### Role-Specific Models
- **Lawyer**: Specialization, experience, pricing, availability
- **LawStudent**: Academic information, mock trial participation
- **GeneralUser**: Basic user information

### Quiz Models
- **Category**: Quiz categories with slugs
- **Question**: Questions with options, correct answer, and explanations
- **QuizResult**: User quiz attempts with scores and answers
- **UserQuizAttempt**: Detailed attempt tracking

### Mock Trial Models
- **MockTrialSituation**: Predefined trial scenarios
- **MockTrial**: Active and completed trials with messages
- Real-time messaging support

### Other Models
- **Appointment**: Lawyer appointments with payment tracking
- **FriendRequest**: Friend request management
- **ChatHistory**: AI chatbot conversation history

## Key Features Explained

### Authentication System
The application uses JWT (JSON Web Tokens) for authentication. Upon successful login or signup, a token is generated and stored in localStorage. This token is sent with each protected API request in the Authorization header.

### AI Chatbot
The chatbot uses Google's Gemini 2.5 Flash API to provide legal assistance. Conversation history is maintained both in MongoDB for persistence and Redis for quick access. The system includes a specialized prompt for Indian law and automatically appends disclaimers to responses.

### Mock Trial System
Mock trials use a sophisticated matching system:
1. Users select a situation and side (plaintiff/defendant)
2. The system uses Redis queues to match opponents
3. Once matched, a WebSocket connection is established
4. Real-time messaging occurs during the trial
5. Trials can be ended by either party or automatically after inactivity
6. Post-trial analysis is available using AI

### Quiz System
The quiz system provides:
- Randomized questions from selected categories
- Performance tracking with detailed results
- Explanation support for educational purposes
- History tracking for progress monitoring
- Caching for improved performance

### Payment Integration
Razorpay integration handles:
- Payment order creation
- Payment verification
- Refund processing for cancellations
- Secure payment handling with signature verification

### Caching Strategy
Redis is used extensively for:
- Quiz question caching (2-minute TTL)
- Mock trial category caching (10-minute TTL)
- Conversation history caching (1-hour TTL)
- Performance optimization for frequently accessed data

## Development

### Code Structure
- **TypeScript**: Both frontend and backend use TypeScript for type safety
- **Modular Architecture**: Controllers, services, and models are separated
- **Middleware**: Authentication and rate limiting are handled via middleware
- **Error Handling**: Comprehensive error handling throughout the application

### Adding New Features

1. **Backend**:
   - Create model in `backend/src/models/`
   - Create controller in `backend/src/controllers/`
   - Create routes in `backend/src/routes/`
   - Add route to `backend/src/index.ts`

2. **Frontend**:
   - Create component in `frontend/src/components/`
   - Create page in `frontend/src/pages/`
   - Add route in `frontend/src/App.tsx`
   - Add API service in `frontend/src/services/`

### Testing
Currently, the project includes test files for API endpoints. To add more tests:
- Create test files in appropriate directories
- Use testing frameworks like Jest or Mocha
- Test API endpoints, models, and utilities

## Deployment

### Backend Deployment
1. Build the TypeScript code: `npm run build`
2. Set production environment variables
3. Deploy to platforms like:
   - Heroku
   - Railway
   - AWS EC2
   - DigitalOcean
   - Render

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Deploy the `dist` folder to:
   - Vercel (recommended for React apps)
   - Netlify
   - AWS S3 + CloudFront
   - GitHub Pages

### Environment Setup for Production
- Use secure, randomly generated JWT secrets
- Enable HTTPS for all connections
- Configure CORS properly for production domains
- Set up proper MongoDB and Redis connections
- Configure email service with production credentials
- Set up monitoring and logging

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Maintain consistent code formatting
- Follow the existing project structure

## License

This project is licensed under the ISC License.

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

## Acknowledgments

- Google Gemini API for AI capabilities
- Razorpay for payment processing
- Cloudinary for file storage
- All open-source libraries and frameworks used in this project

---

**Note**: This is a comprehensive legal platform. Ensure all legal disclaimers are properly displayed, and users are informed that AI-generated advice should be verified with qualified legal professionals.

