import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantContextService } from '../services/tenant-context.service';
import { REQUIRE_PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { Permission, PERMISSIONS } from '../../common/constants';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../roles/entities/user-role.entity';
import { Role } from '../../roles/entities/role.entity';
import { UserType } from '../../common/enums';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tenantContextService: TenantContextService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      REQUIRE_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // System admins have all permissions
    if (user.userType === UserType.SYSTEM_ADMIN) {
      return true;
    }

    const tenantId = this.tenantContextService.getTenantId();

    // For tenant-specific operations, ensure user belongs to the tenant
    if (tenantId && user.tenantId !== tenantId) {
      throw new ForbiddenException('User does not belong to this tenant');
    }

    // Get user permissions
    const userPermissions = await this.getUserPermissions(user.id, tenantId);

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }

  private async getUserPermissions(
    userId: string,
    tenantId?: string,
  ): Promise<Permission[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: ['role'],
    });

    const permissions = new Set<Permission>();

    for (const userRole of userRoles) {
      const role = userRole.role;

      // Add system admin permission if role is system admin
      if (role.isSystemAdmin) {
        permissions.add(PERMISSIONS.SYSTEM_ADMIN);
      }

      // Add all role permissions
      role.permissions.forEach((permission) => permissions.add(permission));
    }

    return Array.from(permissions);
  }
}
