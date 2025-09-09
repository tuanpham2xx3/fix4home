import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleLogin, handleGetCurrentUser, handleLogout, handleRefreshToken } from "./routes/auth";
import { handleGetChats, handleGetChatMessages, handleSendMessage, handleCreateChat, handleMarkAsRead } from "./routes/chat";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Add API v1 prefix for all routes
  const router = express.Router();

  // Example API routes (updated with v1 prefix)
  router.get("/ping", (_req, res) => {
    res.json({ 
      success: true,
      message: "Fix4Home API Server đang hoạt động",
      timestamp: new Date().toISOString()
    });
  });

  router.get("/demo", handleDemo);

  // Auth routes
  router.post("/auth/login", handleLogin);
  router.get("/auth/me", handleGetCurrentUser);
  router.post("/auth/logout", handleLogout);
  router.post("/auth/refresh-token", handleRefreshToken);

  // Chat routes
  router.get("/chats", handleGetChats);
  router.get("/chats/:chatId/messages", handleGetChatMessages);
  router.post("/chats/:chatId/messages", handleSendMessage);
  router.post("/chats", handleCreateChat);
  router.put("/chats/:chatId/read", handleMarkAsRead);

  // Mount router with v1 prefix
  app.use("/api/v1", router);

  return app;
}
