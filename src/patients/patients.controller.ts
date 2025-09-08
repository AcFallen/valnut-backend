import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { Patient } from './entities/patient.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../core/guards/permissions.guard';
import { RequirePermissions } from '../core/decorators/require-permissions.decorator';
import { PERMISSIONS } from '../common/constants/permissions.constant';
import { RequireTenant } from 'src/core/decorators/require-tenant.decorator';
import { TenantGuard } from 'src/core/guards/tenant.guard';

@ApiTags('patients')
@ApiBearerAuth()
@Controller('patients')
@UseGuards(JwtAuthGuard, PermissionsGuard, TenantGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @RequireTenant()
  @RequirePermissions(PERMISSIONS.PATIENT_CREATE)
  @ApiOperation({ summary: 'Create a new patient' })
  @ApiResponse({
    status: 201,
    description: 'Patient created successfully',
    type: Patient,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async create(@Body() createPatientDto: Partial<Patient>): Promise<Patient> {
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.PATIENT_READ)
  @ApiOperation({ summary: 'Get all patients for the current tenant' })
  @ApiResponse({
    status: 200,
    description: 'Patients retrieved successfully',
    type: [Patient],
  })
  async findAll(): Promise<Patient[]> {
    return this.patientsService.findByTenant();
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.PATIENT_READ)
  @ApiOperation({ summary: 'Get a patient by id' })
  @ApiResponse({
    status: 200,
    description: 'Patient retrieved successfully',
    type: Patient,
  })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async findOne(@Param('id') id: string): Promise<Patient> {
    return this.patientsService.findById(id);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.PATIENT_DELETE)
  @ApiOperation({ summary: 'Soft delete a patient' })
  @ApiResponse({
    status: 200,
    description: 'Patient deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.patientsService.softDelete(id);
  }
}
