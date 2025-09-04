import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateTenantOwnerDto } from './dto/create-tenant-owner.dto';
import { TenantStatus, UserType } from '../common/enums';
import { UsersService } from '../users/users.service';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from '../roles/entities/user-role.entity';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    private usersService: UsersService,
    private rolesService: RolesService,
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
    return await this.tenantRepository.find({
      order: { createdAt: 'DESC' },
    });
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
    return await this.tenantRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
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
    const tenant = await this.findOne(tenantId);

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

    const owner = await this.usersService.create(createUserDto);

    // Buscar el rol de Nutricionista (tenant admin)
    let nutricionistaRole = await this.roleRepository.findOne({
      where: {
        name: 'Nutricionista',
        isTenantAdmin: true,
      },
    });

    if (nutricionistaRole) {
      // Asignar el rol de Nutricionista al owner
      console.log('Asignando rol de Nutricionista al owner del tenant');
      const userRole = this.userRoleRepository.create({
        userId: owner.id,
        roleId: nutricionistaRole.id,
      });
      await this.userRoleRepository.save(userRole);
    } else {
      console.error(
        'No se pudo encontrar o crear el rol Nutricionista para el tenant:',
        tenantId,
      );
    }

    return owner;
  }
}
