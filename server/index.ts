import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleUpdateProfile, handleGetLoggedInUser, handleUpdateUser, handleChangePassword } from "./routes/profile";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Profile API routes
  app.get("/api/users/get-loggedIn-user", handleGetLoggedInUser);
  app.put("/api/users/profile", handleUpdateProfile);
  app.put("/api/users/update", handleUpdateUser);
  app.post("/api/users/change-password", handleChangePassword);

  return app;
}
