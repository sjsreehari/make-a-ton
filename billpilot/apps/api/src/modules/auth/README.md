# Auth Module (Person A)

## Implemented
- Sign-up with password policy validation and case-insensitive email uniqueness
- Login with argon2 password verification and token generation (access 15m, refresh 7d)
- Password reset flow with SHA-256 hashed single-use tokens expiring in 30 minutes
- Generic response for password reset to prevent account enumeration
- GET /api/v1/auth/me for current user profile

## Next Tasks for Person A
- [ ] Connect Mailhog nodemailer integration for reset email delivery
- [ ] Refresh token rotation endpoint POST /api/v1/auth/refresh
- [ ] Logout endpoint to revoke active refresh tokens

