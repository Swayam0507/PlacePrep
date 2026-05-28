# PlacePrep 🚀

**PlacePrep** is a comprehensive, smart placement preparation platform designed to help students prepare for technical and aptitude interviews. It provides a full suite of features including dynamic testing, machine learning predictions for placement readiness, an interactive forum, and beautifully generated achievement certificates.

## 🌟 Key Features

- **Dynamic Testing & Analytics**: Take aptitude and technical tests with real-time scoring and detailed performance analytics.
- **Achievement Certificates**: Earn and download premium, high-resolution PDF certificates as you reach milestones (e.g., Top Performer, Test Starter).
- **Machine Learning Placement Prediction**: Predict your placement readiness based on test scores and resume metrics.
- **Smart Resume Scoring**: Upload your resume to get instant feedback and scoring based on industry standards.
- **Interactive Forum & Leaderboard**: Compare your progress with peers and engage in a community forum.
- **Admin Dashboard**: Comprehensive tools for admins to manage users, import questions, and track overall platform health.

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, Tailwind CSS / Custom CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas, Mongoose
- **File Generation**: `html2canvas`, `jsPDF` for client-side certificate generation
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Vercel (Frontend & Serverless Backend)

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster (or local MongoDB)

### 1. Clone the Repository
```bash
git clone https://github.com/Swayam0507/PlacePrep.git
cd PlacePrep
```

### 2. Install Dependencies
Install dependencies for both the frontend and backend simultaneously:
```bash
npm install
```
*(This triggers the root `package.json` postinstall script which installs both client and server dependencies)*

### 3. Environment Setup
Create a `.env` file in the `server` directory and add your configurations:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 4. Run the Application
You can run the frontend and backend concurrently:
- **Server:** `cd server && npm run dev`
- **Client:** `cd client && npm run dev`

## ☁️ Deployment (Vercel)

This project is fully configured for deployment on Vercel as a monorepo. 

1. Push your code to GitHub.
2. Import the repository in the Vercel Dashboard.
3. The root `vercel.json` and `package.json` will automatically route API requests to the Serverless Express backend and build the Vite frontend.
4. **Important:** Ensure your MongoDB Atlas Network Access is set to allow IPs from `0.0.0.0/0`.

## 📄 License

This project is licensed under the MIT License.
