# 📝 Task Manager

A full-stack task management application built with:

- 🔷 **React + TypeScript** (Frontend)
- 🟢 **Node.js (HTTP module)** (Backend)
- 🍃 **MongoDB + Mongoose** (Database)
- 🔐 **JWT Authentication**

---

## 🚀 Features

- ✅ Register / Login with JWT tokens
- 🧾 Add, edit, delete, and complete tasks
- 📆 Assign due date, time, and category to each task
- 🔎 Filter tasks by category and search text
- 🌙 Toggle between light/dark mode
- 🔐 Only logged-in users can manage their own tasks

---

## 📦 Tech Stack

| Part        | Tech                       |
|-------------|----------------------------|
| Frontend    | React + TypeScript + Vite  |
| Backend     | Node.js (http module)      |
| Auth        | JWT                        |
| Database    | MongoDB + Mongoose         |

---

## 🛠️ Setup Instructions

### 🔧 Backend

1. Create a `.env` file in the `backend/` folder:
    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_key
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Build and run the server:

    ```bash
    npm run start:server
    ```

---

### 💻 Frontend

1. Navigate to the root folder (where `vite.config.ts` is)
2. Start the development server:

    ```bash
    npm run dev
    ```

---

## 📸 Screenshots
![image](https://github.com/user-attachments/assets/6e72b87d-d349-4806-8055-9036b5bb9883)
![image](https://github.com/user-attachments/assets/55e34e99-3628-46ad-8fa8-8e84061c1f6f)
![image](https://github.com/user-attachments/assets/7682a1c7-c092-4405-bd3d-6de7e63dcdff)


---

## 🧠 Author

- [@aradeyal](https://github.com/aradeyal)

---

## 📄 License

This project is open-source. You can use it freely.
