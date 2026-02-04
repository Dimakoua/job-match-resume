# Environment Setup

This backend requires specific environment variables to be configured for security and proper operation.

## Required Environment Variables

### JWT_SECRET
- **Purpose**: Secret key for signing and verifying JWT tokens
- **Security**: Must be at least 32 characters long
- **Example**: Use a strong random string (you can generate one with `openssl rand -hex 32`)

### GEMINI_API_KEY
- **Purpose**: API key for Google Gemini AI service
- **Source**: Obtain from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Security**: Never commit real API keys to version control

## Setup Instructions

1. **Copy the example file**:
   ```bash
   cp .env.example .env.development
   ```

2. **Fill in your actual values**:
   - Replace `your-development-jwt-secret-here` with a real JWT secret
   - Replace `your-gemini-api-key-here` with your actual Gemini API key

3. **For production deployment**:
   - Set `JWT_SECRET` and `GEMINI_API_KEY` in your Cloudflare Workers environment
   - Or update `wrangler.toml` with your production values (never commit real secrets)

## Security Notes

- `.env` files are ignored by git and should never be committed
- Use different secrets for development, staging, and production
- Rotate secrets regularly
- Never share API keys or secrets in code, documentation, or chat

## Validation

The application will validate environment variables at startup and fail to start if:
- Required variables are missing
- Variables contain placeholder values
- JWT secret is too short (< 32 characters)