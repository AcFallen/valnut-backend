import { Injectable } from '@nestjs/common';
import { CreateClinicalEvaluationDto } from './dto/create-clinical-evaluation.dto';
import { UpdateClinicalEvaluationDto } from './dto/update-clinical-evaluation.dto';

@Injectable()
export class ClinicalEvaluationsService {
  create(createClinicalEvaluationDto: CreateClinicalEvaluationDto) {
    return 'This action adds a new clinicalEvaluation';
  }

  findAll() {
    return `This action returns all clinicalEvaluations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} clinicalEvaluation`;
  }

  update(id: number, updateClinicalEvaluationDto: UpdateClinicalEvaluationDto) {
    return `This action updates a #${id} clinicalEvaluation`;
  }

  remove(id: number) {
    return `This action removes a #${id} clinicalEvaluation`;
  }
}
