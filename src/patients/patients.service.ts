import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Like, SelectQueryBuilder } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { QueryPatientsDto } from './dto/query-patients.dto';
import { PaginatedPatientsDto } from './dto/paginated-patients.dto';
import { PatientSelectDto } from './dto/patient-select.dto';
import { TenantContextService } from '../core/services/tenant-context.service';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    private tenantContextService: TenantContextService,
  ) {}

  private parseDateString(dateString: string): Date {
    // Parsear fecha en formato YYYY-MM-DD sin problemas de zona horaria
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month - 1 porque Date usa índice 0-11 para meses
  }

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const tenantId = this.tenantContextService.getTenantId();

    // Verificar email único dentro del tenant
    const existingPatient = await this.patientRepository.findOne({
      where: {
        email: createPatientDto.email,
        tenantId,
        deletedAt: IsNull(),
      },
    });

    if (existingPatient) {
      throw new ConflictException('Email already exists in this tenant');
    }

    // Verificar número de documento único dentro del tenant (si se proporciona)
    if (createPatientDto.documentNumber) {
      const existingDocumentPatient = await this.patientRepository.findOne({
        where: {
          documentNumber: createPatientDto.documentNumber,
          tenantId,
          deletedAt: IsNull(),
        },
      });

      if (existingDocumentPatient) {
        throw new ConflictException('Document number already exists in this tenant');
      }
    }

    // Convertir dateOfBirth string a Date si está presente
    const patientData = {
      ...createPatientDto,
      dateOfBirth: createPatientDto.dateOfBirth
        ? this.parseDateString(createPatientDto.dateOfBirth)
        : undefined,
      tenantId,
    };

    const patient = this.patientRepository.create(patientData);

    return await this.patientRepository.save(patient);
  }

  async findById(id: string): Promise<Patient> {
    const tenantId = this.tenantContextService.getTenantId();

    const patient = await this.patientRepository.findOne({
      where: { id, tenantId, deletedAt: IsNull() },
      relations: ['tenant'],
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }

  async findByTenant(query?: QueryPatientsDto): Promise<PaginatedPatientsDto> {
    const tenantId = this.tenantContextService.getTenantId();
    const {
      firstName,
      lastName,
      phone,
      search,
      page = 1,
      limit = 10,
    } = query || {};

    const queryBuilder: SelectQueryBuilder<Patient> = this.patientRepository
      .createQueryBuilder('patient')
      .select([
        'patient.id',
        'patient.firstName',
        'patient.lastName',
        'patient.email',
        'patient.phone',
        'patient.documentType',
        'patient.documentNumber',
        'patient.createdAt',
      ])
      .where('patient.tenantId = :tenantId', { tenantId })
      .andWhere('patient.deletedAt IS NULL');

    if (search) {
      queryBuilder.andWhere(
        '(patient.firstName ILIKE :search OR patient.lastName ILIKE :search OR patient.phone ILIKE :search OR patient.documentNumber ILIKE :search)',
        { search: `%${search}%` },
      );
    } else {
      if (firstName) {
        queryBuilder.andWhere('patient.firstName ILIKE :firstName', {
          firstName: `%${firstName}%`,
        });
      }

      if (lastName) {
        queryBuilder.andWhere('patient.lastName ILIKE :lastName', {
          lastName: `%${lastName}%`,
        });
      }

      if (phone) {
        queryBuilder.andWhere('patient.phone ILIKE :phone', {
          phone: `%${phone}%`,
        });
      }
    }

    queryBuilder.orderBy('patient.createdAt', 'DESC');

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
    updatePatientDto: UpdatePatientDto,
  ): Promise<Patient> {
    const patient = await this.findById(id);

    const patientData = {
      ...updatePatientDto,
      dateOfBirth: updatePatientDto.dateOfBirth
        ? this.parseDateString(updatePatientDto.dateOfBirth)
        : patient.dateOfBirth,
    };

    await this.patientRepository.update(patient.id, patientData);
    return this.findById(id);
  }

  async findForSelect(): Promise<PatientSelectDto[]> {
    const tenantId = this.tenantContextService.getTenantId();

    const patients = await this.patientRepository.find({
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
      where: { 
        tenantId,
        deletedAt: IsNull(),
      },
      order: { firstName: 'ASC' },
    });

    return patients.map(patient => ({
      id: patient.id,
      name: `${patient.firstName} ${patient.lastName}`,
    }));
  }

  async softDelete(id: string): Promise<void> {
    const patient = await this.findById(id);
    await this.patientRepository.softDelete(patient.id);
  }
}
