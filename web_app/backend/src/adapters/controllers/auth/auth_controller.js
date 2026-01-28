import { z } from 'zod';
import jwt from '@tsndr/cloudflare-worker-jwt';
import { BaseController } from '../base/base_controller.js';

const signUpSchema = z.object({
  email: z.email({ message: 'Invalid email format' }),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.email({ message: 'Invalid email format' }),
  password: z.string().min(1, 'Password is required'),
});

const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
}).refine(data => data.name || data.password, {
  message: 'At least one field (name or password) must be provided',
});

export class AuthController extends BaseController {
  constructor(deps, jwtSecret) {
    super(jwtSecret);
    this.signUpUserService = deps.signUpService;
    this.loginUserService = deps.loginService;
    this.updateUserService = deps.updateUserService;
    this.getUserProfileService = deps.getUserProfileService;
  }

  async signUp(request) {
    try {
      const body = await request.json();

      // Validate input
      const validationResult = signUpSchema.safeParse(body);
      if (!validationResult.success) {
        return this.validationErrorResponse(validationResult.error.issues);
      }

      const command = validationResult.data;

      // Execute sign up
      const user = await this.signUpUserService.execute(command);

      // Generate JWT token using login service
      const { token } = await this.loginUserService.execute({
        email: command.email,
        password: command.password,
      });

      // Return success
      return this.successResponse({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          token,
        },
      }, 201);
    } catch (error) {
      console.error('Sign up error:', error);

      if (error.message === 'Email already in use') {
        return this.errorResponse('EMAIL_IN_USE', 'Email already in use', 409);
      }

      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }

  async login(request) {
    try {
      const body = await request.json();

      // Validate input
      const validationResult = loginSchema.safeParse(body);
      if (!validationResult.success) {
        return this.validationErrorResponse(validationResult.error.issues);
      }

      const command = validationResult.data;

      // Execute login
      const { user, token } = await this.loginUserService.execute(command);

      // Return success with token
      return this.successResponse({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          token,
        },
      });
    } catch (error) {
      console.error('Login error:', error);

      if (error.message === 'Invalid email or password') {
        return this.errorResponse('INVALID_CREDENTIALS', 'Invalid email or password', 401);
      }

      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }

  async updateUser(request) {
    try {
      const userId = await this.authenticate(request);

      const body = await request.json();

      // Validate input
      const validationResult = updateUserSchema.safeParse(body);
      if (!validationResult.success) {
        return this.validationErrorResponse(validationResult.error.issues);
      }

      const command = {
        ...validationResult.data,
        userId,
        requesterId: userId,
      };

      // Execute update
      const updatedUser = await this.updateUserService.execute(command);

      // Return success
      return this.successResponse({
        success: true,
        data: {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
          },
        },
      });
    } catch (error) {
      console.error('Update user error:', error);

      if (error instanceof Response) {
        return error;
      }

      if (error.message === 'User not found') {
        return this.errorResponse('USER_NOT_FOUND', 'User not found', 404);
      }

      if (error.message === 'Unauthorized: Can only update your own profile') {
        return this.errorResponse('UNAUTHORIZED', 'Unauthorized', 403);
      }

      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }

    async getUserProfile(request) {
    try {
      const userId = await this.authenticate(request);

      const profile = await this.getUserProfileService.execute({ userId });

      return this.successResponse({
        success: true,
        data: { profile },
      });
    } catch (error) {
      console.error('Get user profile error:', error);

      if (error instanceof Response) {
        return error;
      }

      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }


  async googleAuth(request, env) {
    try {
      const clientId = env.GOOGLE_CLIENT_ID;
      const redirectUri = env.GOOGLE_REDIRECT_URI || `${new URL(request.url).origin}/api/auth/google/callback`;

      if (!clientId) {
        return this.errorResponse('CONFIG_ERROR', 'Google OAuth not configured', 500);
      }

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'openid email profile',
          access_type: 'offline',
        });

      return new Response(null, {
        status: 302,
        headers: {
          Location: authUrl,
        },
      });
    } catch (error) {
      console.error('Google auth error:', error);
      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }

  async googleAuthCallback(request, env) {
    try {
      const url = new URL(request.url);
      const code = url.searchParams.get('code');

      if (!code) {
        return this.errorResponse('INVALID_REQUEST', 'Authorization code missing', 400);
      }

      const clientId = env.GOOGLE_CLIENT_ID;
      const clientSecret = env.GOOGLE_CLIENT_SECRET;
      const redirectUri = env.GOOGLE_REDIRECT_URI || `${url.origin}/api/auth/google/callback`;

      if (!clientId || !clientSecret) {
        return this.errorResponse('CONFIG_ERROR', 'Google OAuth not configured', 500);
      }

      // Exchange code for token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        console.error('Token exchange failed:', await tokenResponse.text());
        return this.errorResponse('OAUTH_ERROR', 'Failed to exchange code for token', 500);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Get user info
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userResponse.ok) {
        console.error('User info fetch failed:', await userResponse.text());
        return this.errorResponse('OAUTH_ERROR', 'Failed to get user info', 500);
      }

      const googleUser = await userResponse.json();
      const { id: googleId, email, name } = googleUser;

      // Use sign up service to find or create user
      const user = await this.signUpUserService.execute({
        email,
        name,
        googleId,
      });

      // Generate JWT token directly
      const token = await jwt.sign({
        userId: user.id,
        email: user.email,
      }, this.jwtSecret);

      // Return success with token
      return this.successResponse({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          token,
        },
      });
    } catch (error) {
      console.error('Google auth callback error:', error);

      if (error.message === 'Email already in use') {
        return this.errorResponse('EMAIL_IN_USE', 'Email already in use', 409);
      }

      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }

  async googleLogin(request, env) {
    try {
      const body = await request.json();
      const { idToken } = body;

      if (!idToken) {
        return this.errorResponse('INVALID_REQUEST', 'ID token missing', 400);
      }

      const clientId = env.GOOGLE_CLIENT_ID;
      if (!clientId) {
        return this.errorResponse('CONFIG_ERROR', 'Google OAuth not configured', 500);
      }

      // Verify ID token
      const decoded = await jwt.verify(idToken, 'https://www.googleapis.com/oauth2/v3/certs', {
        audience: clientId,
        issuer: 'https://accounts.google.com',
      });

      if (!decoded) {
        return this.errorResponse('INVALID_TOKEN', 'Invalid ID token', 401);
      }

      const { sub: googleId, email, name } = decoded.payload;

      // Use sign up service to find or create user
      const user = await this.signUpUserService.execute({
        email,
        name,
        googleId,
      });

      // Generate JWT token
      const token = await jwt.sign({
        userId: user.id,
        email: user.email,
      }, this.jwtSecret);

      // Return success with token
      return this.successResponse({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          token,
        },
      });
    } catch (error) {
      console.error('Google login error:', error);

      if (error.message === 'Email already in use') {
        return this.errorResponse('EMAIL_IN_USE', 'Email already in use', 409);
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return this.errorResponse('INVALID_TOKEN', 'Invalid ID token', 401);
      }

      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }
}