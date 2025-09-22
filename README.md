# 📊 Polling App Backend

This is the backend for the **Realtime Polling Application**, built with **Node.js, Express.js, MongoDB, and Socket.IO**.  
It handles poll creation, voting, and broadcasting realtime updates to connected clients.

---

## 🚀 Features
- Create polls with multiple options
- Submit and track votes in realtime
- Prevent multiple votes from a single user per poll
- Broadcast live poll results to all connected clients
- Timer support for poll auto-expiry
- REST APIs + WebSocket integration

---

## 🛠️ Tech Stack
- **Node.js** – JavaScript runtime
- **Express.js** – Backend framework
- **MongoDB** – Database for storing polls & votes
- **Socket.IO** – Realtime communication
- **Mongoose** – ODM for MongoDB
- **JWT** – Authentication & authorization

---

## ⚙️ Setup & Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/polling-app-backend.git
cd polling-app-backend
```

### 2️⃣ Install dependencies
```bash
git install
```

### 3️⃣ Create .env file
```bash
PORT=3000
MONGO_URI=mongodb://localhost:27017/polling_app
```

### 4️⃣ Run the server
```bash
npm run dev
```

## 🔌 Socket.IO Events

**connect** → User connected
**createPoll** → Teacher creates a poll
**pollCreated** → Broadcast on poll creation
**submitAnswer** → Stduent submit answer
**pollResults** → Teacher & Student both can see live result
**disconnect** → User disconnected

