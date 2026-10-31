import { Controller, Post, Get, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { UsersService } from './users.service';
import { CreateStaffDto, createStaffSchema } from './users.dto';
import type { JwtPayload } from '../../common/guards/roles.guard';

@ApiTags('Users & Customers')
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

  @Delete('staff/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete or deactivate staff member (Admin only)' })
  async deleteStaff(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.usersService.deleteStaff(id, user.sub);
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

  @Get('customers')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'List all customers with credit balance and subscription count' })
  async findCustomers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.findCustomers({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @Post('customers')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Create a new customer profile' })
  async createCustomer(
    @Body() dto: { name: string; email: string; phone?: string; company?: string; gstin?: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usersService.createCustomer(dto, user.sub);
  }

  @Delete('customers/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete customer profile' })
  async deleteCustomer(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.usersService.deleteCustomer(id, user.sub);
  }
}
