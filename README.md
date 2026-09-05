# 🚀 MailGen AI - Intelligent Cold Outreach Pack Generator

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://ai-cold-email-generator-xi.vercel.app/)
[![API Status](https://img.shields.io/badge/Backend%20API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://ai-cold-email-generator-whft.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/icedoutchirag/ai-cold-email-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

An enterprise-grade, full-stack AI-powered outreach suite built with the **MERN** stack (MongoDB, Express, React, Node.js) and high-speed LLM inference via **Groq**. 

MailGen AI transforms simple job descriptions, company URLs, or prospect notes into a complete **4-in-1 Cold Outreach Pack** (Subject Line, Cold Email, LinkedIn Direct Message, and Follow-Up Email) tailored for maximum response and conversion rates.

---

## 🌐 Live Deployments

| Service | Platform | URL | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Application** | **Vercel** | [https://ai-cold-email-generator-xi.vercel.app/](https://ai-cold-email-generator-xi.vercel.app/) | 🟢 **Live & Active** |
| **Backend REST API** | **Render** | [https://ai-cold-email-generator-whft.onrender.com](https://ai-cold-email-generator-whft.onrender.com) | 🟢 **Live & Active** |
| **Source Code** | **GitHub** | [https://github.com/icedoutchirag/ai-cold-email-generator](https://github.com/icedoutchirag/ai-cold-email-generator) | 🟢 **Maintained** |

---

## ✨ Key Features

- **⚡ Complete 4-in-1 Outreach Pack Generation**:
  - **Subject Line**: Attention-grabbing, high open-rate hook without spammy keywords.
  - **Personalized Cold Email**: Tailored pitch highlighting relevant value proposition, achievements, and a clear call-to-action (CTA).
  - **LinkedIn DM**: Concise, natural conversational opener under 100 words.
  - **Follow-Up Email**: Polite, persistent second touchpoint adding context.
- **🛡️ Multi-Tier Resilient AI Engine**:
  - Powered by Groq's low-latency inference.
  - Multi-model fallback chain (`openai/gpt-oss-120b` ➔ `openai/gpt-oss-20b` ➔ `qwen/qwen3.8-27b`) preventing service disruption during model retirements or rate limits.
  - Strict JSON schema enforcement with resilient multi-pass JSON sanitizers.
- **🔐 Secure Authentication & Email OTP**:
  - JWT (JSON Web Tokens) with secure bcrypt password hashing.
  - One-Time-Password (OTP) email verification flow (Nodemailer / Brevo / Resend).
- **📂 Campaign History & Management**:
  - Cloud persistence in MongoDB Atlas.
  - Access past generations directly from the Dashboard with one-click copy and deletion.
- **🎨 Modern, Responsive UI**:
  - Clean SaaS interface built with React, Vite, and Lucide icons.
  - Instant copy-to-clipboard buttons with visual feedback.
  - Mobile, tablet, and desktop optimized.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Modern Responsive CSS / Tailwind Design System
- **Icons**: Lucide React
- **Routing**: React Router DOM (v6)
- **HTTP Client**: Axios with automatic base URL normalization and bearer auth interceptors

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas via Mongoose ODM
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs`
- **AI Inference**: Groq SDK (`groq-sdk`)
- **Email Delivery**: Nodemailer
- **Security**: CORS, Environment protection, Cross-platform DNS resolvers

---

## 📁 Repository Structure

```text
ai-cold-email-generator/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, Footer, etc.)
│   │   ├── context/            # AuthContext and state management
│   │   ├── pages/              # Dashboard, Login, Register, VerifyEmail, Landing
│   │   ├── utils/              # Axios API client & helpers
│   │   ├── App.jsx             # Route definitions & protected routes
│   │   └── main.jsx            # React root mount
│   ├── package.json
│   ├── vercel.json             # SPA rewrites for Vercel
│   └── vite.config.js
├── server/                     # Node.js + Express Backend
│   ├── config/
│   │   └── db.js               # MongoDB connection with DNS fallback
│   ├── controllers/
│   │   ├── aiController.js     # AI generation pipeline & fallback logic
│   │   └── authController.js   # Registration, Login, OTP verification
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT authentication verification
│   ├── models/
│   │   ├── Campaign.js         # Schema for saved outreach assets
│   │   ├── Otp.js              # Schema for OTP verification
│   │   └── User.js             # Schema for registered users
│   ├── routes/
│   │   ├── aiRoutes.js         # /api/ai endpoints
│   │   └── authRoutes.js       # /api/auth endpoints
│   ├── package.json
│   └── server.js               # Express application entrypoint
├── package.json                # Monorepo root scripts (npm run dev)
├── docker-compose.yml          # Containerized setup
└── README.md
```

---

## 🚦 Getting Started Locally

### Prerequisites
- **Node.js**: v18.x or higher installed
- **MongoDB**: A running local MongoDB instance (`mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) URI
- **Groq API Key**: Free key from [Groq Console](https://console.groq.com/keys)

### 1. Clone the Repository
```bash
git clone https://github.com/icedoutchirag/ai-cold-email-generator.git
cd ai-cold-email-generator
```

### 2. Install Dependencies
Install dependencies for root, backend, and frontend with a single command:
```bash
npm run install:all
```

### 3. Configure Environment Variables

#### Backend (`server/.env`)
Create `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ai-cold-email
JWT_SECRET=your_super_secret_jwt_key
GROQ_API_KEY=gsk_your_groq_api_key_here
FRONTEND_URL=http://localhost:5173

# Email delivery (optional for development)
EMAIL_SERVICE=smtp
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

#### Frontend (`client/.env`)
Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run Locally
Run both client and server concurrently with one command:
```bash
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 📡 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user and trigger OTP | No |
| `POST` | `/api/auth/verify-otp` | Verify email using 6-digit OTP | No |
| `POST` | `/api/auth/resend-otp` | Resend verification OTP code | No |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |

### AI Generation & History (`/api/ai`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/generate` | Generate Subject, Email, LinkedIn DM, and Follow-up | Yes |
| `GET` | `/api/ai/history` | Retrieve user's saved outreach campaigns | Yes |
| `DELETE`| `/api/ai/history/:id` | Delete a saved campaign from history | Yes |

---

## ☁️ Deployment Guide

### Backend on Render
1. Create a **New Web Service** on [Render](https://render.com/).
2. Connect your GitHub repository: `https://github.com/icedoutchirag/ai-cold-email-generator`.
3. Set the configuration:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Set Environment Variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random secret string.
   - `GROQ_API_KEY`: Your Groq Cloud API key.
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g. `https://ai-cold-email-generator-xi.vercel.app`).
   - `NODE_ENV`: `production`

### Frontend on Vercel
1. Import your GitHub repository into [Vercel](https://vercel.com/).
2. Set configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://ai-cold-email-generator-whft.onrender.com/api`
4. Click **Deploy**.

---

## 👤 Author

**Chirag Tayal**
- **GitHub**: [@icedoutchirag](https://github.com/icedoutchirag)
- **Repository**: [ai-cold-email-generator](https://github.com/icedoutchirag/ai-cold-email-generator)
- **Live Demo**: [MailGen AI on Vercel](https://ai-cold-email-generator-xi.vercel.app/)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
