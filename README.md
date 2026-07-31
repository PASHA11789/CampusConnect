<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=250&section=header&text=🎓%20CampusConnect&fontSize=60&fontAlignY=35&desc=The%20Ultimate%20University%20Ecosystem&descAlignY=55&descAlign=50" alt="CampusConnect Header" />

  <p align="center">
    <b>A modern, full-stack platform designed to revolutionize campus life, connectivity, and services.</b>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-19-blue.svg?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-Express-green.svg?style=for-the-badge&logo=nodedotjs" alt="Node.js" />
    <img src="https://img.shields.io/badge/MongoDB-Mongoose-success.svg?style=for-the-badge&logo=mongodb" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Socket.io-Realtime-black.svg?style=for-the-badge&logo=socketdotio" alt="Socket.io" />
    <img src="https://img.shields.io/badge/TailwindCSS-Styling-38B2AC.svg?style=for-the-badge&logo=tailwind-css" alt="TailwindCSS" />
  </p>
</div>

---

## 🌟 Overview

**CampusConnect** is a comprehensive ecosystem tailored for university students, faculty, and campus vendors. It bridges the gap between campus administration and students by providing a unified platform for communication, services, and community engagement. Whether you want to order a quick snack, find a lost item, discuss academic topics, or raise a petition, CampusConnect has you covered!

---

## ✨ Core Features

### 🗣️ Community & Discussions
*   **Interactive Forums:** Create threads, ask questions, and engage in meaningful discussions with peers.
*   **Real-time Chat:** Powered by Socket.io for seamless and instantaneous messaging.

### 🍔 Canteen & Vendor Marketplace
*   **Order Food:** Browse menus from campus restaurants and place orders online.
*   **Vendor Dashboard:** Dedicated dashboards for restaurants to manage menus and track orders.
*   **Rider Marketplace:** Peer-to-peer delivery system allowing students to earn by delivering food on campus.

### 🔍 Lost & Found
*   **Report Items:** Easily report lost belongings or post items you've found on campus.
*   **Smart Matching:** Detailed descriptions and categories help return items to their rightful owners faster.

### 🚌 Campus Transport (Bus Routes)
*   **Route Tracking:** Stay updated with the latest bus routes and schedules.
*   **Timetables:** Never miss a bus with easily accessible transport information.

### 📜 Student Voice & Petitions
*   **Start Campaigns:** Raise awareness about campus issues by creating petitions.
*   **Gather Support:** Students can sign and support petitions to bring about administrative change.
*   **Complaints Portal:** Directly submit actionable feedback or complaints to the administration.

### 💼 Career & Opportunities
*   **Job Board:** Discover internships, part-time jobs, and career opportunities tailored for students.
*   **Career Threads:** Discuss interview prep, share resume tips, and network.

### 🛡️ Safety & Moderation
*   **Admin Dashboard:** Comprehensive tools for administrators to manage users and content.
*   **Content Moderation:** Built-in reporting system to flag inappropriate content.
*   **AI Integrations:** Google GenAI and Groq SDK to assist in intelligent moderation and analytics.

---

## 🛠️ Technology Stack

### 🎨 Frontend (Client)
*   **Framework:** React (v19) with React Router for seamless navigation.
*   **Styling & UI:** Tailwind CSS for a modern, responsive design.
*   **Animations:** Framer Motion for buttery-smooth micro-interactions.
*   **3D Elements:** `@splinetool/react-spline` for interactive 3D web experiences.
*   **State & API:** Axios for HTTP requests, Socket.io-client for real-time data.

### ⚙️ Backend (Server)
*   **Core:** Node.js & Express.js architecture.
*   **Database:** MongoDB with Mongoose ODM for flexible schema modeling.
*   **Real-time Engine:** Socket.io for handling live events, notifications, and chat.
*   **Authentication:** JWT (JSON Web Tokens) combined with `bcryptjs` for secure password hashing.
*   **Media Storage:** Cloudinary integrated with Multer for handling image and file uploads.
*   **AI Integration:** Google GenAI and Groq SDK for advanced AI-driven features.

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### 📋 Prerequisites
*   **Node.js:** Make sure you have Node.js installed (v18+ recommended).
*   **MongoDB:** A local MongoDB instance or a MongoDB Atlas cluster URI.
*   **Cloudinary Account:** For media uploads.

### 💻 Installation

**1. Clone the repository:**
```bash
git clone https://github.com/PASHA11789/CampusConnect.git
cd CampusConnect
```

**2. Setup Backend (Server):**
```bash
cd server
npm install
```
*Create a `.env` file in the `server` directory and configure the following variables:*
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_google_genai_key
GROQ_API_KEY=your_groq_key
```

**3. Setup Frontend (Client):**
```bash
cd ../client
npm install
```

### 🏃‍♂️ Running the Application

Open two terminal windows/tabs:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```
*(Server will start on http://localhost:5000)*

**Terminal 2 (Frontend):**
```bash
cd client
npm start
```
*(Client will start on http://localhost:3000)*

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/PASHA11789/CampusConnect/issues).

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **ISC License**.

<div align="center">
  <sub>Built with ❤️ for a better campus experience.</sub>
</div>