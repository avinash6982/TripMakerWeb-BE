const express = require("express");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const DEFAULT_USER_DB_PATH = path.resolve("data/users.json");
const TMP_USER_DB_PATH = path.join(os.tmpdir(), "tripmaker-users.json");
let usersFilePath = path.resolve(
  process.env.USER_DB_PATH ||
    (process.env.VERCEL ? TMP_USER_DB_PATH : DEFAULT_USER_DB_PATH)
);

const rawCorsOrigins =
  process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || "*";
const allowedOrigins = rawCorsOrigins
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowAnyOrigin =
  allowedOrigins.length === 0 || allowedOrigins.includes("*");

const PASSWORD_SALT_BYTES = 16;
const PASSWORD_KEYLEN = 64;

let writeQueue = Promise.resolve();

app.use(express.json({ limit: "10kb" }));

function getUsersFilePath() {
  return usersFilePath;
}

function isReadonlyError(error) {
  return error && (error.code === "EROFS" || error.code === "EPERM");
}

function applyCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (!origin) {
    return true;
  }
  if (allowAnyOrigin) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return true;
  }
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    return true;
  }
  return false;
}

app.use((req, res, next) => {
  const originAllowed = applyCorsHeaders(req, res);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  if (req.method === "OPTIONS") {
    return originAllowed
      ? res.sendStatus(204)
      : res.status(403).json({ error: "Origin not allowed." });
  }
  if (!originAllowed) {
    return res.status(403).json({ error: "Origin not allowed." });
  }
  return next();
});

async function ensureUsersFile() {
  const currentPath = getUsersFilePath();
  const dir = path.dirname(currentPath);
  try {
    await fs.mkdir(dir, { recursive: true });
    try {
      await fs.access(currentPath);
    } catch (error) {
      if (error && error.code !== "ENOENT") {
        throw error;
      }
      await fs.writeFile(currentPath, "[]");
    }
  } catch (error) {
    if (isReadonlyError(error) && currentPath !== TMP_USER_DB_PATH) {
      usersFilePath = TMP_USER_DB_PATH;
      return ensureUsersFile();
    }
    throw error;
  }
}

async function readUsers() {
  await writeQueue;
  await ensureUsersFile();
  const raw = await fs.readFile(getUsersFilePath(), "utf8");
  if (!raw.trim()) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    error.message = `Invalid users data file: ${error.message}`;
    throw error;
  }
}

async function writeUsers(users) {
  await ensureUsersFile();
  writeQueue = writeQueue.then(async () => {
    try {
      await fs.writeFile(getUsersFilePath(), JSON.stringify(users, null, 2));
    } catch (error) {
      if (isReadonlyError(error) && getUsersFilePath() !== TMP_USER_DB_PATH) {
        usersFilePath = TMP_USER_DB_PATH;
        await ensureUsersFile();
        await fs.writeFile(
          getUsersFilePath(),
          JSON.stringify(users, null, 2)
        );
      } else {
        throw error;
      }
    }
  });
  return writeQueue;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(PASSWORD_SALT_BYTES).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, PASSWORD_KEYLEN);
  return `${salt}:${derivedKey.toString("hex")}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) {
    return false;
  }
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) {
    return false;
  }
  const derivedKey = crypto.scryptSync(password, salt, PASSWORD_KEYLEN);
  const storedBuffer = Buffer.from(hash, "hex");
  if (storedBuffer.length !== derivedKey.length) {
    return false;
  }
  return crypto.timingSafeEqual(storedBuffer, derivedKey);
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/register", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required.",
      });
    }

    const users = await readUsers();
    const existing = users.find((user) => user.email === email);

    if (existing) {
      return res.status(409).json({
        error: "Email is already registered.",
      });
    }

    const newUser = {
      id: crypto.randomUUID(),
      email,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await writeUsers(users);

    return res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      createdAt: newUser.createdAt,
    });
  } catch (error) {
    return next(error);
  }
});

app.post("/login", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required.",
      });
    }

    const users = await readUsers();
    const user = users.find((candidate) => candidate.email === email);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({
        error: "Invalid credentials.",
      });
    }

    return res.status(200).json({
      id: user.id,
      email: user.email,
      message: "Login successful.",
    });
  } catch (error) {
    return next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found." });
});

app.use((err, _req, res, _next) => {
  const status = err.statusCode || err.status || 500;
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({
    error: status === 500 ? "Internal server error." : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Auth server listening on port ${PORT}`);
});
