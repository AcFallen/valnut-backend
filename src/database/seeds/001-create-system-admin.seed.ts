import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../users/entities/user.entity';
import { Profile } from '../../users/entities/profile.entity';
import { Role } from '../../roles/entities/role.entity';
import { UserRole } from '../../roles/entities/user-role.entity';
import { UserType } from '../../common/enums';
import { PERMISSIONS } from '../../common/constants';

export class CreateSystemAdminSeed {
  public async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);
    const profileRepository = dataSource.getRepository(Profile);
    const roleRepository = dataSource.getRepository(Role);
    const userRoleRepository = dataSource.getRepository(UserRole);

    // Check if system admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { userType: UserType.SYSTEM_ADMIN },
    });

    if (existingAdmin) {
      console.log('System admin already exists, skipping...');
      return;
    }

    // Create system admin role
    let systemAdminRole = await roleRepository.findOne({
      where: { 
        name: 'System Administrator', 
        tenantId: undefined as any,
      },
    });

    if (!systemAdminRole) {
      systemAdminRole = roleRepository.create({
        name: 'System Administrator',
        description: 'Full system administration privileges',
        permissions: [PERMISSIONS.SYSTEM_ADMIN],
        isSystemAdmin: true,
        isTenantAdmin: false,
        tenantId: undefined,
      });
      await roleRepository.save(systemAdminRole);
    }

    // Create system admin user
    const hashedPassword = await bcrypt.hash('admin123!', 12);
    
    const adminUser = userRepository.create({
      username: 'system_admin',
      password: hashedPassword,
      userType: UserType.SYSTEM_ADMIN,
      tenantId: undefined,
      isActive: true,
    });

    const savedUser = await userRepository.save(adminUser);

    // Create profile for system admin
    const adminProfile = profileRepository.create({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@valnut.com',
      user: savedUser,
    });

    await profileRepository.save(adminProfile);

    // Assign system admin role
    const userRole = userRoleRepository.create({
      userId: savedUser.id,
      roleId: systemAdminRole.id,
    });

    await userRoleRepository.save(userRole);

    console.log('✅ System administrator created successfully');
    console.log('Username: system_admin');
    console.log('Password: admin123!');
    console.log('Email: admin@valnut.com');
  }
}