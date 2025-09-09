import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  UseGuards,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { QueryAppointmentsDto } from './dto/query-appointments.dto';
import { PaginatedAppointmentsDto } from './dto/paginated-appointments.dto';
import { QueryCalendarDto } from './dto/query-calendar.dto';
import { CalendarResponseDto } from './dto/calendar-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../core/guards/permissions.guard';
import { RequirePermissions } from '../core/decorators/require-permissions.decorator';
import { PERMISSIONS } from '../common/constants/permissions.constant';
import { RequireTenant } from 'src/core/decorators/require-tenant.decorator';
import { TenantGuard } from 'src/core/guards/tenant.guard';

@ApiTags('appointments')
@ApiBearerAuth()
@Controller('appointments')
@UseGuards(JwtAuthGuard, PermissionsGuard, TenantGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @RequireTenant()
  @RequirePermissions(PERMISSIONS.APPOINTMENT_CREATE)
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({
    status: 201,
    description: 'Appointment created successfully',
    type: Appointment,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Appointment slot conflict' })
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.APPOINTMENT_READ)
  @ApiOperation({
    summary:
      'Get all appointments for the current tenant with filters and pagination',
    description:
      'Retrieve appointments with optional filters for date, patient, nutritionist, status, and search. Supports pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointments retrieved successfully',
    type: PaginatedAppointmentsDto,
  })
  async findAll(
    @Query() query: QueryAppointmentsDto,
  ): Promise<PaginatedAppointmentsDto> {
    return this.appointmentsService.findByTenant(query);
  }

  @Get('calendar')
  // @RequirePermissions(PERMISSIONS.APPOINTMENT_READ)
  @ApiOperation({
    summary: 'Get appointments for calendar view',
    description:
      'Retrieve appointments formatted for calendar display with optional filters for date range, nutritionist, and patient.',
  })
  @ApiResponse({
    status: 200,
    description: 'Calendar events retrieved successfully',
    type: CalendarResponseDto,
  })
  async findForCalendar(
    @Query() query: QueryCalendarDto,
  ): Promise<CalendarResponseDto> {
    const data = await this.appointmentsService.findForCalendar(query);

    return {
      success: true,
      data,
      code: 200,
      message: 'Calendar events retrieved successfully',
    };
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.APPOINTMENT_READ)
  @ApiOperation({ summary: 'Get an appointment by id' })
  @ApiResponse({
    status: 200,
    description: 'Appointment retrieved successfully',
    type: Appointment,
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async findOne(@Param('id') id: string): Promise<Appointment> {
    return this.appointmentsService.findById(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.APPOINTMENT_UPDATE)
  @ApiOperation({ summary: 'Update an appointment' })
  @ApiResponse({
    status: 200,
    description: 'Appointment updated successfully',
    type: Appointment,
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @ApiResponse({ status: 409, description: 'Appointment slot conflict' })
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Patch(':id/reschedule')
  @RequirePermissions(PERMISSIONS.APPOINTMENT_UPDATE)
  @ApiOperation({ 
    summary: 'Reschedule an appointment',
    description: 'Move an appointment to a new date and time. The status will be automatically updated to RESCHEDULED.'
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment rescheduled successfully',
    type: Appointment,
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @ApiResponse({ status: 409, description: 'Appointment slot conflict at new date/time' })
  async reschedule(
    @Param('id') id: string,
    @Body() rescheduleDto: RescheduleAppointmentDto,
  ): Promise<Appointment> {
    return this.appointmentsService.reschedule(id, rescheduleDto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.APPOINTMENT_DELETE)
  @ApiOperation({ summary: 'Soft delete an appointment' })
  @ApiResponse({
    status: 200,
    description: 'Appointment deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.appointmentsService.softDelete(id);
  }
}
