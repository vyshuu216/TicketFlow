# 🎫 TicketFlow

**TicketFlow** is a full-stack, real-time support ticket management system built using the **MERN stack (MongoDB, Express.js, React, Node.js)**. It is designed to streamline IT support workflows by enabling efficient ticket creation, tracking, and resolution with **role-based access control (RBAC)** and **SLA (Service Level Agreement) monitoring**.

---

## 🚀 Features

* 🔐 **Authentication & Authorization**

  * Secure login/signup using JWT
  * Role-based access: User, Agent, Admin

* 🎟️ **Ticket Management**

  * Create, update, assign, and track tickets
  * Status lifecycle: Open → In Progress → Resolved → Closed

* ⚡ **Real-Time Updates**

  * Instant notifications using Socket.IO
  * Live comments and ticket updates without refresh

* ⏱️ **SLA Tracking**

  * Priority-based deadlines (Low, Medium, High, Critical)
  * Visual alerts for SLA breaches

* 🤖 **Automated Agent Assignment**

  * Round-robin / workload-based assignment

* 📊 **Analytics Dashboard**

  * Ticket statistics by category, priority, and status
  * Performance tracking

* 📚 **Knowledge Base**

  * Self-service articles to reduce duplicate tickets

* 📎 **File Attachments**

  * Upload files to tickets and comments

---
## 📸 Screenshots

### 🔐 Login Page

![Login](screenshots/login.png)

### 🏠 Dashboard

![Dashboard](screenshots/dashboard.png)

### 🎟️ Ticket Creation & Tracking

![Ticket](screenshots/ticket.png)

### ⚙️ Support Tickets

![NewTicket](screenshots/tickets.png)

### 👤 User Profile

![Profile](screenshots/profile.png)


## 🏗️ Tech Stack

**Frontend:**

* React.js (Vite)
* Axios
* Socket.IO Client
* Recharts

**Backend:**

* Node.js
* Express.js
* MongoDB (Mongoose)
* Socket.IO
* JWT Authentication

---

## 📂 Project Structure

/client → React frontend
/server → Node.js backend
/models → MongoDB schemas
/routes → API routes
/controllers → Business logic

---

## 🔧 Installation & Setup

```bash
# Clone the repository
git clone https://github.com/your-username/TicketFlow.git

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

# Run backend
npm run dev

# Run frontend
npm run dev
```

---

## 📌 Use Cases

* IT Service Management (ITSM)
* College/University helpdesk systems
* Customer support platforms
* Internal issue tracking for organizations

---

## 🌍 Future Enhancements

* Email notifications (Nodemailer)
* AI-based ticket classification
* Mobile app (React Native)
* Multi-tenant support
* OAuth integration (Google/Microsoft)

---

## 📎 License

This project is open-source and available for learning and academic purposes.

---

## 👨‍💻 Author

Developed by Srinivasa Vyshnavi
