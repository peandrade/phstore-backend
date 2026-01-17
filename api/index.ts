import { register } from "tsconfig-paths";
import { join } from "path";

// Register path aliases with explicit base URL
register({
  baseUrl: join(__dirname, ".."),
  paths: { "@/*": ["src/*"] }
});

// Now import the app after registering paths
import("../src/server").then((module) => {
  exports.default = module.default;
});

// For Vercel to recognize this as a handler, we need a sync export
// We'll use a wrapper that waits for the app to be loaded
import type { VercelRequest, VercelResponse } from "@vercel/node";

let appPromise: Promise<any> | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!appPromise) {
    register({
      baseUrl: join(__dirname, ".."),
      paths: { "@/*": ["src/*"] }
    });
    appPromise = import("../src/server");
  }

  const { default: app } = await appPromise;
  return app(req, res);
}
