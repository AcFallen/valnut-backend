import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsPositive, IsString, IsDateString, Min, Max } from 'class-validator';
import { FormType } from 'src/common/enums';

export class CreateClinicalEvaluationDto {
  @ApiProperty({ description: 'ID del paciente' })
  @IsNotEmpty()
  @IsString()
  patientId: string;

  @ApiProperty({ 
    description: 'Tipo de formulario de evaluación',
    enum: FormType,
    example: FormType.ADULT 
  })
  @IsEnum(FormType)
  formType: FormType;

  @ApiProperty({ 
    description: 'Edad del paciente en meses al momento de la evaluación',
    example: 240 
  })
  @IsNumber()
  @Min(0)
  @Max(1500) // máximo ~125 años
  patientAgeMonths: number;

  @ApiProperty({ 
    description: 'Peso del paciente en kilogramos',
    example: 70.5 
  })
  @IsNumber()
  @IsPositive()
  weightKg: number;

  @ApiProperty({ 
    description: 'Altura del paciente en centímetros',
    example: 175.0 
  })
  @IsNumber()
  @IsPositive()
  heightCm: number;

  @ApiProperty({ 
    description: 'Todas las respuestas del formulario en formato JSON',
    example: { 
      personalHistory: { chronicDiseases: ['diabetes'] },
      familyHistory: { hypertension: true },
      dietaryHabits: { mealsPerDay: 3 }
    }
  })
  @IsObject()
  responsesJson: Record<string, any>;

  @ApiProperty({ 
    description: 'Fecha de la evaluación (opcional, por defecto hoy)',
    example: '2024-03-15',
    required: false 
  })
  @IsOptional()
  @IsDateString()
  evaluationDate?: string;

  @ApiProperty({ 
    description: 'Fecha sugerida para próxima cita (opcional)',
    example: '2024-04-15',
    required: false 
  })
  @IsOptional()
  @IsDateString()
  nextAppointmentDate?: string;

  @ApiProperty({ 
    description: 'Observaciones generales del nutricionista',
    required: false 
  })
  @IsOptional()
  @IsString()
  generalObservations?: string;

  @ApiProperty({ 
    description: 'Recomendaciones nutricionales',
    required: false 
  })
  @IsOptional()
  @IsString()
  recommendations?: string;
}
