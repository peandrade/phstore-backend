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

server.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

server.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

server.use(express.static("public"));

server.use(globalRateLimiter);

server.use((req, res, next) => {
  if (req.originalUrl === "/webhook/stripe") {
    express.raw({ type: "application/json" })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

server.use(requestLogger);

server.use(routes);

server.use(notFoundHandler);

server.use(errorHandler);

const isVercel = process.env.VERCEL === "1";

if (!isVercel) {
  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => {
    logger.info(`PHstore backend running on port ${PORT}`);
  });
}

export default server;
