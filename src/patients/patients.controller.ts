import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Delete,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { QueryPatientsDto } from './dto/query-patients.dto';
import { PaginatedPatientsDto } from './dto/paginated-patients.dto';
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
  async create(@Body() createPatientDto: CreatePatientDto): Promise<Patient> {
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.PATIENT_READ)
  @ApiOperation({
    summary:
      'Get all patients for the current tenant with filters and pagination',
    description:
      'Retrieve patients with optional filters for firstName, lastName, phone, and search. Supports pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Patients retrieved successfully',
    type: PaginatedPatientsDto,
  })
  async findAll(
    @Query() query: QueryPatientsDto,
  ): Promise<PaginatedPatientsDto> {
    return this.patientsService.findByTenant(query);
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

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.PATIENT_UPDATE)
  @ApiOperation({ summary: 'Update a patient' })
  @ApiResponse({
    status: 200,
    description: 'Patient updated successfully',
    type: Patient,
  })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ): Promise<Patient> {
    return this.patientsService.update(id, updatePatientDto);
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
