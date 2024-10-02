import dotenv from "dotenv";
dotenv.config({
  path: ".env",
});

const PORT = process.env.PORT || 5000;

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

const DB_NAME = "blinkit";

const SESSION_SECRET =
  process.env.SESSION_SECRET || "sieL67H7GbkzJ4XCoH0IHcmO1hGBSiG5";

const NODE_ENV = process.env.NODE_ENV || "production";

const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "refreshTokenSecret";

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "accessTokenSecret";

export {
  PORT,
  MONGODB_URI,
  DB_NAME,
  SESSION_SECRET,
  NODE_ENV,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_SECRET,
};

console.table([PORT, MONGODB_URI, DB_NAME, SESSION_SECRET, NODE_ENV]);
