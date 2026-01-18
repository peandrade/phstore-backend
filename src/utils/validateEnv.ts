import { z } from "zod";

/**
 * Environment variables schema
 * Validates all required environment variables at application startup
 */
const envSchema = z.object({
  // Server configuration
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  BASE_URL: z.string().url().default("https://phstore-backend-production.up.railway.app"),

  // Frontend configuration
  FRONTEND_URL: z.string().url({
    message: "FRONTEND_URL must be a valid URL (e.g., http://localhost:3000)",
  }),

  // Database configuration
  DATABASE_URL: z.string().min(1, {
    message: "DATABASE_URL is required for database connection",
  }),

  // Authentication configuration
  JWT_SECRET: z.string().min(32, {
    message: "JWT_SECRET is required for signing access tokens (minimum 32 characters)",
  }),

  JWT_REFRESH_SECRET: z.string().min(32, {
    message: "JWT_REFRESH_SECRET is required for signing refresh tokens (minimum 32 characters)",
  }),

  // Stripe configuration
  STRIPE_SECRET_KEY: z
    .string()
    .min(1, {
      message: "STRIPE_SECRET_KEY is required for payment processing",
    })
    .refine((key) => key.startsWith("sk_"), {
      message: "STRIPE_SECRET_KEY must start with 'sk_'",
    }),

  STRIPE_WEBHOOK_KEY: z
    .string()
    .min(1, {
      message: "STRIPE_WEBHOOK_KEY is required for webhook signature verification",
    })
    .refine((key) => key.startsWith("whsec_"), {
      message: "STRIPE_WEBHOOK_KEY must start with 'whsec_'",
    }),

  // Optional configuration
  PRODUCT_IMAGE_PATH: z.string().default("media/products/"),
  POSTGRES_URL: z.string().optional(),
  PRISMA_DATABASE_URL: z.string().optional(),
  VERCEL_OIDC_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

/**
 * Validates environment variables
 * @throws {Error} If validation fails with detailed error messages
 * @returns {Env} Validated and typed environment variables
 */
export function validateEnv(): Env;
export function validateEnv<K extends keyof Env>(key: K): Env[K];
export function validateEnv<K extends keyof Env>(key?: K): Env | Env[K] {
  if (!cachedEnv) {
    try {
      cachedEnv = envSchema.parse(process.env);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const missingVars = error.issues.map((err) => {
          const path = err.path.join(".");
          return `  - ${path}: ${err.message}`;
        });

        const errorMessage = [
          "❌ Environment variable validation failed:",
          "",
          ...missingVars,
          "",
          "Please check your .env file and ensure all required variables are set.",
          "See .env.example for reference.",
        ].join("\n");

        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  if (key) {
    return cachedEnv[key];
  }

  return cachedEnv;
}
