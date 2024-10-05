import AdminJSExpress from "@adminjs/express";
import express from "express";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

import { PORT, MONGODB_URI, DB_NAME } from "./src/constants/env.constants.js";
import { admin } from "./src/config/AdminJsConfig.js";
import { sessionStore, authenticate } from "./src/config/config.js";

//import Routes
import userRoutes from "./src/routes/user.route.js";
import productRoutes from "./src/routes/product.route.js";
import orderRoutes from "./src/routes/order.route.js";

const start = async () => {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    pingInterval: 10000,
    pingTimeout: 5000,
    transports: ["websocket"],
  });
  app.use((req, res, next) => {
    req.io = io;
    next();
  });

  // Basic route to test if server is running
  app.get("/", (req, res) => {
    res.send("Server is running");
  });

  io.on("connection", (socket) => {
    console.log("A User Connected ☑");

    socket.on("joinRoom", (orderId) => {
      socket.join(orderId);
      console.log(`User Joined room ${orderId}`);
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected X");
    });
  });

  await mongoose.connect(MONGODB_URI);

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate,
      cookieName: "adminjs",
      cookiePassword: "sessionsecret",
    },
    null,
    {
      store: sessionStore,
      resave: true,
      saveUninitialized: true,
      secret: "sessionsecret",
      cookie: {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      },
      name: "adminjs",
    }
  );
  app.use(admin.options.rootPath, adminRouter);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  //Implementing Routes
  app.use("/api", userRoutes);
  app.use("/api", productRoutes);
  app.use("/api", orderRoutes);

  server.listen(PORT, () => {
    console.log(
      `AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`
    );
  });
};

start();
