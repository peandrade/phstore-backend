import "dotenv/config";
import express from "express";
import cors from "cors";
import { routes } from "@/routes/main";
import { validateEnv } from "@/utils/validateEnv";
import { logger } from "@/lib/logger";
import { requestLogger } from "@/middleware/requestLogger";
import { errorHandler, notFoundHandler } from "@/middleware/errorHandler";
import { globalRateLimiter } from "@/middleware/rateLimiter";

validateEnv();

const server = express();

const allowedOrigins = [
  "http://localhost:3000"
].filter(Boolean) as string[];

server.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

server.use(express.static("public"));

server.use(globalRateLimiter);

server.use("/webhook/stripe", express.raw({ type: "application/json" }));
server.use(express.json());

server.use(requestLogger);

server.use(routes);

server.use(notFoundHandler);

server.use(errorHandler);

server.listen(4000, () => {
  logger.info("PHstore backend running on port 4000");
});
