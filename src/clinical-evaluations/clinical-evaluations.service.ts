import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClinicalEvaluationDto } from './dto/create-clinical-evaluation.dto';
import { UpdateClinicalEvaluationDto } from './dto/update-clinical-evaluation.dto';
import { ClinicalEvaluation } from './entities/clinical-evaluation.entity';
import { TenantContextService } from 'src/core/services/tenant-context.service';
import { NutritionalStatus } from 'src/common/enums';

@Injectable()
export class ClinicalEvaluationsService {
  constructor(
    @InjectRepository(ClinicalEvaluation)
    private readonly clinicalEvaluationRepository: Repository<ClinicalEvaluation>,
    private readonly tenantContextService: TenantContextService,
  ) {}

  async create(createClinicalEvaluationDto: CreateClinicalEvaluationDto) {
    const tenantId = this.tenantContextService.getTenantId();
    const nutritionistId = this.tenantContextService.getUserId();

    // Crear la evaluación clínica
    const clinicalEvaluation = this.clinicalEvaluationRepository.create({
      tenantId,
      nutritionistId,
      patientId: createClinicalEvaluationDto.patientId,
      formType: createClinicalEvaluationDto.formType,
      patientAgeMonths: createClinicalEvaluationDto.patientAgeMonths,
      weightKg: createClinicalEvaluationDto.weightKg,
      heightCm: createClinicalEvaluationDto.heightCm,
      responsesJson: createClinicalEvaluationDto.responsesJson,
      evaluationDate: createClinicalEvaluationDto.evaluationDate
        ? new Date(createClinicalEvaluationDto.evaluationDate)
        : new Date(),
      nextAppointmentDate: createClinicalEvaluationDto.nextAppointmentDate
        ? new Date(createClinicalEvaluationDto.nextAppointmentDate)
        : undefined,
      generalObservations: createClinicalEvaluationDto.generalObservations,
      recommendations: createClinicalEvaluationDto.recommendations,
      status: 'completed',
    });

    // Usar los métodos de la entidad para calcular BMI y estado nutricional
    clinicalEvaluation.bmi = clinicalEvaluation.calculateBMI();
    clinicalEvaluation.nutritionalStatus =
      clinicalEvaluation.getNutritionalStatus();

    return await this.clinicalEvaluationRepository.save(clinicalEvaluation);
  }
}
