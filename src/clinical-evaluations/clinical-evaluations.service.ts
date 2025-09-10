import { Injectable } from '@nestjs/common';
import { CreateClinicalEvaluationDto } from './dto/create-clinical-evaluation.dto';
import { UpdateClinicalEvaluationDto } from './dto/update-clinical-evaluation.dto';

@Injectable()
export class ClinicalEvaluationsService {
  create(createClinicalEvaluationDto: CreateClinicalEvaluationDto) {
    return 'This action adds a new clinicalEvaluation';
  }

}
