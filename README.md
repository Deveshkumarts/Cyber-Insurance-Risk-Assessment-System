# Cyber Insurance Risk Assessment System (CIRAS)

![CIRAS Preview](frontend/src/assets/hero.png) <!-- Update this path if a screenshot exists -->

CIRAS is a comprehensive, full-stack web application designed to help organizations evaluate their cybersecurity posture, estimate cyber insurance premiums, investigate active threats, and forecast future risks using data-driven analytics. 

## 🚀 Key Features

This platform is divided into 5 core modules:

1. **Risk Assessment**
   - Interactive questionnaire to evaluate an organization's security posture.
   - Generates a holistic "Security Score" and identifies key vulnerabilities.
   - Provides an AI-powered Knowledge Base to educate users on common cyber threats.

2. **Cyber Insurance Premium Calculator**
   - Calculates estimated cyber insurance premiums based on organizational asset value and the latest security assessment score.
   - Simulates coverage tiers and dynamic risk adjustments.

3. **Incident Investigation**
   - Allows employees to report cybersecurity incidents in real-time.
   - Dedicated dashboard for Security Officers to track, assign, and resolve active threats.

4. **Evidence & Claims Management**
   - Upload and verify digital evidence (logs, screenshots) securely.
   - Role-based access control (Security Officers can approve/reject evidence and claims; Employees have read-only tracking).

5. **Predictive Analytics**
   - AI-driven risk forecasting based on historical incident data.
   - Visualizes Threat Trends, Attack Vector Forecasts, and Predicted Max Financial Loss.
   - Generates intelligent, actionable security recommendations.

## 🛠️ Technology Stack

- **Frontend:** React, Vite, Tailwind CSS, Chart.js (react-chartjs-2), Lucide Icons
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (pg)
- **Authentication:** JWT (JSON Web Tokens)
- **File Handling:** Multer

## ⚙️ Local Setup & Installation

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v14+)

### 1. Clone the repository
```bash
git clone https://github.com/Deveshkumarts/Cyber-Insurance-Risk-Assessment-System.git
cd Cyber-Insurance-Risk-Assessment-System
```

### 2. Database Setup
Ensure PostgreSQL is running and create a database (e.g., `crap_db`). 
Execute the schema file to initialize the tables:
```bash
psql -U your_postgres_user -d crap_db -a -f database/schema.sql
```

### 3. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory with the following variables:
```env
PORT=5000
DB_USER=your_postgres_user
DB_HOST=localhost
DB_NAME=crap_db
DB_PASSWORD=your_postgres_password
DB_PORT=5432
JWT_SECRET=your_super_secret_key
```
Start the backend server:
```bash
node server.js
# Or use nodemon for development
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
```
Start the Vite development server:
```bash
npm run dev
```

### 5. Access the Application
Open your browser and navigate to `http://localhost:5173`.

---

## 🔒 Roles & Access
The application utilizes Role-Based Access Control (RBAC):
- **Employee:** Can submit assessments, report incidents, and submit claims.
- **Security Officer:** Has elevated privileges to review investigations, verify evidence, evaluate claims, and view predictive analytics.

---
*Built as a secure, end-to-end solution for modern cyber risk management.*
