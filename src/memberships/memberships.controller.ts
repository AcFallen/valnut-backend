import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { CreateTenantMembershipDto } from './dto/create-tenant-membership.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RequirePermissions } from '../core/decorators/require-permissions.decorator';
import { RequireTenant } from '../core/decorators/require-tenant.decorator';
import { PermissionsGuard } from '../core/guards/permissions.guard';
import { TenantGuard } from '../core/guards/tenant.guard';
import { PERMISSIONS } from '../common/constants';

@ApiTags('memberships')
@Controller('memberships')
@ApiBearerAuth()
@UseGuards(TenantGuard) // PermissionsGuard temporalmente deshabilitado
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  // Memberships management (System Admin only)
  @Post()
  @RequirePermissions(PERMISSIONS.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Create a new membership plan (System Admin only)' })
  @ApiResponse({ status: 201, description: 'Membership created successfully' })
  async createMembership(@Body() createMembershipDto: CreateMembershipDto) {
    return await this.membershipsService.createMembership(createMembershipDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active membership plans' })
  @ApiResponse({ status: 200, description: 'List of active membership plans' })
  async findAllMemberships() {
    return await this.membershipsService.findAllMemberships();
  }

  @Get('stats')
  @RequirePermissions(PERMISSIONS.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get membership statistics (System Admin only)' })
  @ApiResponse({ status: 200, description: 'Membership statistics' })
  async getMembershipStats() {
    return await this.membershipsService.getMembershipStats();
  }

  @Get('expired')
  @RequirePermissions(PERMISSIONS.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Get expired tenant memberships (System Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of expired tenant memberships',
  })
  async getExpiredMemberships() {
    return await this.membershipsService.getExpiredMemberships();
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.SYSTEM_ADMIN, PERMISSIONS.TENANT_SETTINGS)
  @ApiOperation({ summary: 'Get membership plan by ID' })
  @ApiResponse({ status: 200, description: 'Membership plan found' })
  @ApiResponse({ status: 404, description: 'Membership not found' })
  async findMembership(@Param('id', ParseUUIDPipe) id: string) {
    return await this.membershipsService.findMembership(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Update membership plan (System Admin only)' })
  @ApiResponse({ status: 200, description: 'Membership updated successfully' })
  @ApiResponse({ status: 404, description: 'Membership not found' })
  async updateMembership(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMembershipDto: UpdateMembershipDto,
  ) {
    return await this.membershipsService.updateMembership(
      id,
      updateMembershipDto,
    );
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Delete membership plan (System Admin only)' })
  @ApiResponse({ status: 200, description: 'Membership deleted successfully' })
  @ApiResponse({ status: 404, description: 'Membership not found' })
  async removeMembership(@Param('id', ParseUUIDPipe) id: string) {
    await this.membershipsService.removeMembership(id);
    return { message: 'Membership deleted successfully' };
  }

  // Tenant Memberships management
  @Post('tenant')
  @RequirePermissions(PERMISSIONS.SYSTEM_ADMIN, PERMISSIONS.TENANT_SETTINGS)
  @ApiOperation({ summary: 'Assign membership to tenant' })
  @ApiResponse({
    status: 201,
    description: 'Tenant membership created successfully',
  })
  async createTenantMembership(
    @Body() createTenantMembershipDto: CreateTenantMembershipDto,
  ) {
    return await this.membershipsService.createTenantMembership(
      createTenantMembershipDto,
    );
  }

  @Get('tenant/:tenantId')
  @RequireTenant()
  @RequirePermissions(PERMISSIONS.TENANT_SETTINGS)
  @ApiOperation({ summary: 'Get tenant membership history' })
  @ApiResponse({ status: 200, description: 'Tenant membership history' })
  async findTenantMemberships(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
  ) {
    return await this.membershipsService.findTenantMemberships(tenantId);
  }

  @Get('tenant/:tenantId/active')
  @RequireTenant()
  @RequirePermissions(PERMISSIONS.TENANT_SETTINGS)
  @ApiOperation({ summary: 'Get active tenant membership' })
  @ApiResponse({ status: 200, description: 'Active tenant membership' })
  async findActiveTenantMembership(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
  ) {
    return await this.membershipsService.findActiveTenantMembership(tenantId);
  }

  // Payments management
  @Post('payment')
  @RequirePermissions(PERMISSIONS.SYSTEM_ADMIN, PERMISSIONS.TENANT_SETTINGS)
  @ApiOperation({ summary: 'Record a payment' })
  @ApiResponse({ status: 201, description: 'Payment recorded successfully' })
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return await this.membershipsService.createPayment(createPaymentDto);
  }

  @Get('tenant-membership/:tenantMembershipId/payments')
  @RequireTenant()
  @RequirePermissions(PERMISSIONS.TENANT_SETTINGS)
  @ApiOperation({ summary: 'Get payments for a tenant membership' })
  @ApiResponse({ status: 200, description: 'Payment history' })
  async findPayments(
    @Param('tenantMembershipId', ParseUUIDPipe) tenantMembershipId: string,
  ) {
    return await this.membershipsService.findPayments(tenantMembershipId);
  }
}
