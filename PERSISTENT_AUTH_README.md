# Persistent Authentication Implementation

## Overview
This implementation provides persistent authentication for users, allowing them to stay logged in for 10 days even after closing and reopening their browser.

## Features

### Backend Changes

1. **Token Expiry Configuration**
   - Access Token: 1 hour
   - Refresh Token: 10 days
   - Tokens are automatically refreshed when the access token expires

2. **Cookie Configuration**
   - HTTP-only cookies for security
   - Secure cookies in production (HTTPS required)
   - SameSite policy: 'strict' in production, 'lax' in development
   - Refresh token cookie expires in 10 days
   - Access token cookie expires in 1 hour

3. **Automatic Token Refresh**
   - Backend automatically generates new access and refresh tokens
   - Refresh tokens are stored in the database
   - Invalid refresh tokens are rejected

### Frontend Changes

1. **Automatic Token Refresh**
   - API interceptor automatically refreshes tokens on 401 errors
   - Seamless user experience - no manual re-authentication needed
   - Automatic redirect to login if refresh fails

2. **Persistent Authentication State**
   - App checks authentication status on startup
   - Automatically refreshes tokens if needed
   - Maintains user session across browser restarts

## How It Works

1. **Login Process**
   - User logs in with credentials
   - Server generates access token (1 hour) and refresh token (10 days)
   - Both tokens are stored as HTTP-only cookies
   - Refresh token is also stored in the database

2. **Token Refresh Process**
   - When access token expires, frontend receives 401 error
   - API interceptor automatically calls refresh endpoint
   - Server validates refresh token and generates new tokens
   - New tokens are sent as cookies
   - Original request is retried with new access token

3. **Session Persistence**
   - Refresh token cookie persists for 10 days
   - User remains logged in across browser sessions
   - After 10 days, user must log in again

## Security Features

- HTTP-only cookies prevent XSS attacks
- Secure cookies in production (HTTPS only)
- SameSite policy prevents CSRF attacks
- Refresh tokens are stored in database and validated
- Automatic token rotation on refresh

## Environment Variables

The following environment variables should be configured in your `.env` file:

```env
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
ACCESS_TOKEN_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=10d
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
PORT=8000
```

**Note:** The application uses dotenv to automatically load environment variables from the `.env` file, so no additional configuration is needed.

## Usage

Users will now:
1. Log in once
2. Stay logged in for 10 days
3. Automatically get new tokens when needed
4. Only need to log in again after 10 days or manual logout

The authentication is completely transparent to the user - they won't notice any difference except that they don't need to log in every time they close and reopen their browser. 