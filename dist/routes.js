var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import expensesService from "./services/expensesService.js";
import { auth } from "./lucia.js";
import { SqliteError } from "better-sqlite3";
import { LuciaError } from "lucia";
import { getUserSession } from "./lib/lib.js";
const router = express.Router();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { date, filter } = req.query;
    const session = yield getUserSession(req, res);
    res.json(expensesService.getFilteredExpenses(session.user.userId, date, filter));
}));
router.get("/user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield getUserSession(req, res);
    if (session) {
        res.json(session.user);
    }
    else {
        res.status(401).json({ error: "Unauthorized" });
    }
}));
router.delete("/logout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authRequest = auth.handleRequest(req, res);
    const session = yield authRequest.validate();
    if (!session) {
        return res.sendStatus(401);
    }
    yield auth.invalidateSession(session.sessionId);
    authRequest.setSession(null); // for session cookie
    // redirect back to login page
    return res.sendStatus(200);
}));
router.delete("/:id", (req, res) => {
    const id = parseInt(req.params.id);
    expensesService.deleteExpense(id);
    res.sendStatus(200);
});
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield getUserSession(req, res);
    if (session) {
        const userId = session.user.userId;
        expensesService.addExpense(req.body, userId);
        res.sendStatus(201);
    }
    else {
        res.sendStatus(403);
    }
}));
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (typeof username !== "string" ||
        username.length < 4 ||
        username.length > 31) {
        return res.status(400).send("Invalid username");
    }
    if (typeof password !== "string" ||
        password.length < 6 ||
        password.length > 255) {
        return res.status(400).send("Invalid password");
    }
    try {
        const user = yield auth.createUser({
            key: {
                providerId: "username",
                providerUserId: username.toLowerCase(),
                password,
            },
            attributes: {
                username,
            },
        });
        const session = yield auth.createSession({
            userId: user.userId,
            attributes: {},
        });
        const authRequest = auth.handleRequest(req, res);
        authRequest.setSession(session);
        return res.sendStatus(201);
    }
    catch (e) {
        if (e instanceof SqliteError && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(400).json({ error: "Username already taken" });
        }
        throw e;
        // return res.status(500).send("An unknown error occurred");
    }
}));
router.patch("/:id", (req, res) => {
    expensesService.editExpense(parseInt(req.params.id), req.body);
    res.sendStatus(200);
});
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (typeof username !== "string" ||
        username.length < 1 ||
        username.length > 31) {
        return res.status(400).send("Invalid username");
    }
    if (typeof password !== "string" ||
        password.length < 1 ||
        password.length > 255) {
        return res.status(400).send("Invalid password");
    }
    try {
        const key = yield auth.useKey("username", username.toLowerCase(), password);
        const session = yield auth.createSession({
            userId: key.userId,
            attributes: {},
        });
        const authRequest = auth.handleRequest(req, res);
        authRequest.setSession(session);
        return res.sendStatus(201);
    }
    catch (e) {
        // check for unique constraint error in user table
        if (e instanceof LuciaError &&
            (e.message === "AUTH_INVALID_KEY_ID" ||
                e.message === "AUTH_INVALID_PASSWORD")) {
            return res.status(400).send("Incorrect username or password");
        }
        throw e;
        // return res.status(500).send("An unknown error occurred");
    }
}));
export default router;
