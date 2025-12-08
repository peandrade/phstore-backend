import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { ZodError } from "zod";

/**
 * Standard error response format
 */
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Error handling middleware
 * Catches all errors and formats them into a consistent response
 */
export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const response: ErrorResponse = {
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: err.issues?.map((e: any) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      },
    };

    logger.warn({ error: err, url: req.url, method: req.method }, "Validation error");
    return res.status(422).json(response);
  }

  // Handle custom AppError instances
  if (err instanceof AppError) {
    const response: ErrorResponse = {
      error: {
        code: err.code,
        message: err.message,
      },
    };

    // Add validation details if it's a ValidationError
    if (err instanceof ValidationError && err.errors) {
      response.error.details = err.errors;
    }

    // Log operational errors as warnings, others as errors
    if (err.isOperational) {
      logger.warn(
        {
          error: err,
          url: req.url,
          method: req.method,
          statusCode: err.statusCode,
        },
        `Operational error: ${err.message}`
      );
    } else {
      logger.error(
        {
          error: err,
          url: req.url,
          method: req.method,
          statusCode: err.statusCode,
        },
        `Non-operational error: ${err.message}`
      );
    }

    return res.status(err.statusCode).json(response);
  }

  // Handle unknown errors (programming errors, unexpected exceptions)
  logger.error(
    {
      error: err,
      url: req.url,
      method: req.method,
      stack: err.stack,
    },
    "Unhandled error"
  );

  const response: ErrorResponse = {
    error: {
      code: "INTERNAL_ERROR",
      message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    },
  };

  return res.status(500).json(response);
};

/**
 * 404 Not Found handler for undefined routes
 * Should be registered after all routes
 */
export const notFoundHandler = (req: Request, res: Response) => {
  const response: ErrorResponse = {
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
    },
  };

  logger.warn({ url: req.url, method: req.method }, "Route not found");
  res.status(404).json(response);
};
