import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { TenantContextService } from '../core/services/tenant-context.service';
import { DEFAULT_ROLES } from '../common/constants';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    private tenantContextService: TenantContextService,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Verificar que no exista un rol con el mismo nombre
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException('A role with this name already exists');
    }

    const role = this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return await this.roleRepository.find({
      select: {
        id: true,
        name: true,
        description: true,
      },
      where: [{ isSystemAdmin: false }],
      order: { createdAt: 'DESC' },
    });
  }

  async findSystemRoles(): Promise<Role[]> {
    return await this.roleRepository.find({
      where: { isSystemAdmin: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findTenantRoles(): Promise<Role[]> {
    return await this.roleRepository.find({
      where: { isTenantAdmin: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    // Si se está cambiando el nombre, verificar que no exista otro rol con el mismo
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name },
      });

      if (existingRole) {
        throw new ConflictException('A role with this name already exists');
      }
    }

    Object.assign(role, updateRoleDto);
    return await this.roleRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);

    // Verificar si el rol está siendo usado
    const userRoleCount = await this.userRoleRepository.count({
      where: { roleId: id },
    });

    if (userRoleCount > 0) {
      throw new ConflictException(
        'Cannot delete role that is assigned to users',
      );
    }

    await this.roleRepository.softDelete(id);
  }

  async assignRole(assignRoleDto: AssignRoleDto): Promise<UserRole> {
    const { userId, roleId } = assignRoleDto;

    // Verificar que el rol existe y es accesible
    await this.findOne(roleId);

    // Verificar que no existe ya esta asignación
    const existingUserRole = await this.userRoleRepository.findOne({
      where: { userId, roleId },
    });

    if (existingUserRole) {
      throw new ConflictException('User already has this role assigned');
    }

    const userRole = this.userRoleRepository.create({
      userId,
      roleId,
    });

    return await this.userRoleRepository.save(userRole);
  }

  async unassignRole(userId: string, roleId: string): Promise<void> {
    const userRole = await this.userRoleRepository.findOne({
      where: { userId, roleId },
    });

    if (!userRole) {
      throw new NotFoundException('Role assignment not found');
    }

    await this.userRoleRepository.remove(userRole);
  }

  async findUserRoles(userId: string): Promise<UserRole[]> {
    return await this.userRoleRepository.find({
      where: { userId },
      relations: ['role'],
      order: { assignedAt: 'DESC' },
    });
  }

  async createDefaultRoles(): Promise<Role[]> {
    const roles: Role[] = [];

    for (const [key, roleData] of Object.entries(DEFAULT_ROLES)) {
      // Check if role already exists
      let role = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!role) {
        role = this.roleRepository.create({
          name: roleData.name,
          description: roleData.description,
          permissions: [...roleData.permissions],
          isTenantAdmin: roleData.isTenantAdmin,
          isSystemAdmin: false,
        });

        await this.roleRepository.save(role);
      }

      roles.push(role);
    }

    return roles;
  }

  async findRolesByPermission(permission: string): Promise<Role[]> {
    return await this.roleRepository
      .createQueryBuilder('role')
      .where('role.permissions @> :permission', {
        permission: JSON.stringify([permission]),
      })
      .getMany();
  }
}
