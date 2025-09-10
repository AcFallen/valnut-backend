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

  @Get()
  findAll() {
    return this.clinicalEvaluationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clinicalEvaluationsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClinicalEvaluationDto: UpdateClinicalEvaluationDto) {
    return this.clinicalEvaluationsService.update(+id, updateClinicalEvaluationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clinicalEvaluationsService.remove(+id);
  }
}
