# 💰 Smart Expense Tracker

A full-stack **Smart Expense Tracker** web application built using the **MERN Stack**.  
It helps users manage income, track expenses, analyze spending patterns, set budgets, and automate recurring transactions — all within a secure and modern interface.

---

## 🚀 Live Demo

🔗 Coming Soon  

---

## 📌 Overview

Managing personal finances should be simple and intelligent.  
Smart Expense Tracker provides a secure, automated, and user-friendly platform where users can:

- Track income and expenses
- Analyze financial data
- Set monthly budgets
- Automate recurring transactions
- Monitor spending patterns in real-time

This project focuses on **real-world financial workflows, backend security, automation logic, and clean UI/UX design.**

---

## ✨ Features

### 🔐 Authentication & Security
- User registration and login using JWT authentication
- Secure password hashing with bcrypt
- Protected routes using authentication middleware
- Persistent login sessions

---

### 💸 Income & Expense Management
- Add, edit, and delete transactions
- Categorize income and expenses
- Separate handling for income and expense entries
- Responsive and clean transaction listing interface

---

### 🔁 Recurring Transactions (Advanced Feature)
- Create recurring rules (daily, weekly, monthly, yearly)
- Automatic execution of recurring transactions on login
- Pause, resume, edit, and delete recurring rules
- Automatic next-run date calculation
- Visual indicators for recurring transactions

---

### 📊 Analytics Dashboard
- Monthly income vs expense comparison
- Category-wise spending breakdown
- Visual insights for smarter financial decisions

---

### 🎯 Budget Management
- Set monthly budgets by category
- Real-time budget tracking
- Alerts when spending exceeds budget limits

---

### 👤 User Profile
- View profile details
- Avatar color customization
- Persistent user preferences

---

### 🌗 UI & UX
- Light and dark mode support
- Fully responsive (mobile & desktop)
- Smooth animations using Framer Motion
- Clean UI built with Tailwind CSS

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Redux Toolkit
- Tailwind CSS
- Framer Motion
- Axios

### Backend
- Node.js
- Express.js
- MongoDB & Mongoose
- JWT Authentication
- bcrypt for password hashing

### Database
- MongoDB Atlas (Cloud Database)

---

## 📂 Project Structure




Smart-Expense-Tracker/
│
├── frontend/ # React (Vite) Frontend
│ ├── public/
│ └── src/
│ ├── assets/ # Images & static files
│ ├── components/ # Reusable UI components
│ ├── features/ # Redux slices & logic
│ ├── pages/ # Application pages (Dashboard, Login, etc.)
│ ├── services/ # API calls (Axios setup)
│ ├── hooks/ # Custom React hooks
│ ├── utils/ # Helper functions
│ ├── App.jsx
│ └── main.jsx
│
├── backend/ # Express Backend
│ ├── src/
│ │ ├── controllers/ # Business logic (auth, transactions, budget)
│ │ ├── models/ # Mongoose schemas
│ │ ├── routes/ # API route definitions
│ │ ├── middleware/ # Auth & error middleware
│ │ ├── utils/ # Token generator, recurring executor, etc.
│ │ ├── config/ # Database connection setup
│ │ └── server.js # Entry point
│ │
│ ├── .env # Environment variables
│ ├── package.json
│ └── package-lock.json
│
└── README.md