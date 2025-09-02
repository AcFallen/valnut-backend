import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantResponseDto } from './dto/tenant-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantStatus } from '../common/enums';
import { plainToInstance } from 'class-transformer';
import { RequirePermissions } from 'src/core/decorators/require-permissions.decorator';
import { PERMISSIONS } from 'src/common/constants';

@ApiTags('tenants')
@Controller('tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiResponse({
    status: 201,
    description: 'Tenant created successfully',
    type: TenantResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Tenant with email already exists' })
  async create(@Body() createTenantDto: CreateTenantDto) {
    const tenant = await this.tenantsService.create(createTenantDto);
    return plainToInstance(TenantResponseDto, tenant);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get all tenants (System Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all tenants',
    type: [TenantResponseDto],
  })
  async findAll(@Query('status') status?: TenantStatus) {
    const tenants = status
      ? await this.tenantsService.findByStatus(status)
      : await this.tenantsService.findAll();

    return plainToInstance(TenantResponseDto, tenants);
  }

  @Get('expired')
  @ApiOperation({ summary: 'Get expired tenants' })
  @ApiResponse({
    status: 200,
    description: 'List of expired tenants',
    type: [TenantResponseDto],
  })
  async findExpired() {
    const tenants = await this.tenantsService.findExpiredTenants();
    return plainToInstance(TenantResponseDto, tenants);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  @ApiResponse({
    status: 200,
    description: 'Tenant found',
    type: TenantResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const tenant = await this.tenantsService.findOne(id);
    return plainToInstance(TenantResponseDto, tenant);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tenant' })
  @ApiResponse({
    status: 200,
    description: 'Tenant updated successfully',
    type: TenantResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 409, description: 'Tenant with email already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    const tenant = await this.tenantsService.update(id, updateTenantDto);
    return plainToInstance(TenantResponseDto, tenant);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete tenant' })
  @ApiResponse({ status: 200, description: 'Tenant deleted successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.tenantsService.remove(id);
    return { message: 'Tenant deleted successfully' };
  }

  @Patch(':id/status/:status')
  @ApiOperation({ summary: 'Update tenant status' })
  @ApiResponse({
    status: 200,
    description: 'Tenant status updated successfully',
    type: TenantResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('status') status: TenantStatus,
  ) {
    const tenant = await this.tenantsService.updateStatus(id, status);
    return plainToInstance(TenantResponseDto, tenant);
  }
}
