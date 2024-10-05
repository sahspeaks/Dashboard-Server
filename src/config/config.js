import session from "express-session";
import ConnectMongoDBSession from "connect-mongodb-session";
import { MONGODB_URI } from "../constants/env.constants.js";
import { Admin } from "../models/index.js";

const MongoDBStore = ConnectMongoDBSession(session);

export const sessionStore = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

sessionStore.on("error", (error) => {
  console.log("Session store error", error);
});

export const authenticate = async (email, password) => {
  if (email && password) {
    const user = await Admin.findOne({ email });
    if (!user) {
      console.log("User not found");
      return Promise.resolve(null);
    }
    if (user.password === password) {
      console.log("User found", user.email, user.password);
      return Promise.resolve({ email: user.email, password: user.password });
    } else {
      return Promise.resolve(null);
    }
  }
};
