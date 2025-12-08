import "dotenv/config";
import express from "express";
import cors from "cors";
import { routes } from "@/routes/main";
import { validateEnv } from "@/utils/validateEnv";
import { logger } from "@/lib/logger";
import { requestLogger } from "@/middleware/requestLogger";
import { errorHandler, notFoundHandler } from "@/middleware/errorHandler";
import { globalRateLimiter } from "@/middleware/rateLimiter";

// Validate environment variables before starting the server
validateEnv();

const server = express();
server.use(cors());
server.use(express.static("public"));

// Global rate limiter (must be before other middleware that could cause errors)
server.use(globalRateLimiter);

server.use("/webhook/stripe", express.raw({ type: "application/json" }));
server.use(express.json());

// Request logging middleware (logs all HTTP requests)
server.use(requestLogger);

server.use(routes);

// 404 handler for undefined routes (must be after all routes)
server.use(notFoundHandler);

// Global error handler (must be last)
server.use(errorHandler);

server.listen(4000, () => {
  logger.info("PHstore backend running on port 4000");
});
