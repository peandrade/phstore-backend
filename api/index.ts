// Register path aliases before any other imports
import "tsconfig-paths/register";

// Import the Express app
import app from "../src/server";

// Export for Vercel serverless
export default app;
