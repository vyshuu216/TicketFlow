# 🎫 TicketFlow — Smart Support Ticket Management Platform

A modern full-stack support ticket management platform built with the **MERN Stack (MongoDB, Express.js, React.js, Node.js)**, featuring real-time collaboration, SLA monitoring, role-based access control, analytics dashboards, and knowledge base management.

![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-black)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-black)
![Render](https://img.shields.io/badge/Backend-Render-blue)

---

## 🌐 Live Demo

### Frontend
https://ticket-flow2.vercel.app

### Backend API
https://ticketflow-by4b.onrender.com

### Health Check
https://ticketflow-by4b.onrender.com/api/health

---

## 📌 Project Overview

TicketFlow is a professional support ticket management system designed to streamline issue reporting, ticket assignment, tracking, and resolution processes within organizations.

The platform provides real-time updates, automated workflows, secure authentication, role-based access control, and analytics to improve support team productivity and customer satisfaction.

---

## 🚀 Key Features

### 🔐 Authentication & Security

- JWT Authentication (Access & Refresh Tokens)
- Role-Based Access Control (Admin, Agent, User)
- Secure Password Hashing
- Protected API Routes
- Session Management

### 🎟️ Ticket Management

- Create, Update & Track Support Tickets
- Priority-Based Ticket Handling
- Status Workflow Management
- File Attachments Support
- Activity Timeline Tracking
- Real-Time Comments
- Ticket Search & Filtering

### ⚡ Real-Time Collaboration

- Socket.IO Powered Notifications
- Instant Ticket Updates
- Live Comment Synchronization
- Typing Indicators
- Real-Time Activity Tracking

### 📊 Analytics Dashboard

- Ticket Status Analytics
- Priority & Category Breakdown
- Agent Performance Monitoring
- SLA Compliance Tracking
- Interactive Charts & Reports

### 📚 Knowledge Base

- Searchable Help Articles
- Category-Based Filtering
- Self-Service Support Documentation
- FAQ Management

### 👨‍💼 Administration

- User Management
- Role Assignment
- Ticket Monitoring
- System Analytics
- Performance Tracking

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- Axios
- React Router
- Socket.IO Client
- Recharts
- CSS3

### Backend

- Node.js
- Express.js
- Socket.IO
- JWT Authentication
- Multer
- Express Middleware

### Database

- MongoDB Atlas
- Mongoose ODM

### Deployment

- Vercel (Frontend)
- Render (Backend)

---

## 📸 Screenshots

### 🔐 Login Page

![Login](screenshots/login.jpeg)

### 📊 Dashboard

![Dashboard](screenshots/dashboard.jpeg)

### 🎟️ Ticket Management

![Tickets](screenshots/tickets.jpeg)

### 📝 Ticket Details

![Ticket](screenshots/ticket.jpeg)

### 👤 User Profile

![Profile](screenshots/profile.jpeg)

---

## 🏗️ System Architecture

```text
Client (React + Vite)
          │
          ▼
 REST APIs + Socket.IO
          │
          ▼
 Node.js + Express.js
          │
          ▼
 MongoDB Atlas
```

---

## 📂 Project Structure

```text
TicketFlow/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   ├── uploads/
│   ├── seed.js
│   └── server.js
│
├── screenshots/
│
└── README.md
```

---

## 🔧 Environment Variables

### Backend (.env)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
CLIENT_URL=https://ticket-flow2.vercel.app
```

### Frontend (.env)

```env
VITE_API_URL=https://ticketflow-by4b.onrender.com/api
VITE_SOCKET_URL=https://ticketflow-by4b.onrender.com
```

---

## 🚀 Local Setup

### Clone Repository

```bash
git clone https://github.com/vyshuu216/TicketFlow.git
cd TicketFlow
```

### Backend Setup

```bash
cd server

npm install

node seed.js

npm run dev
```

Server will start at:

```text
http://localhost:5000
```

### Frontend Setup

```bash
cd client

npm install

npm run dev
```

Frontend will start at:

```text
http://localhost:5173
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|--------|--------|--------|
| Admin | admin@demo.com | password123 |
| Agent | agent@demo.com | password123 |
| User | user@demo.com | password123 |

---

## 🎯 Use Cases

- IT Service Management (ITSM)
- College Helpdesk Systems
- Customer Support Platforms
- Internal Team Issue Tracking
- Enterprise Support Portals

---

## 📈 Future Enhancements

- AI-Based Ticket Classification
- Email Notifications
- Mobile Application
- OAuth Login (Google/Microsoft)
- Multi-Tenant Architecture
- Advanced Reporting
- Chatbot Integration
- Ticket Recommendation Engine

---

## 👩‍💻 Author

**Srinivasa Vyshnavi**

GitHub: https://github.com/vyshuu216

---

⭐ If you found this project useful, consider giving it a star!
