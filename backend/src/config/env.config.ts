export const envConfig = () => ({
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '8000', 10),

  MONGO_URI: process.env.MONGO_URI,

  CLERK_PUBLISHABLE_KEY: process.env.CLERK_ISSUER,

  CLERK_SECRET_KEY: process.env.CLERK_JWKS_URL,

  NIM_API_KEY: process.env.NIM_API_KEY,

  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
});
