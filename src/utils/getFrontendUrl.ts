export const getFrontendURL = () => {
  const url = process.env.FRONTEND_URL;
  if (!url) {
    throw new Error("FRONTEND_URL is not defined in environment variables");
  }
  return url;
};
