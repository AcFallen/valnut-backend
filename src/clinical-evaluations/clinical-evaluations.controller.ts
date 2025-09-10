import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClinicalEvaluationsService } from './clinical-evaluations.service';
import { CreateClinicalEvaluationDto } from './dto/create-clinical-evaluation.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/core/guards/permissions.guard';
import { TenantGuard } from 'src/core/guards/tenant.guard';
import { RequirePermissions } from 'src/core/decorators/require-permissions.decorator';
import { RequireTenant } from 'src/core/decorators/require-tenant.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions.constant';

@ApiTags('Clinical Evaluations')
@ApiBearerAuth()
@Controller('clinical-evaluations')
@UseGuards(JwtAuthGuard, PermissionsGuard, TenantGuard)
@RequireTenant()
export class ClinicalEvaluationsController {
  constructor(private readonly clinicalEvaluationsService: ClinicalEvaluationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PERMISSIONS.CLINICAL_EVALUATION_CREATE)
  @ApiOperation({ 
    summary: 'Crear nueva evaluación clínica',
    description: 'Crea una nueva evaluación clínica nutricional para un paciente'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Evaluación clínica creada exitosamente' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Permisos insuficientes' 
  })
  async create(
    @Body() createClinicalEvaluationDto: CreateClinicalEvaluationDto,
  ) {
    return await this.clinicalEvaluationsService.create(
      createClinicalEvaluationDto,
    );
  }
}