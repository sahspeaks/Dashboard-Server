import AdminJSExpress from "@adminjs/express";
import express from "express";
import mongoose from "mongoose";

import { PORT, MONGODB_URI, DB_NAME } from "./src/constants/env.constants.js";
import { admin } from "./src/config/AdminJsConfig.js";
import { sessionStore, authenticate } from "./src/config/config.js";

//import Routes
import userRoutes from "./src/routes/user.route.js";

const start = async () => {
  const app = express();

  await mongoose.connect(MONGODB_URI);
  // const admin = new AdminJS({
  //   resources: [
  //     {
  //       resource: Models.Customer,
  //       options: {
  //         listProperties: ["phone", "role", "isActivated"],
  //         filterProperties: ["phone", "role"],
  //       },
  //     },
  //     {
  //       resource: Models.DeliveryPartner,
  //       options: {
  //         listProperties: ["email", "role", "isActivated"],
  //         filterProperties: ["email", "role"],
  //       },
  //     },
  //     {
  //       resource: Models.Admin,
  //       options: {
  //         listProperties: ["email", "role", "isActivated"],
  //         filterProperties: ["email", "role"],
  //       },
  //     },
  //     {
  //       resource: Models.Branch,
  //     },
  //   ],
  //   branding: {
  //     companyName: "BlinkIt",
  //     withMadeWithLove: false,
  //   },
  //   rootPath: "/admin",
  // });

  // const MongoDBStore = ConnectMongoDBSession(session);

  // const sessionStore = new MongoDBStore({
  //   uri: MONGODB_URI,
  //   collection: "sessions",
  // });

  // sessionStore.on("error", (error) => {
  //   console.log("Session store error", error);
  // });
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

  app.listen(PORT, () => {
    console.log(
      `AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`
    );
  });
};

start();
