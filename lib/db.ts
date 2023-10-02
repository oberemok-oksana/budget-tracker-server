import Database from "better-sqlite3";

const getDatabaseName = () => {
  if (process.env.NODE_ENV === "test") {
    return ":memory:";
  }

  return "expenses.db";
};

const db = new Database(getDatabaseName());
db.pragma("journal_mode = WAL");

export const setupDB = () => {
  db.exec(`
CREATE TABLE user_key (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    hashed_password TEXT,
    FOREIGN KEY (user_id) REFERENCES user(id)
);`);
  db.exec(`
CREATE TABLE user_session (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL, active_expires INTEGER NOT NULL, idle_expires INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
);`);
  db.exec(`CREATE TABLE expenses (user_id TEXT NOT NULL,
id INTEGER PRIMARY KEY AUTOINCREMENT,
category TEXT NOT NULL,
sub_category TEXT,
date TEXT NOT NULL,
payment TEXT NOT NULL,
currency TEXT NOT NULL,
amount REAL NOT NULL,
comment TEXT);
CREATE TABLE user (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE
);
`);
};

export default db;
