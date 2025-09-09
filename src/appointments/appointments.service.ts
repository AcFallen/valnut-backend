import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, SelectQueryBuilder } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { QueryAppointmentsDto } from './dto/query-appointments.dto';
import { PaginatedAppointmentsDto } from './dto/paginated-appointments.dto';
import { QueryCalendarDto } from './dto/query-calendar.dto';
import { CalendarAppointmentDto } from './dto/calendar-appointment.dto';
import { TenantContextService } from '../core/services/tenant-context.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private tenantContextService: TenantContextService,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    const tenantId = this.tenantContextService.getTenantId();

    // Check for scheduling conflicts
    const conflictingAppointment = await this.appointmentRepository.findOne({
      where: {
        appointmentDate: createAppointmentDto.appointmentDate,
        appointmentTime: createAppointmentDto.appointmentTime,
        nutritionistId: createAppointmentDto.nutritionistId,
        tenantId,
        deletedAt: IsNull(),
      },
    });

    if (conflictingAppointment) {
      throw new ConflictException(
        'Appointment slot is already booked for this nutritionist',
      );
    }

    const appointmentData = {
      ...createAppointmentDto,
      tenantId,
    };

    const appointment = this.appointmentRepository.create(appointmentData);
    return await this.appointmentRepository.save(appointment);
  }

  async findById(id: string): Promise<Appointment> {
    const tenantId = this.tenantContextService.getTenantId();

    const appointment = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .select([
        'appointment.id',
        'appointment.appointmentDate',
        'appointment.appointmentTime',
        'appointment.consultationType',
        'appointment.status',
        'appointment.notes',
        'appointment.durationMinutes',
        'appointment.createdAt',
        'appointment.updatedAt',
      ])
      .leftJoin('appointment.patient', 'patient')
      .addSelect([
        'patient.id',
        'patient.firstName',
        'patient.lastName',
        'patient.email',
        'patient.phone',
        'patient.dateOfBirth',
        'patient.gender',
      ])
      .leftJoin('appointment.nutritionist', 'nutritionist')
      .leftJoin('nutritionist.profile', 'nutritionistProfile')
      .addSelect([
        'nutritionist.id',
        'nutritionistProfile.firstName',
        'nutritionistProfile.lastName',
      ])
      .where('appointment.id = :id', { id })
      .andWhere('appointment.tenantId = :tenantId', { tenantId })
      .andWhere('appointment.deletedAt IS NULL')
      .getOne();

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async findByTenant(
    query?: QueryAppointmentsDto,
  ): Promise<PaginatedAppointmentsDto> {
    const tenantId = this.tenantContextService.getTenantId();
    const {
      appointmentDate,
      startDate,
      endDate,
      consultationType,
      status,
      patientId,
      nutritionistId,
      search,
      page = 1,
      limit = 10,
    } = query || {};

    const queryBuilder: SelectQueryBuilder<Appointment> =
      this.appointmentRepository
        .createQueryBuilder('appointment')
        .select([
          'appointment.id',
          'appointment.appointmentDate',
          'appointment.appointmentTime',
          'appointment.consultationType',
          'appointment.status',
          'appointment.notes',
          'appointment.durationMinutes',
          'appointment.createdAt',
          'appointment.updatedAt',
        ])
        .leftJoin('appointment.patient', 'patient')
        .addSelect([
          'patient.id',
          'patient.firstName',
          'patient.lastName',
          'patient.email',
          'patient.phone',
        ])
        .leftJoin('appointment.nutritionist', 'nutritionist')
        .leftJoin('nutritionist.profile', 'nutritionistProfile')
        .addSelect([
          'nutritionist.id',
          'nutritionistProfile.firstName',
          'nutritionistProfile.lastName',
        ])
        .where('appointment.tenantId = :tenantId', { tenantId })
        .andWhere('appointment.deletedAt IS NULL');

    if (appointmentDate) {
      queryBuilder.andWhere('appointment.appointmentDate = :appointmentDate', {
        appointmentDate,
      });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'appointment.appointmentDate BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    }

    if (consultationType) {
      queryBuilder.andWhere(
        'appointment.consultationType = :consultationType',
        {
          consultationType,
        },
      );
    }

    if (status) {
      queryBuilder.andWhere('appointment.status = :status', { status });
    }

    if (patientId) {
      queryBuilder.andWhere('appointment.patientId = :patientId', {
        patientId,
      });
    }

    if (nutritionistId) {
      queryBuilder.andWhere('appointment.nutritionistId = :nutritionistId', {
        nutritionistId,
      });
    }

    if (search) {
      queryBuilder.andWhere('appointment.notes ILIKE :search', {
        search: `%${search}%`,
      });
    }

    queryBuilder
      .orderBy('appointment.appointmentDate', 'DESC')
      .addOrderBy('appointment.appointmentTime', 'ASC');

    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrev,
    };
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    const appointment = await this.findById(id);

    // Check for scheduling conflicts if date, time, or nutritionist changed
    if (
      updateAppointmentDto.appointmentDate ||
      updateAppointmentDto.appointmentTime ||
      updateAppointmentDto.nutritionistId
    ) {
      const conflictingAppointment = await this.appointmentRepository.findOne({
        where: {
          appointmentDate: updateAppointmentDto.appointmentDate ?? appointment.appointmentDate,
          appointmentTime:
            updateAppointmentDto.appointmentTime ?? appointment.appointmentTime,
          nutritionistId:
            updateAppointmentDto.nutritionistId ?? appointment.nutritionistId,
          tenantId: appointment.tenantId,
          deletedAt: IsNull(),
        },
      });

      if (conflictingAppointment && conflictingAppointment.id !== id) {
        throw new ConflictException(
          'Appointment slot is already booked for this nutritionist',
        );
      }
    }

    const appointmentData = {
      ...updateAppointmentDto,
    };

    await this.appointmentRepository.update(appointment.id, appointmentData);
    return this.findById(id);
  }

  async findForCalendar(query?: QueryCalendarDto): Promise<CalendarAppointmentDto[]> {
    const tenantId = this.tenantContextService.getTenantId();
    const { start, end, nutritionistId, patientId } = query || {};

    const queryBuilder: SelectQueryBuilder<Appointment> =
      this.appointmentRepository
        .createQueryBuilder('appointment')
        .select([
          'appointment.id',
          'appointment.appointmentDate',
          'appointment.appointmentTime',
          'appointment.durationMinutes',
          'appointment.consultationType',
          'appointment.status',
          'appointment.notes',
        ])
        .leftJoin('appointment.patient', 'patient')
        .addSelect([
          'patient.id',
          'patient.firstName',
          'patient.lastName',
          'patient.email',
        ])
        .leftJoin('appointment.nutritionist', 'nutritionist')
        .leftJoin('nutritionist.profile', 'nutritionistProfile')
        .addSelect([
          'nutritionist.id',
          'nutritionistProfile.firstName',
          'nutritionistProfile.lastName',
        ])
        .where('appointment.tenantId = :tenantId', { tenantId })
        .andWhere('appointment.deletedAt IS NULL');

    if (start && end) {
      queryBuilder.andWhere(
        'appointment.appointmentDate BETWEEN :start AND :end',
        { start, end },
      );
    }

    if (nutritionistId) {
      queryBuilder.andWhere('appointment.nutritionistId = :nutritionistId', {
        nutritionistId,
      });
    }

    if (patientId) {
      queryBuilder.andWhere('appointment.patientId = :patientId', {
        patientId,
      });
    }

    queryBuilder
      .orderBy('appointment.appointmentDate', 'ASC')
      .addOrderBy('appointment.appointmentTime', 'ASC');

    const appointments = await queryBuilder.getMany();

    return appointments.map((appointment) => ({
      id: appointment.id,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      durationMinutes: appointment.durationMinutes || 60,
      consultationType: appointment.consultationType,
      status: appointment.status,
      notes: appointment.notes || null,
      patient: {
        id: appointment.patient.id,
        firstName: appointment.patient.firstName,
        lastName: appointment.patient.lastName,
        email: appointment.patient.email,
      },
      nutritionist: appointment.nutritionist
        ? {
            id: appointment.nutritionist.id,
            profile: {
              firstName: appointment.nutritionist.profile?.firstName || '',
              lastName: appointment.nutritionist.profile?.lastName || '',
            },
          }
        : null,
    }));
  }

  async softDelete(id: string): Promise<void> {
    const appointment = await this.findById(id);
    await this.appointmentRepository.softDelete(appointment.id);
  }
}
