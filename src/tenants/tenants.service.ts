import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateTenantOwnerDto } from './dto/create-tenant-owner.dto';
import { TenantStatus, UserType, MembershipStatus, PaymentStatus } from '../common/enums';
import { UsersService } from '../users/users.service';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from '../roles/entities/user-role.entity';
import { RolesService } from '../roles/roles.service';
import { TenantContextService } from '../core/services/tenant-context.service';
import { AssignMembershipDto } from './dto/assign-membership.dto';
import { Membership } from '../memberships/entities/membership.entity';
import { TenantMembership } from '../memberships/entities/tenant-membership.entity';
import { PaymentHistory } from '../memberships/entities/payment-history.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Membership)
    private membershipRepository: Repository<Membership>,
    @InjectRepository(TenantMembership)
    private tenantMembershipRepository: Repository<TenantMembership>,
    @InjectRepository(PaymentHistory)
    private paymentHistoryRepository: Repository<PaymentHistory>,
    private usersService: UsersService,
    private tenantContextService: TenantContextService,
    private dataSource: DataSource,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Verificar que no exista un tenant con el mismo email
    const existingTenant = await this.tenantRepository.findOne({
      where: { email: createTenantDto.email },
    });

    if (existingTenant) {
      throw new ConflictException('A tenant with this email already exists');
    }

    const tenant = this.tenantRepository.create({
      ...createTenantDto,
      status: TenantStatus.ACTIVE,
    });

    return await this.tenantRepository.save(tenant);
  }

  async findAll(): Promise<Tenant[]> {
    return await this.tenantRepository
      .createQueryBuilder('tenant')
      .leftJoinAndSelect('tenant.users', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .orderBy('tenant.createdAt', 'DESC')
      .addOrderBy('user.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);

    // Si se está actualizando el email, verificar que no exista otro tenant con el mismo
    if (updateTenantDto.email && updateTenantDto.email !== tenant.email) {
      const existingTenant = await this.tenantRepository.findOne({
        where: { email: updateTenantDto.email },
      });

      if (existingTenant) {
        throw new ConflictException('A tenant with this email already exists');
      }
    }

    Object.assign(tenant, updateTenantDto);
    return await this.tenantRepository.save(tenant);
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    await this.tenantRepository.softDelete(id);
  }

  async findByStatus(status: TenantStatus): Promise<Tenant[]> {
    return await this.tenantRepository
      .createQueryBuilder('tenant')
      .leftJoinAndSelect('tenant.users', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .where('tenant.status = :status', { status })
      .orderBy('tenant.createdAt', 'DESC')
      .addOrderBy('user.createdAt', 'DESC')
      .getMany();
  }

  async findAllWithFilters(status?: TenantStatus, search?: string): Promise<Tenant[]> {
    const queryBuilder = this.tenantRepository
      .createQueryBuilder('tenant')
      .leftJoinAndSelect('tenant.users', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role');

    if (status) {
      queryBuilder.where('tenant.status = :status', { status });
    }

    if (search) {
      const whereClause = status ? 'andWhere' : 'where';
      queryBuilder[whereClause]('LOWER(tenant.name) LIKE LOWER(:name)', { 
        name: `%${search}%` 
      });
    }
    
    return await queryBuilder
      .orderBy('tenant.createdAt', 'DESC')
      .addOrderBy('user.createdAt', 'DESC')
      .getMany();
  }

  async updateStatus(id: string, status: TenantStatus): Promise<Tenant> {
    const tenant = await this.findOne(id);
    tenant.status = status;
    return await this.tenantRepository.save(tenant);
  }

  async findExpiredTenants(): Promise<Tenant[]> {
    const now = new Date();
    return await this.tenantRepository
      .createQueryBuilder('tenant')
      .where('tenant.expirationDate IS NOT NULL')
      .andWhere('tenant.expirationDate < :now', { now })
      .andWhere('tenant.status = :status', { status: TenantStatus.ACTIVE })
      .getMany();
  }

  async createTenantOwner(
    tenantId: string,
    createOwnerDto: CreateTenantOwnerDto,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      // Verificar que el tenant existe
      const tenant = await manager.findOne(Tenant, { where: { id: tenantId } });
      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }

      const username = createOwnerDto.email;
      const password = '12345678';

      const createUserDto = {
        firstName: createOwnerDto.firstName,
        lastName: createOwnerDto.lastName,
        email: createOwnerDto.email,
        username,
        password,
        userType: UserType.TENANT_OWNER,
        tenantId,
      };

      // Crear el usuario usando el servicio (que maneja sus propias validaciones)
      const owner = await this.usersService.create(createUserDto);

      // Buscar el rol de Nutricionista (tenant admin)
      let nutricionistaRole = await manager.findOne(Role, {
        where: {
          name: 'Nutricionista',
          isTenantAdmin: true,
        },
      });

      if (nutricionistaRole) {
        // Asignar el rol de Nutricionista al owner

        const userRole = manager.create(UserRole, {
          userId: owner.id,
          roleId: nutricionistaRole.id,
        });
        await manager.save(UserRole, userRole);
      } else {
        throw new ConflictException('Failed to assign owner role');
      }

      return owner;
    });
  }

  async assignMembership(
    tenantId: string,
    assignMembershipDto: AssignMembershipDto,
  ): Promise<TenantMembership> {
    return await this.dataSource.transaction(async (manager) => {
      // Verificar que el tenant existe
      const tenant = await manager.findOne(Tenant, { where: { id: tenantId } });
      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }

      // Verificar que el plan de membresía existe
      const membership = await manager.findOne(Membership, {
        where: { id: assignMembershipDto.membershipId, isActive: true },
      });
      if (!membership) {
        throw new NotFoundException('Membership plan not found or inactive');
      }

      // Verificar que las fechas sean válidas
      const startDate = new Date(assignMembershipDto.startDate);
      const endDate = new Date(assignMembershipDto.endDate);
      
      if (startDate >= endDate) {
        throw new ConflictException('End date must be after start date');
      }

      // Verificar si ya existe una membresía activa para este tenant
      const existingMembership = await manager.findOne(TenantMembership, {
        where: {
          tenantId,
          status: MembershipStatus.ACTIVE,
        },
      });

      if (existingMembership) {
        // Cancelar la membresía existente
        existingMembership.status = MembershipStatus.CANCELLED;
        await manager.save(TenantMembership, existingMembership);
      }

      // Crear la nueva membresía
      const tenantMembership = manager.create(TenantMembership, {
        tenantId,
        membershipId: assignMembershipDto.membershipId,
        startDate,
        endDate,
        status: MembershipStatus.ACTIVE,
        amountPaid: assignMembershipDto.amountPaid,
      });

      const savedMembership = await manager.save(TenantMembership, tenantMembership);

      // Crear el registro de pago
      const paymentHistory = manager.create(PaymentHistory, {
        tenantMembershipId: savedMembership.id,
        amount: assignMembershipDto.amountPaid,
        paymentDate: assignMembershipDto.paymentDate 
          ? new Date(assignMembershipDto.paymentDate)
          : new Date(),
        paymentMethod: assignMembershipDto.paymentMethod,
        status: assignMembershipDto.paymentStatus,
        transactionReference: assignMembershipDto.transactionReference,
        notes: assignMembershipDto.notes,
      });

      await manager.save(PaymentHistory, paymentHistory);

      // Actualizar la fecha de expiración del tenant si la nueva membresía va más allá
      if (!tenant.expirationDate || endDate > tenant.expirationDate) {
        tenant.expirationDate = endDate;
        await manager.save(Tenant, tenant);
      }

      // Retornar la membresía con sus relaciones
      const result = await manager.findOne(TenantMembership, {
        where: { id: savedMembership.id },
        relations: ['membership', 'tenant', 'paymentHistory'],
      });

      if (!result) {
        throw new ConflictException('Failed to retrieve created membership');
      }

      return result;
    });
  }

  async findByTenantContext(): Promise<Tenant & { currentMembership?: any }> {
    const tenantId = this.tenantContextService.getTenantId();
    
    if (!tenantId) {
      throw new NotFoundException('Tenant context required');
    }

    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
      relations: ['tenantMemberships', 'tenantMemberships.membership'],
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Find the active membership
    const activeMembership = tenant.tenantMemberships?.find(
      tm => tm.status === MembershipStatus.ACTIVE
    );

    // Return tenant with currentMembership property
    return {
      ...tenant,
      currentMembership: activeMembership || null
    };
  }
}
