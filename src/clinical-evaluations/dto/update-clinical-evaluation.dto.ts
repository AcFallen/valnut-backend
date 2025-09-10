import { PartialType } from '@nestjs/swagger';
import { CreateClinicalEvaluationDto } from './create-clinical-evaluation.dto';

export class UpdateClinicalEvaluationDto extends PartialType(CreateClinicalEvaluationDto) {}
