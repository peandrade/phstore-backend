// Register module aliases before any other imports
import "module-alias/register";

// Import the Express app
import app from "../src/server";

// Export for Vercel serverless
export default app;
