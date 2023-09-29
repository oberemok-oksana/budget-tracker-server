import express, { Request, Response } from "express";
import expensesService from "./services/expensesService.js";
import { auth } from "./lucia.js";
import { SqliteError } from "better-sqlite3";
import { LuciaError } from "lucia";
import { getUserSession } from "./lib/lib.js";

const router = express.Router();

router.get("/expenses", async (req: Request, res: Response) => {
  const { date, filter } = req.query;
  const session = await getUserSession(req, res);
  res.json(
    expensesService.getFilteredExpenses(
      session.user.userId as string,
      date as string,
      filter as string
    )
  );
});

router.get("/user", async (req: Request, res: Response) => {
  const session = await getUserSession(req, res);
  if (session) {
    res.json(session.user);
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

router.delete("/logout", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();

  if (!session) {
    return res.sendStatus(401);
  }
  await auth.invalidateSession(session.sessionId);

  authRequest.setSession(null); // for session cookie

  // redirect back to login page
  return res.sendStatus(200);
});

router.delete("/expenses/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const session = await getUserSession(req, res);
  if (session) {
    expensesService.deleteExpense(session.user.userId, id);
    res.sendStatus(200);
  } else {
    res.sendStatus(403);
  }
});

router.post("/expenses", async (req: Request, res: Response) => {
  const session = await getUserSession(req, res);

  if (session) {
    const userId = session.user.userId;

    expensesService.addExpense(req.body, userId);
    res.sendStatus(201);
  } else {
    res.sendStatus(403);
  }
});

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  if (
    typeof username !== "string" ||
    username.length < 4 ||
    username.length > 31
  ) {
    return res.status(400).send("Invalid username");
  }
  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return res.status(400).send("Invalid password");
  }
  try {
    const user = await auth.createUser({
      key: {
        providerId: "username",
        providerUserId: username.toLowerCase(),
        password,
      },
      attributes: {
        username,
      },
    });
    const session = await auth.createSession({
      userId: user.userId,
      attributes: {},
    });
    const authRequest = auth.handleRequest(req, res);
    authRequest.setSession(session);

    return res.sendStatus(201);
  } catch (e) {
    if (e instanceof SqliteError && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(400).json({ error: "Username already taken" });
    }
    throw e;
    // return res.status(500).send("An unknown error occurred");
  }
});

router.patch("/expenses/:id", async (req: Request, res: Response) => {
  const session = await getUserSession(req, res);
  expensesService.editExpense(
    session.user.userId,
    parseInt(req.params.id),
    req.body
  );

  res.sendStatus(200);
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (
    typeof username !== "string" ||
    username.length < 1 ||
    username.length > 31
  ) {
    return res.status(400).send("Invalid username");
  }
  if (
    typeof password !== "string" ||
    password.length < 1 ||
    password.length > 255
  ) {
    return res.status(400).send("Invalid password");
  }
  try {
    const key = await auth.useKey("username", username.toLowerCase(), password);
    const session = await auth.createSession({
      userId: key.userId,
      attributes: {},
    });
    const authRequest = auth.handleRequest(req, res);
    authRequest.setSession(session);

    return res.sendStatus(201);
  } catch (e) {
    // check for unique constraint error in user table
    if (
      e instanceof LuciaError &&
      (e.message === "AUTH_INVALID_KEY_ID" ||
        e.message === "AUTH_INVALID_PASSWORD")
    ) {
      return res.status(400).send("Incorrect username or password");
    }
    throw e;

    // return res.status(500).send("An unknown error occurred");
  }
});

export default router;
