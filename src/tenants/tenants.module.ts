import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { Tenant } from './entities/tenant.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from '../roles/entities/user-role.entity';
import { User } from '../users/entities/user.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { TenantMembership } from '../memberships/entities/tenant-membership.entity';
import { PaymentHistory } from '../memberships/entities/payment-history.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';
import { CoreModule } from '../core/core.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tenant,
      Role,
      UserRole,
      User,
      Membership,
      TenantMembership,
      PaymentHistory,
    ]),
    AuthModule,
    UsersModule,
    RolesModule,
    CoreModule,
  ],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
