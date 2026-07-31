# CampusConnect

CampusConnect is a comprehensive full-stack web application designed to foster connection and communication within campus environments. It features a modern, interactive React frontend and a robust Node.js backend.

## Features

- **Real-time Communication:** Powered by Socket.io for instant messaging and updates.
- **AI Integration:** Integrates Google GenAI and Groq SDK for intelligent features.
- **Interactive UI:** Utilizes Framer Motion for smooth animations and Spline for 3D interactive elements.
- **Secure Authentication:** JWT-based secure user authentication and authorization.
- **Media Management:** Cloudinary integration for robust image and media uploads.

## Tech Stack

### Frontend (Client)
- **React:** Modern UI library (v19)
- **Tailwind CSS:** Utility-first CSS framework for styling
- **Framer Motion:** Animation library
- **Socket.io Client:** Real-time web socket communication
- **Spline:** 3D web experiences
- **Axios:** HTTP client

### Backend (Server)
- **Node.js & Express:** Fast and minimalist web framework
- **MongoDB & Mongoose:** NoSQL database and object modeling
- **Socket.io:** Real-time event-based communication
- **Google GenAI & Groq SDK:** Advanced AI integrations
- **Cloudinary:** Cloud-based image and video management
- **JWT & bcryptjs:** Authentication and password hashing

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB instance

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd CampusConnect
   ```

2. **Setup the Server:**
   ```bash
   cd server
   npm install
   ```
   *Create a `.env` file in the `server` directory and add your environment variables (MongoDB URI, JWT Secret, Cloudinary keys, AI API keys).*

3. **Setup the Client:**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the Backend Server:**
   ```bash
   cd server
   npm run dev
   ```
   *The server will typically start on port 5000.*

2. **Start the Frontend Client:**
   ```bash
   cd client
   npm start
   ```
   *The client will typically start on port 3000.*

## License
ISC