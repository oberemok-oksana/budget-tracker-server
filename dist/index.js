import express from "express";
import expensesRoutes from "./routes.js";
import cors from "cors";
const app = express();
const allowedOrigins = [
    "http://localhost:8000",
    "http://127.0.0.1:5173",
    "http://localhost:5173",
];
const options = {
    origin: allowedOrigins,
    preflightContinue: true,
    credentials: true,
};
app.use(cors(options));
app.use(express.urlencoded());
app.use(express.json());
app.use("/", expensesRoutes);
const port = 8000;
app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});
