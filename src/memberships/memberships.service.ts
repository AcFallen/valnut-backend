import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership } from './entities/membership.entity';
import { TenantMembership } from './entities/tenant-membership.entity';
import { PaymentHistory } from './entities/payment-history.entity';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { CreateTenantMembershipDto } from './dto/create-tenant-membership.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MembershipStatus } from '../common/enums';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private membershipRepository: Repository<Membership>,
    @InjectRepository(TenantMembership)
    private tenantMembershipRepository: Repository<TenantMembership>,
    @InjectRepository(PaymentHistory)
    private paymentHistoryRepository: Repository<PaymentHistory>,
  ) {}

  // Memberships CRUD
  async createMembership(
    createMembershipDto: CreateMembershipDto,
  ): Promise<Membership> {
    const membership = this.membershipRepository.create(createMembershipDto);
    return await this.membershipRepository.save(membership);
  }

  async findAllMemberships(): Promise<Membership[]> {
    return await this.membershipRepository.find({
      where: { isActive: true },
      order: { price: 'ASC' },
    });
  }

  async findMembership(id: string): Promise<Membership> {
    const membership = await this.membershipRepository.findOne({
      where: { id },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    return membership;
  }

  async updateMembership(
    id: string,
    updateMembershipDto: UpdateMembershipDto,
  ): Promise<Membership> {
    const membership = await this.findMembership(id);
    Object.assign(membership, updateMembershipDto);
    return await this.membershipRepository.save(membership);
  }

  async removeMembership(id: string): Promise<void> {
    await this.findMembership(id);
    await this.membershipRepository.softDelete(id);
  }

  // Tenant Memberships CRUD
  async createTenantMembership(
    createTenantMembershipDto: CreateTenantMembershipDto,
  ): Promise<TenantMembership> {
    const tenantMembership = this.tenantMembershipRepository.create(
      createTenantMembershipDto,
    );
    return await this.tenantMembershipRepository.save(tenantMembership);
  }

  async findTenantMemberships(tenantId: string): Promise<TenantMembership[]> {
    return await this.tenantMembershipRepository.find({
      where: { tenantId },
      relations: ['membership'],
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveTenantMembership(
    tenantId: string,
  ): Promise<TenantMembership | null> {
    return await this.tenantMembershipRepository.findOne({
      where: {
        tenantId,
        status: MembershipStatus.ACTIVE,
      },
      relations: ['membership'],
    });
  }

  async findTenantMembership(id: string): Promise<TenantMembership> {
    const tenantMembership = await this.tenantMembershipRepository.findOne({
      where: { id },
      relations: ['tenant', 'membership'],
    });

    if (!tenantMembership) {
      throw new NotFoundException('Tenant membership not found');
    }

    return tenantMembership;
  }

  // Payment History CRUD
  async createPayment(
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentHistory> {
    const payment = this.paymentHistoryRepository.create(createPaymentDto);
    return await this.paymentHistoryRepository.save(payment);
  }

  async findPayments(tenantMembershipId: string): Promise<PaymentHistory[]> {
    return await this.paymentHistoryRepository.find({
      where: { tenantMembershipId },
      order: { paymentDate: 'DESC' },
    });
  }

  async findPayment(id: string): Promise<PaymentHistory> {
    const payment = await this.paymentHistoryRepository.findOne({
      where: { id },
      relations: ['tenantMembership'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  // Business logic methods
  async getExpiredMemberships(): Promise<TenantMembership[]> {
    const now = new Date();
    return await this.tenantMembershipRepository
      .createQueryBuilder('tm')
      .leftJoinAndSelect('tm.tenant', 'tenant')
      .leftJoinAndSelect('tm.membership', 'membership')
      .where('tm.endDate < :now', { now })
      .andWhere('tm.status = :status', { status: 'active' })
      .getMany();
  }

  async getMembershipStats(): Promise<any> {
    const totalMemberships = await this.membershipRepository.count({
      where: { isActive: true },
    });
    const activeTenantMemberships = await this.tenantMembershipRepository.count(
      {
        where: { status: MembershipStatus.ACTIVE },
      },
    );

    const revenueResult = await this.paymentHistoryRepository
      .createQueryBuilder('ph')
      .select('SUM(ph.amount)', 'totalRevenue')
      .where('ph.status = :status', { status: 'paid' })
      .getRawOne();

    return {
      totalMemberships,
      activeTenantMemberships,
      totalRevenue: parseFloat(revenueResult.totalRevenue) || 0,
    };
  }
}
