import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { TenantStatus } from '../../common/enums';
import { User } from '../../users/entities/user.entity';
import { TenantMembership } from '../../memberships/entities/tenant-membership.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { ClinicalEvaluation } from 'src/clinical-evaluations/entities/clinical-evaluation.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'phone', nullable: true, length: 20 })
  phone?: string;

  @Column({ name: 'address', nullable: true, type: 'text' })
  address?: string;

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.ACTIVE,
  })
  status: TenantStatus;

  @Column({ name: 'expiration_date', nullable: true })
  expirationDate?: Date;

  @Column({ name: 'settings', type: 'jsonb', nullable: true })
  settings?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @Column({ name: 'created_by', nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy?: string;

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @OneToMany(
    () => TenantMembership,
    (tenantMembership) => tenantMembership.tenant,
  )
  tenantMemberships: TenantMembership[];

  @OneToMany(() => Patient, (patient) => patient.tenant)
  patients: Patient[];

  @OneToMany(() => ClinicalEvaluation, (evaluation) => evaluation.tenant)
  clinicalEvaluations: ClinicalEvaluation[];
}
