import { Module } from '@nestjs/common';
import { ClinicalEvaluationsService } from './clinical-evaluations.service';
import { ClinicalEvaluationsController } from './clinical-evaluations.controller';

@Module({
  controllers: [ClinicalEvaluationsController],
  providers: [ClinicalEvaluationsService],
})
export class ClinicalEvaluationsModule {}
