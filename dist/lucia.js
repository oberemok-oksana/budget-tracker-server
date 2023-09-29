import { betterSqlite3 } from "@lucia-auth/adapter-sqlite";
import { lucia } from "lucia";
import { express } from "lucia/middleware";
import db from "./lib/db.js";
// const db = sqlite("expenses.db");
export const auth = lucia({
    adapter: betterSqlite3(db, {
        user: "user",
        key: "user_key",
        session: "user_session",
    }),
    env: "DEV",
    middleware: express(),
    csrfProtection: false,
    getUserAttributes: (data) => {
        return {
            username: data.username,
        };
    },
});
