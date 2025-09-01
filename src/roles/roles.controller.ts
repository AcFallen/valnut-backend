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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { RequirePermissions } from '../core/decorators/require-permissions.decorator';
import { RequireTenant } from '../core/decorators/require-tenant.decorator';
import { PermissionsGuard } from '../core/guards/permissions.guard';
import { TenantGuard } from '../core/guards/tenant.guard';
import { PERMISSIONS } from '../common/constants';

@ApiTags('roles')
@Controller('roles')
@ApiBearerAuth()
@UseGuards(TenantGuard) // PermissionsGuard temporalmente deshabilitado
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @RequireTenant()
  @RequirePermissions(PERMISSIONS.TENANT_USERS_MANAGE)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 409, description: 'Role with name already exists' })
  async create(@Body() createRoleDto: CreateRoleDto) {
    return await this.rolesService.create(createRoleDto);
  }

  @Get()
  @RequireTenant()
  @RequirePermissions(PERMISSIONS.USER_READ, PERMISSIONS.TENANT_USERS_MANAGE)
  @ApiOperation({ summary: 'Get all roles (tenant and system)' })
  @ApiResponse({ status: 200, description: 'List of roles' })
  async findAll() {
    return await this.rolesService.findAll();
  }

  @Get('system')
  @RequirePermissions(PERMISSIONS.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get all system roles (System Admin only)' })
  @ApiResponse({ status: 200, description: 'List of system roles' })
  async findSystemRoles() {
    return await this.rolesService.findSystemRoles();
  }

  @Get('tenant')
  @RequireTenant()
  @RequirePermissions(PERMISSIONS.TENANT_USERS_MANAGE)
  @ApiOperation({ summary: 'Get current tenant roles' })
  @ApiResponse({ status: 200, description: 'List of tenant roles' })
  async findTenantRoles() {
    return await this.rolesService.findTenantRoles();
  }

  @Get(':id')
  @RequireTenant()
  @RequirePermissions(PERMISSIONS.USER_READ, PERMISSIONS.TENANT_USERS_MANAGE)
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Role found' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.rolesService.findOne(id);
  }

  @Patch(':id')
  @RequireTenant()
  @RequirePermissions(PERMISSIONS.TENANT_USERS_MANAGE)
  @ApiOperation({ summary: 'Update role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 403, description: 'Cannot modify system roles' })
  @ApiResponse({ status: 409, description: 'Role with name already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return await this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @RequireTenant()
  @RequirePermissions(PERMISSIONS.TENANT_USERS_MANAGE)
  @ApiOperation({ summary: 'Delete role' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 403, description: 'Cannot delete system roles' })
  @ApiResponse({ status: 409, description: 'Cannot delete role assigned to users' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.rolesService.remove(id);
    return { message: 'Role deleted successfully' };
  }

  // User Role assignments
  @Post('assign')
  @RequireTenant()
  @RequirePermissions(PERMISSIONS.TENANT_USERS_MANAGE)
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiResponse({ status: 201, description: 'Role assigned successfully' })
  @ApiResponse({ status: 409, description: 'User already has this role' })
  async assignRole(@Body() assignRoleDto: AssignRoleDto) {
    return await this.rolesService.assignRole(assignRoleDto);
  }

  @Delete('unassign/:userId/:roleId')
  @RequireTenant()
  @RequirePermissions(PERMISSIONS.TENANT_USERS_MANAGE)
  @ApiOperation({ summary: 'Unassign role from user' })
  @ApiResponse({ status: 200, description: 'Role unassigned successfully' })
  @ApiResponse({ status: 404, description: 'Role assignment not found' })
  async unassignRole(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ) {
    await this.rolesService.unassignRole(userId, roleId);
    return { message: 'Role unassigned successfully' };
  }

  @Get('user/:userId')
  @RequireTenant()
  @RequirePermissions(PERMISSIONS.USER_READ, PERMISSIONS.TENANT_USERS_MANAGE)
  @ApiOperation({ summary: 'Get user roles' })
  @ApiResponse({ status: 200, description: 'List of user roles' })
  async findUserRoles(@Param('userId', ParseUUIDPipe) userId: string) {
    return await this.rolesService.findUserRoles(userId);
  }

  @Post('default/:tenantId')
  @RequirePermissions(PERMISSIONS.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Create default roles for tenant (System Admin only)' })
  @ApiResponse({ status: 201, description: 'Default roles created successfully' })
  async createDefaultRoles(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return await this.rolesService.createDefaultRoles(tenantId);
  }
}