import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import recurringRoutes from "./routes/recurringRoutes.js";



const app = express();

// ====== Global Middlewares ======
app.use(cors()); // allow requests from frontend
app.use(express.json()); // parse JSON bodies
app.use(express.urlencoded({ extended: true })); // parse form data

// ====== Health Check Route ======
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Smart Expense Tracker API is running 🚀",
    });
});


// ====== API Routes ======
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/recurring", recurringRoutes);


// ====== API Routes (we will add these files later) ======
// import authRoutes from "./routes/authRoutes.js";
// import transactionRoutes from "./routes/transactionRoutes.js";
// import categoryRoutes from "./routes/categoryRoutes.js";
// import budgetRoutes from "./routes/budgetRoutes.js";
// import analyticsRoutes from "./routes/analyticsRoutes.js";

// app.use("/api/auth", authRoutes);
// app.use("/api/transactions", transactionRoutes);
// app.use("/api/categories", categoryRoutes);
// app.use("/api/budgets", budgetRoutes);
// app.use("/api/analytics", analyticsRoutes);

// ====== 404 Fallback ======
app.use((req, res) => {
    res.status(404).json({
        status: "error",
        message: "Route not found",
    });
});

export default app;