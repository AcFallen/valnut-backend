import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClinicalEvaluationsService } from './clinical-evaluations.service';
import { CreateClinicalEvaluationDto } from './dto/create-clinical-evaluation.dto';
import { UpdateClinicalEvaluationDto } from './dto/update-clinical-evaluation.dto';

@Controller('clinical-evaluations')
export class ClinicalEvaluationsController {
  constructor(private readonly clinicalEvaluationsService: ClinicalEvaluationsService) {}

  @Post()
  create(@Body() createClinicalEvaluationDto: CreateClinicalEvaluationDto) {
    return this.clinicalEvaluationsService.create(createClinicalEvaluationDto);
  }

}
