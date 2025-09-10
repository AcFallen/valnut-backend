import { Patient } from 'src/patients/entities/patient.entity';
import { FormType, NutritionalStatus } from 'src/common/enums';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';


@Entity('clinical_evaluations')
@Index(['tenantId', 'patientId', 'evaluationDate'])
@Index(['tenantId', 'formType', 'evaluationDate'])
@Index(['tenantId', 'nutritionalStatus'])
export class ClinicalEvaluation {
  @PrimaryGeneratedColumn()
  id: number;

  // Seguridad multitenant
  @Column({ name: 'tenant_id', type: 'string' })
  @Index()
  tenantId: string;

  // Referencias
  @Column({ name: 'patient_id', type: 'string' })
  @Index()
  patientId: string;

  @Column({ name: 'nutritionist_id', type: 'string' })
  nutritionistId: string;

  // Metadatos del formulario
  @Column({
    name: 'form_type',
    type: 'enum',
    enum: FormType,
  })
  formType: FormType;

  @Column({ name: 'patient_age_months', type: 'integer' })
  patientAgeMonths: number;

  // Datos antropométricos (duplicados del JSON para analytics rápidas)
  @Column({ name: 'weight_kg', type: 'decimal', precision: 5, scale: 2 })
  weightKg: number; // Peso en kilogramos (ej: 12.50)

  @Column({ name: 'height_cm', type: 'decimal', precision: 5, scale: 1 })
  heightCm: number; // Talla en centímetros (ej: 85.5)

  @Column({
    name: 'bmi',
    type: 'decimal',
    precision: 4,
    scale: 2,
    nullable: true,
  })
  bmi: number; // Índice de Masa Corporal calculado

  @Column({
    name: 'nutritional_status',
    type: 'enum',
    enum: NutritionalStatus,
  })
  nutritionalStatus: NutritionalStatus;

  // JSON con todas las respuestas del formulario
  @Column({ name: 'responses_json', type: 'jsonb' })
  responsesJson: Record<string, any>;

  // Datos calculados automáticamente (estructura flexible)
  @Column({ name: 'calculated_data', type: 'jsonb', nullable: true })
  calculatedData: Record<string, any>;

  // Control de fechas
  @Column({ name: 'evaluation_date', type: 'date' })
  @Index()
  evaluationDate: Date;

  @Column({ name: 'next_appointment_date', type: 'date', nullable: true })
  nextAppointmentDate: Date;

  // Estado y observaciones
  @Column({ type: 'varchar', length: 20, default: 'completed' })
  status: 'draft' | 'completed' | 'reviewed' | 'cancelled';

  @Column({ name: 'general_observations', type: 'text', nullable: true })
  generalObservations: string;

  @Column({ name: 'recommendations', type: 'text', nullable: true })
  recommendations: string;

  // Metadatos de auditoría
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relación con paciente
  @ManyToOne(() => Patient, (patient) => patient.evaluations)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  // Método helper para calcular BMI
  calculateBMI(): number | null {
    if (!this.weightKg || !this.heightCm) return null;
    const heightInMeters = this.heightCm / 100;
    return Number(
      (this.weightKg / (heightInMeters * heightInMeters)).toFixed(2),
    );
  }

  // Método helper para determinar estado nutricional
  getNutritionalStatus(): NutritionalStatus | null {
    if (!this.bmi) return null;

    // Para embarazadas usar criterios específicos
    if (this.formType === FormType.PREGNANT) {
      return this.calculatePregnancyStatus();
    }

    // Para adultos (>= 18 años)
    if (this.patientAgeMonths >= 216) {
      if (this.bmi < 18.5) return NutritionalStatus.UNDERWEIGHT;
      if (this.bmi < 25) return NutritionalStatus.NORMAL;
      if (this.bmi < 30) return NutritionalStatus.OVERWEIGHT;
      return NutritionalStatus.OBESE;
    }

    // Para niños/adolescentes usar percentiles (implementar según tablas OMS)
    return this.calculatePediatricStatus();
  }

  private calculatePediatricStatus(): NutritionalStatus {
    // Implementar lógica de percentiles según edad y sexo
    // Basado en tablas de la OMS/CDC
    return NutritionalStatus.NORMAL; // Placeholder
  }

  private calculatePregnancyStatus(): NutritionalStatus {
    // Implementar lógica específica para embarazadas
    // Basado en IMC pre-gestacional y semana de embarazo
    return NutritionalStatus.NORMAL; // Placeholder
  }
}
