import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { UserRole } from '../roles/entities/user-role.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateTenantUserDto } from './dto/create-tenant-user.dto';
import { TenantContextService } from '../core/services/tenant-context.service';
import { MembershipsService } from '../memberships/memberships.service';
import { UserType } from '../common/enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private tenantContextService: TenantContextService,
    private dataSource: DataSource,
    private membershipsService: MembershipsService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const tenantId =
      createUserDto.tenantId || this.tenantContextService.getTenantId();

    // Verificar username único globalmente
    const existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Verificar email único dentro del tenant (o globalmente para system admins)
    const emailCondition =
      createUserDto.userType === UserType.SYSTEM_ADMIN
        ? { email: createUserDto.email }
        : tenantId
          ? { email: createUserDto.email, user: { tenantId } }
          : { email: createUserDto.email };

    const existingProfile = await this.profileRepository.findOne({
      where: emailCondition,
      relations: ['user'],
    });

    if (existingProfile) {
      throw new ConflictException('Email already exists in this context');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    const user = this.userRepository.create({
      username: createUserDto.username,
      password: hashedPassword,
      userType: createUserDto.userType || UserType.TENANT_USER,
      tenantId: tenantId,
    });

    const savedUser = await this.userRepository.save(user);

    const profile = this.profileRepository.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email: createUserDto.email,
      user: savedUser,
    });

    await this.profileRepository.save(profile);

    return this.findById(savedUser.id);
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile', 'tenant'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['profile', 'tenant'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(
    id: string,
    updateData: Partial<CreateUserDto>,
  ): Promise<User> {
    const user = await this.findById(id);

    // Si se está actualizando el username, verificar que sea único
    if (updateData.username && updateData.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateData.username },
      });

      if (existingUser) {
        throw new ConflictException('Username already exists');
      }

      user.username = updateData.username;
    }

    // Si se está actualizando el password, hashearlo
    if (updateData.password) {
      user.password = await bcrypt.hash(updateData.password, 12);
    }

    // Actualizar otros campos del usuario
    if (updateData.userType) user.userType = updateData.userType;
    if (updateData.tenantId !== undefined) user.tenantId = updateData.tenantId;

    const savedUser = await this.userRepository.save(user);

    // Actualizar profile si hay datos
    if (updateData.firstName || updateData.lastName || updateData.email) {
      const profile = await this.profileRepository.findOne({
        where: { user: { id } },
      });

      if (profile) {
        if (updateData.firstName) profile.firstName = updateData.firstName;
        if (updateData.lastName) profile.lastName = updateData.lastName;

        // Verificar email único si se está actualizando
        if (updateData.email && updateData.email !== profile.email) {
          const tenantId = user.tenantId;
          const emailCondition =
            user.userType === UserType.SYSTEM_ADMIN
              ? { email: updateData.email }
              : tenantId
                ? { email: updateData.email, user: { tenantId } }
                : { email: updateData.email };

          const existingProfile = await this.profileRepository.findOne({
            where: emailCondition,
            relations: ['user'],
          });

          if (existingProfile && existingProfile.id !== profile.id) {
            throw new ConflictException('Email already exists in this context');
          }

          profile.email = updateData.email;
        }

        await this.profileRepository.save(profile);
      }
    }

    return this.findById(savedUser.id);
  }

  async deactivateUser(id: string): Promise<User> {
    const user = await this.findById(id);
    user.isActive = false;
    return await this.userRepository.save(user);
  }

  async activateUser(id: string): Promise<User> {
    const user = await this.findById(id);
    user.isActive = true;
    return await this.userRepository.save(user);
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async createTenantUser(
    createTenantUserDto: CreateTenantUserDto,
  ): Promise<User> {
    const tenantId = this.tenantContextService.getTenantId();

    if (!tenantId) {
      throw new ConflictException('Tenant context required');
    }

    // Validar membresía activa del tenant
    const activeMembership =
      await this.membershipsService.findActiveTenantMembership(tenantId);

    if (!activeMembership) {
      throw new BadRequestException(
        'No se encontró ninguna membresía activa para este usuario. Suscríbase a un plan de membresía para crear usuarios.',
      );
    }

    // Contar usuarios actuales del tenant (excluyendo tenant owner)
    const currentUserCount = await this.userRepository.count({
      where: {
        tenantId,
        userType: UserType.TENANT_USER,
      },
    });

    // Verificar si se excede el límite de usuarios
    if (currentUserCount >= activeMembership.membership.maxUsers) {
      throw new BadRequestException(
        `No se puede crear el usuario. Se alcanzó el límite máximo de usuarios (${activeMembership.membership.maxUsers}) para su plan ${activeMembership.membership.name}. Actualice su membresía para agregar más usuarios.`,
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      const username = createTenantUserDto.email;
      const defaultPassword = '12345678';

      // Verificar username único globalmente
      const existingUser = await manager.findOne(User, {
        where: { username },
      });

      if (existingUser) {
        throw new ConflictException('Username already exists');
      }

      // Verificar email único dentro del tenant
      const existingProfile = await manager.findOne(Profile, {
        where: {
          email: createTenantUserDto.email,
          user: { tenantId },
        },
        relations: ['user'],
      });

      if (existingProfile) {
        throw new ConflictException('Email already exists in this tenant');
      }

      // Verificar que el rol existe y pertenece al tenant
      const role = await manager.findOne(Role, {
        where: {
          id: createTenantUserDto.roleId,
        },
      });

      if (!role) {
        throw new NotFoundException(
          'Role not found or does not belong to this tenant',
        );
      }

      const hashedPassword = await bcrypt.hash(defaultPassword, 12);

      // Crear usuario
      const user = manager.create(User, {
        username,
        password: hashedPassword,
        userType: UserType.TENANT_USER,
        tenantId,
      });

      const savedUser = await manager.save(User, user);

      // Crear perfil
      const profile = manager.create(Profile, {
        firstName: createTenantUserDto.firstName,
        lastName: createTenantUserDto.lastName,
        email: createTenantUserDto.email,
        user: savedUser,
      });

      await manager.save(Profile, profile);

      // Crear relación usuario-rol
      const userRole = manager.create(UserRole, {
        userId: savedUser.id,
        roleId: createTenantUserDto.roleId,
      });

      await manager.save(UserRole, userRole);

      // Retornar usuario con relaciones
      const result = await manager.findOne(User, {
        where: { id: savedUser.id },
        relations: ['profile', 'tenant', 'userRoles', 'userRoles.role'],
      });

      if (!result) {
        throw new ConflictException('Failed to retrieve created user');
      }

      return result;
    });
  }

  async findByTenantWithRelations(): Promise<User[]> {
    const tenantId = this.tenantContextService.getTenantId();

    if (!tenantId) {
      throw new NotFoundException('Tenant context required');
    }

    return await this.userRepository.find({
      select: {
        id: true,
        username: true,
        userType: true,
        profile: { id: true, firstName: true, lastName: true, email: true },
        userRoles: {
          id: true,
          role: { id: true, name: true },
        },
      },
      where: { tenantId },
      relations: ['profile', 'userRoles', 'userRoles.role'],
      order: { createdAt: 'DESC' },
    });
  }

  async softDeleteUser(id: string): Promise<void> {
    const user = await this.findById(id);
    
    const tenantId = this.tenantContextService.getTenantId();
    
    // Verificar que el usuario pertenece al tenant actual (excepto system admin)
    if (tenantId && user.tenantId !== tenantId) {
      throw new NotFoundException('User not found');
    }
    
    // No permitir borrar tenant owners
    if (user.userType === UserType.TENANT_OWNER) {
      throw new BadRequestException('Cannot delete tenant owner');
    }
    
    await this.userRepository.softDelete(id);
  }
}
