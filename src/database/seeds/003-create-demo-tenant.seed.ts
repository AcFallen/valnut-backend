import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';
import { Profile } from '../../users/entities/profile.entity';
import { Role } from '../../roles/entities/role.entity';
import { UserRole } from '../../roles/entities/user-role.entity';
import { Membership } from '../../memberships/entities/membership.entity';
import { TenantMembership } from '../../memberships/entities/tenant-membership.entity';
import { UserType, TenantStatus, MembershipStatus } from '../../common/enums';
import { DEFAULT_ROLES } from '../../common/constants';

export class CreateDemoTenantSeed {
  public async run(dataSource: DataSource): Promise<void> {
    const tenantRepository = dataSource.getRepository(Tenant);
    const userRepository = dataSource.getRepository(User);
    const profileRepository = dataSource.getRepository(Profile);
    const roleRepository = dataSource.getRepository(Role);
    const userRoleRepository = dataSource.getRepository(UserRole);
    const membershipRepository = dataSource.getRepository(Membership);
    const tenantMembershipRepository =
      dataSource.getRepository(TenantMembership);

    // Check if demo tenant already exists
    const existingTenant = await tenantRepository.findOne({
      where: { email: 'demo@consultorio.com' },
    });

    if (existingTenant) {
      console.log('Demo tenant already exists, skipping...');
      return;
    }

    // Create demo tenant
    const demoTenant = tenantRepository.create({
      name: 'Consultorio Nutricional Demo',
      email: 'demo@consultorio.com',
      phone: '+1234567890',
      address: '123 Main Street, Demo City, DC 12345',
      status: TenantStatus.ACTIVE,
      settings: {
        timezone: 'America/New_York',
        language: 'es',
        currency: 'USD',
      },
    });

    const savedTenant = await tenantRepository.save(demoTenant);

    // Get or create default roles (roles are now global)
    const tenantRoles: Role[] = [];

    for (const [key, roleData] of Object.entries(DEFAULT_ROLES)) {
      // Check if role already exists
      let role = await roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!role) {
        role = roleRepository.create({
          name: roleData.name,
          description: roleData.description,
          permissions: [...roleData.permissions],
          isTenantAdmin: roleData.isTenantAdmin,
          isSystemAdmin: false,
        });

        await roleRepository.save(role);
      }

      tenantRoles.push(role);
    }

    // Create tenant owner user
    const hashedPassword = await bcrypt.hash('demo123!', 12);

    const ownerUser = userRepository.create({
      username: 'demo_owner',
      password: hashedPassword,
      userType: UserType.TENANT_OWNER,
      tenantId: savedTenant.id,
      isActive: true,
    });

    const savedOwner = await userRepository.save(ownerUser);

    // Create profile for tenant owner
    const ownerProfile = profileRepository.create({
      firstName: 'Dr. María',
      lastName: 'González',
      email: 'maria.gonzalez@consultorio.com',
      phone: '+1234567891',
      user: savedOwner,
    });

    await profileRepository.save(ownerProfile);

    // Assign Nutricionista role to owner
    const nutricionistaRole = tenantRoles.find(
      (role) => role.name === 'Nutricionista',
    );
    if (nutricionistaRole) {
      const ownerRole = userRoleRepository.create({
        userId: savedOwner.id,
        roleId: nutricionistaRole.id,
      });
      await userRoleRepository.save(ownerRole);
    }

    // Create a regular user (receptionist)
    const receptionistUser = userRepository.create({
      username: 'demo_receptionist',
      password: hashedPassword,
      userType: UserType.TENANT_USER,
      tenantId: savedTenant.id,
      isActive: true,
    });

    const savedReceptionist = await userRepository.save(receptionistUser);

    // Create profile for receptionist
    const receptionistProfile = profileRepository.create({
      firstName: 'Ana',
      lastName: 'Martínez',
      email: 'ana.martinez@consultorio.com',
      phone: '+1234567892',
      user: savedReceptionist,
    });

    await profileRepository.save(receptionistProfile);

    // Assign Recepcionista role
    const recepcionistaRole = tenantRoles.find(
      (role) => role.name === 'Recepcionista',
    );
    if (recepcionistaRole) {
      const receptionistRole = userRoleRepository.create({
        userId: savedReceptionist.id,
        roleId: recepcionistaRole.id,
      });
      await userRoleRepository.save(receptionistRole);
    }

    // Assign membership to tenant (Plan Profesional)
    const professionalMembership = await membershipRepository.findOne({
      where: { name: 'Plan Profesional' },
    });

    if (professionalMembership) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month from now

      const tenantMembership = tenantMembershipRepository.create({
        tenantId: savedTenant.id,
        membershipId: professionalMembership.id,
        startDate,
        endDate,
        status: MembershipStatus.ACTIVE,
        amountPaid: professionalMembership.price,
      });

      await tenantMembershipRepository.save(tenantMembership);
    }

    console.log('✅ Demo tenant created successfully');
    console.log('Tenant: Consultorio Nutricional Demo');
    console.log('Owner Username: demo_owner');
    console.log('Receptionist Username: demo_receptionist');
    console.log('Password (both): demo123!');
  }
}
