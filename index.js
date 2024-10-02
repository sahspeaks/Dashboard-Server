import AdminJSExpress from "@adminjs/express";
import express from "express";
import mongoose from "mongoose";

import { PORT, MONGODB_URI, DB_NAME } from "./src/constants/env.constants.js";
import { admin } from "./src/config/AdminJsConfig.js";
import { sessionStore, authenticate } from "./src/config/config.js";

// const PORT = 3000;
// const MONGODB_URI =
//   "mongodb+srv://akroy2456:abhishek@cluster0.fan8t.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";
// const DEFAULT_ADMIN = {
//   email: "sahspeaks@gmail.com",
//   password: "abhishek",
// };

// const authenticate = async (email, password) => {
//   if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
//     return Promise.resolve(DEFAULT_ADMIN);
//   }
//   return null;
// };

// AdminJS.registerAdapter({
//   Resource: AdminJSMongoose.Resource,
//   Database: AdminJSMongoose.Database,
// });

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

  app.listen(PORT, () => {
    console.log(
      `AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`
    );
  });
};

start();
