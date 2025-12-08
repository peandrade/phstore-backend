import pinoHttp from "pino-http";
import { logger } from "@/lib/logger";
import { randomUUID } from "crypto";

/**
 * Request logging middleware using pino-http
 * Automatically logs all HTTP requests and responses
 * Adds a unique request ID to each request for tracking
 */
export const requestLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    // Generate unique request ID if not present
    const existingId = req.id ?? req.headers["x-request-id"];
    if (existingId) return existingId as string;
    const id = randomUUID();
    res.setHeader("X-Request-Id", id);
    return id;
  },
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) {
      return "error";
    }
    if (res.statusCode >= 400) {
      return "warn";
    }
    if (res.statusCode >= 300) {
      return "info";
    }
    return "info";
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} completed`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} failed: ${err.message}`;
  },
  customProps: (req, res) => {
    return {
      userId: (req as any).userId,
    };
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
      // Don't log body for security (may contain passwords)
      // body: req.raw.body,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});
