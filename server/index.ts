import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

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

  // Mount router with v1 prefix
  app.use("/api/v1", router);

  return app;
}
