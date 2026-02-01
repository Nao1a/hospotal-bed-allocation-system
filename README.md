# Hospital Bed Allocation System (DSA Project)

A full-stack application for managing hospital beds and patient queues efficiently using data structures like **Heaps (Priority Queues)** for patient sorting and **Hash Maps** for bed management.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed on your machine:

1.  **Node.js** (v14 or higher) - [Download Here](https://nodejs.org/)
2.  **MongoDB** (Local or Atlas) - [Download Community Server](https://www.mongodb.com/try/download/community)
3.  **Git** (Optional, for cloning)

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <folder-name>
```

### 2. Backend Setup
The backend runs on **Express.js** and handles all algorithmic logic.

1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    *   Create a `.env` file in the `backend/` root directory.
    *   Add the following (adjust Mongo URI if needed):
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/hospital-bed-allocation
    JWT_SECRET=mysecretkey123
    ```

4.  **Seed the Database (Important):**
    *   This script creates the Admin user, beds, and initial patients.
    ```bash
    node seed.js
    ```
    *   *You should see a success message: "Seeding Completed Successfully".*

5.  Start the Backend Server:
    ```bash
    npm start
    ```
    *   *Runs on http://localhost:5000*

---

### 3. Frontend Setup
The frontend is built with **React (Vite)** and **TailwindCSS**.

1.  Open a new terminal window.
2.  Navigate to the frontend folder:
    ```bash
    cd frontend
    ```

3.  Install dependencies:
    ```bash
    npm install
    ```

4.  Start the Development Server:
    ```bash
    npm run dev
    ```
    *   *Runs on http://localhost:5173*

---

## 🖥️ Usage Guide

### 1. Login
Open your browser to `http://localhost:5173`.
*   **Username:** `admin`
*   **Password:** `password123`

### 2. Dashboard Overview
*   **Total Patients:** Shows currently admitted count.
*   **Waiting Queue:** Live count of patients waiting for beds.
*   **Available Beds:** Real-time count of free beds.

### 3. Key Features to Test
1.  **Admit a Patient:**
    *   Go to "Admission Form".
    *   Enter details (e.g., Severity 10 for Critical).
    *   If a bed is free, they get it immediately (Greedy Algorithm).
    *   If full, they go to the "Waiting Queue" (Priority Queue).

2.  **Discharge a Patient (Release Bed):**
    *   Go to "Bed Management".
    *   Click "Discharge" on an occupied bed.
    *   **Watch Magic Happen:** If there is a high-priority patient in the queue waiting for that bed type, the system **automatically** assigns the newly freed bed to them!

3.  **Waiting List:**
    *   Go to "Waiting Queue" to see patients sorted by Severity (Highest first).

---

## 🛠️ Tech Stack
*   **Frontend:** React, Vite, TailwindCSS
*   **Backend:** Node.js, Express
*   **Database:** MongoDB
*   **Algorithms:** 
    *   Priority Queue (Binary Heap) for Patients.
    *   Hash Table (Map) for Bed Storage.
    *   Greedy Algorithm for Bed Allocation.

## ⚠️ Common Issues
*   **"MongoNetworkError":** Make sure your MongoDB service is running locally.
*   **"CORS Error":** Ensure backend is running consistently on port 5000.
