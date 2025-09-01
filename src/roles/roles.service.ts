import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
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
    const tenantId = this.tenantContextService.getTenantId();
    
    // Verificar que no exista un rol con el mismo nombre en el tenant
    const existingRole = await this.roleRepository.findOne({
      where: { 
        name: createRoleDto.name,
        tenantId: tenantId || undefined,
      },
    });

    if (existingRole) {
      throw new ConflictException('A role with this name already exists in this tenant');
    }

    const role = this.roleRepository.create({
      ...createRoleDto,
      tenantId,
    });

    return await this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    const tenantId = this.tenantContextService.getTenantId();
    
    return await this.roleRepository.find({
      where: [
        { tenantId }, // Roles del tenant actual
        { tenantId: undefined }, // Roles del sistema
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findSystemRoles(): Promise<Role[]> {
    return await this.roleRepository.find({
      where: { tenantId: undefined },
      order: { createdAt: 'DESC' },
    });
  }

  async findTenantRoles(tenantId?: string): Promise<Role[]> {
    const targetTenantId = tenantId || this.tenantContextService.getTenantId();
    
    return await this.roleRepository.find({
      where: { tenantId: targetTenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Role> {
    const tenantId = this.tenantContextService.getTenantId();
    
    const role = await this.roleRepository.findOne({
      where: [
        { id, tenantId }, // Rol del tenant actual
        { id, tenantId: undefined }, // Rol del sistema
      ],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    const tenantId = this.tenantContextService.getTenantId();

    // No permitir modificar roles del sistema desde un tenant
    if (!role.tenantId && tenantId) {
      throw new ForbiddenException('Cannot modify system roles from tenant context');
    }

    // Si se está cambiando el nombre, verificar que no exista otro rol con el mismo
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { 
          name: updateRoleDto.name,
          tenantId: role.tenantId,
        },
      });

      if (existingRole) {
        throw new ConflictException('A role with this name already exists in this tenant');
      }
    }

    Object.assign(role, updateRoleDto);
    return await this.roleRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    const tenantId = this.tenantContextService.getTenantId();

    // No permitir eliminar roles del sistema desde un tenant
    if (!role.tenantId && tenantId) {
      throw new ForbiddenException('Cannot delete system roles from tenant context');
    }

    // Verificar si el rol está siendo usado
    const userRoleCount = await this.userRoleRepository.count({
      where: { roleId: id },
    });

    if (userRoleCount > 0) {
      throw new ConflictException('Cannot delete role that is assigned to users');
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

  async createDefaultRoles(tenantId: string): Promise<Role[]> {
    const roles: Role[] = [];

    for (const [key, roleData] of Object.entries(DEFAULT_ROLES)) {
      const role = this.roleRepository.create({
        tenantId,
        name: roleData.name,
        description: roleData.description,
        permissions: [...roleData.permissions],
        isTenantAdmin: roleData.isTenantAdmin,
        isSystemAdmin: false,
      });

      const savedRole = await this.roleRepository.save(role);
      roles.push(savedRole);
    }

    return roles;
  }

  async findRolesByPermission(permission: string): Promise<Role[]> {
    const tenantId = this.tenantContextService.getTenantId();
    
    return await this.roleRepository
      .createQueryBuilder('role')
      .where('role.permissions @> :permission', { permission: JSON.stringify([permission]) })
      .andWhere('(role.tenantId = :tenantId OR role.tenantId IS NULL)', { tenantId })
      .getMany();
  }
}