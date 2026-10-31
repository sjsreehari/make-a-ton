import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { UsersService } from './users.service';
import { CreateStaffDto, createStaffSchema } from './users.dto';
import type { JwtPayload } from '../../common/guards/roles.guard';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('staff')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create new staff member (Admin only)' })
  async createStaff(
    @Body(new ZodValidationPipe(createStaffSchema)) dto: CreateStaffDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usersService.createStaff(dto, user.sub);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List all users with pagination (Admin only)' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: string,
  ) {
    return this.usersService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      role,
    });
  }
}
