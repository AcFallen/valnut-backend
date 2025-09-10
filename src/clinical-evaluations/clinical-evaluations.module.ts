import { Module } from '@nestjs/common';
import { ClinicalEvaluationsService } from './clinical-evaluations.service';
import { ClinicalEvaluationsController } from './clinical-evaluations.controller';
import { ClinicalEvaluation } from './entities/clinical-evaluation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ClinicalEvaluation])],
  controllers: [ClinicalEvaluationsController],
  providers: [ClinicalEvaluationsService],
})
export class ClinicalEvaluationsModule {}
