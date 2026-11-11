# MindMate – AI-Powered Mental Wellness Support Platform

MindMate is a full-stack mental wellness platform designed to support students in managing their emotional well-being through AI-powered conversations, mood tracking, wellness resources, and real-time community interaction.

The application provides an integrated environment where students can reflect on their emotions, access personalized wellness features, and connect with other members.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Security Considerations](#security-considerations)
- [Disclaimer](#disclaimer)
- [Author](#author)

## Overview

Student mental well-being can be affected by academic pressure, personal challenges, and everyday stress. Access to convenient wellness resources and opportunities for emotional reflection can help students develop healthier habits.

MindMate addresses this need through a centralized platform that combines conversational AI, mood monitoring, wellness activities, and community features.

### Objectives

- Provide accessible AI-powered conversational support.
- Encourage regular emotional reflection through mood tracking.
- Promote healthy habits through wellness resources.
- Facilitate interaction among registered students.
- Provide a personalized and responsive user experience.

## Key Features

### 1. AI Companion

An AI-powered conversational interface that provides supportive responses to students.

- Natural language conversations.
- AI-generated responses using the Groq API.
- FastAPI backend integration.
- Persistent conversation history.
- Markdown-formatted responses.

### 2. Mood Tracker

A mood-monitoring module that encourages students to record and reflect on their emotions.

- Daily mood recording.
- Optional personal journal entries.
- Mood history and trend visualization.
- Persistent storage of mood records.

### 3. Wellness Resources

A dedicated section providing resources and activities related to student well-being.

- Stress management.
- Mindfulness and self-care.
- Sleep and healthy routines.
- Study-life balance.
- Wellness activities and guidance.

### 4. Student Community

A real-time community interface that allows registered students to discover other members.

- Student profile listing.
- Community member search.
- Real-time online/offline status.
- Firebase Realtime Database integration.

### 5. User Profile

A personalized profile management module.

- View account information.
- Update supported profile details.
- Synchronize profile information with Firebase.

### 6. Personalized Dashboard

A centralized interface providing access to the application's main modules and relevant user activity information.

### 7. Authentication

Firebase Authentication provides account management and access control.

- Email and password registration.
- User login and logout.
- Authentication state management.
- Protected application routes.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React, Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Icons | Lucide React |
| Backend | Python, FastAPI |
| AI Integration | Groq API |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| Real-time Services | Firebase Realtime Database |
| Development Tools | VS Code, Git, npm |

## System Architecture

MindMate follows a full-stack architecture that separates the frontend, backend, AI integration, and Firebase services.

```text
                 Student
                    |
                    v
             React Frontend
               (Vite)
                    |
          +---------+---------+
          |                   |
          v                   v
    Firebase Services    FastAPI Backend
          |                   |
     +----+----+              v
     |    |    |          Groq API
     |    |    |              |
     v    v    v              v
    Auth Firestore RTDB   AI Responses
```

### Architecture Components

**Frontend:** React manages the application interface, navigation, component rendering, and user interactions.

**Backend:** FastAPI exposes backend endpoints and handles communication with the Groq API.

**AI Integration:** Groq processes chatbot requests and generates conversational responses.

**Authentication:** Firebase Authentication manages user registration, login, and authentication state.

**Database:** Cloud Firestore stores persistent application data, while Firebase Realtime Database supports live community presence.

## Project Structure

```text
MindMate/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   └── ...
│   ├── requirements.txt
│   └── .env
│
├── public/
│
├── src/
│   ├── api/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

*The structure above provides a high-level overview of the application. Refer to the repository for the complete implementation.*

## Getting Started

Follow these instructions to set up and run the application locally.

### Prerequisites

Ensure the following are installed:

- Node.js and npm
- Python 3.10 or later
- Git
- Firebase project with Authentication, Firestore, and Realtime Database enabled
- Groq API key

### 1. Clone the Repository

```bash
git clone https://github.com/Syeda-Qurrat/MindMate.git
cd MindMate
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Configure Frontend Environment Variables

Create a `.env` file in the project root and add the Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=your_database_url
```

### 4. Configure the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python -m venv venv
```

For Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the backend directory:

```env
GROQ_API_KEY=your_groq_api_key
```

If your backend uses a configurable Groq model, add the corresponding model variable according to its implementation.

### 5. Configure Firebase

Configure the following services in your Firebase project:

1. Enable Email/Password authentication.
2. Create a Cloud Firestore database.
3. Set up Firebase Realtime Database.
4. Configure appropriate database security rules.
5. Add the Firebase web application configuration to the frontend environment variables.

## Running the Application

The frontend and backend must run in separate terminals.

### Start the Backend

From the `backend` directory, with the virtual environment activated:

```bash
python -m uvicorn app.main:app --reload
```

Backend URL:

`http://127.0.0.1:8000`

### Start the Frontend

From the project root:

```bash
npm run dev
```

Frontend URL:

`http://localhost:5173`

Open the frontend URL in your browser to access MindMate.

## Security Considerations

- Environment variables are used to manage sensitive configuration.
- API keys must not be committed to version control.
- Groq API requests are handled through the backend.
- Firebase Authentication is used to manage authenticated users.
- Database security rules restrict access to authorized user data.
- Private user information should not be publicly accessible.

## Disclaimer

MindMate is an educational mental wellness support application. Its AI companion provides general conversational support and wellness guidance.

The application is not intended to diagnose, treat, or replace professional mental health services. Users experiencing significant emotional distress should seek assistance from qualified mental health professionals.

## Author

**Syeda Qurrat Ul Ain Hashmi**

Computer Science Engineering

GitHub: [Syeda-Qurrat](https://github.com/Syeda-Qurrat)

---

**Repository:** [https://github.com/Syeda-Qurrat/MindMate](https://github.com/Syeda-Qurrat/MindMate)
