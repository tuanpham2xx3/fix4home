import { RequestHandler } from "express";
import { ApiResponse, DemoResponse } from "@shared/api";

export const handleDemo: RequestHandler = (req, res) => {
  const data: DemoResponse = {
    message: "Hello from Fix4Home Express server",
  };
  
  const response: ApiResponse<DemoResponse> = {
    success: true,
    message: "Demo endpoint hoạt động tốt",
    data,
    timestamp: new Date().toISOString()
  };
  
  res.status(200).json(response);
};
