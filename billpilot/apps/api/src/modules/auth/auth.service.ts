import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CommonAuditService } from '../../common/audit/audit.service';
import { SignupDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './auth.dto';
import { RESET_TOKEN_EXPIRES_MINUTES } from '@billpilot/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly audit: CommonAuditService,
  ) {}

  async signup(dto: SignupDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    // Check uniqueness (case-insensitive)
    const existing = await this.prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: 'insensitive' },
      },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await argon2.hash(dto.password);

    // Create a customer profile for CUSTOMER users
    const customer = await this.prisma.customer.create({
      data: {
        name: dto.name,
        email: normalizedEmail,
        phone: dto.phone,
        currency: 'INR',
      },
    });

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: normalizedEmail,
        phone: dto.phone,
        passwordHash,
        role: 'CUSTOMER',
        customerId: customer.id,
      },
    });

    await this.audit.log({
      actor: { id: user.id, role: user.role, customerId: customer.id },
      entity: 'User',
      entityId: user.id,
      action: 'USER_REGISTERED',
      after: { email: user.email, role: user.role },
    });

    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        customerId: user.customerId,
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const user = await this.prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: 'insensitive' },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.audit.log({
      actor: { id: user.id, role: user.role, customerId: user.customerId || undefined },
      entity: 'User',
      entityId: user.id,
      action: 'USER_LOGGED_IN',
    });

    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        customerId: user.customerId,
      },
      ...tokens,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const user = await this.prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: 'insensitive' },
      },
    });

    // Always return generic 200 response to prevent user enumeration
    if (!user) {
      return { message: 'If that email is registered, a password reset link has been sent.' };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRES_MINUTES * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // In local dev, email goes to Mailhog (localhost:1025)
    return {
      message: 'If that email is registered, a password reset link has been sent.',
      devToken: process.env.NODE_ENV !== 'production' ? rawToken : undefined,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');

    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Reset token is invalid or has expired');
    }

    const passwordHash = await argon2.hash(dto.password);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    await this.audit.log({
      actor: { id: resetToken.userId, role: resetToken.user.role },
      entity: 'User',
      entityId: resetToken.userId,
      action: 'PASSWORD_RESET',
    });

    return { message: 'Password has been successfully updated.' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        customerId: true,
        whatsappOptIn: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return user;
  }

  private async generateTokens(user: { id: string; email: string; role: string; customerId?: string | null }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      customerId: user.customerId || undefined,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET', 'changeme-access-secret-min-32-chars'),
      expiresIn: this.config.get<string>('JWT_ACCESS_TTL', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET', 'changeme-refresh-secret-min-32-chars'),
      expiresIn: this.config.get<string>('JWT_REFRESH_TTL', '7d'),
    });

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 86400000);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }
}

