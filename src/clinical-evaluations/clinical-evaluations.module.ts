import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicalEvaluationsService } from './clinical-evaluations.service';
import { ClinicalEvaluationsController } from './clinical-evaluations.controller';
import { ClinicalEvaluation } from './entities/clinical-evaluation.entity';
import { CoreModule } from 'src/core/core.module';
import { Role } from 'src/roles/entities/role.entity';
import { UserRole } from 'src/roles/entities/user-role.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClinicalEvaluation, User, UserRole, Role]),
    CoreModule,
  ],
  controllers: [ClinicalEvaluationsController],
  providers: [ClinicalEvaluationsService],
})
export class ClinicalEvaluationsModule {}
