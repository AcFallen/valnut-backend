import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { TenantContextService } from '../core/services/tenant-context.service';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    private tenantContextService: TenantContextService,
  ) {}

  async create(createPatientData: Partial<Patient>): Promise<Patient> {
    const tenantId = this.tenantContextService.getTenantId();

    // Verificar email único dentro del tenant
    const existingPatient = await this.patientRepository.findOne({
      where: {
        email: createPatientData.email,
        tenantId,
        deletedAt: IsNull(),
      },
    });

    if (existingPatient) {
      throw new ConflictException('Email already exists in this tenant');
    }

    const patient = this.patientRepository.create({
      ...createPatientData,
      tenantId,
    });

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

  async findByTenant(): Promise<Patient[]> {
    const tenantId = this.tenantContextService.getTenantId();

    return await this.patientRepository.find({
      where: { tenantId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async softDelete(id: string): Promise<void> {
    const patient = await this.findById(id);
    await this.patientRepository.softDelete(patient.id);
  }
}