import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { TenantContextService } from '../core/services/tenant-context.service';
import { UserType } from '../common/enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    private tenantContextService: TenantContextService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const tenantId = createUserDto.tenantId || this.tenantContextService.getTenantId();

    // Verificar username único globalmente
    const existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Verificar email único dentro del tenant (o globalmente para system admins)
    const emailCondition = createUserDto.userType === UserType.SYSTEM_ADMIN 
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

  async findByTenant(tenantId?: string): Promise<User[]> {
    const targetTenantId = tenantId || this.tenantContextService.getTenantId();
    
    if (!targetTenantId) {
      throw new NotFoundException('Tenant context required');
    }

    return await this.userRepository.find({
      where: { tenantId: targetTenantId },
      relations: ['profile'],
      order: { createdAt: 'DESC' },
    });
  }

  async findSystemAdmins(): Promise<User[]> {
    return await this.userRepository.find({
      where: { userType: UserType.SYSTEM_ADMIN },
      relations: ['profile'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ['profile', 'tenant'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateUser(id: string, updateData: Partial<CreateUserDto>): Promise<User> {
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
          const emailCondition = user.userType === UserType.SYSTEM_ADMIN 
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

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
