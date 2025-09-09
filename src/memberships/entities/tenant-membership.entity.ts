import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { MembershipStatus } from '../../common/enums';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Membership } from './membership.entity';
import { PaymentHistory } from './payment-history.entity';

@Entity('tenant_memberships')
export class TenantMembership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'membership_id' })
  membershipId: string;

  @Column({ name: 'start_date' })
  startDate: Date;

  @Column({ name: 'end_date' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: MembershipStatus,
    default: MembershipStatus.ACTIVE,
  })
  status: MembershipStatus;

  @Column({ name: 'amount_paid', type: 'decimal', precision: 10, scale: 2 })
  amountPaid: number;

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

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Membership, (membership) => membership.tenantMemberships)
  @JoinColumn({ name: 'membership_id' })
  membership: Membership;

  @OneToMany(
    () => PaymentHistory,
    (paymentHistory) => paymentHistory.tenantMembership,
  )
  paymentHistory: PaymentHistory[];
}
