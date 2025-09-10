import { Injectable, Scope } from '@nestjs/common';

interface AuthenticatedUser {
  id: string;
  username: string;
  tenantId?: string;
  userType: string;
}

@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
  private tenantId?: string;
  private user?: AuthenticatedUser;

  setTenantId(tenantId: string): void {
    this.tenantId = tenantId;
  }

  getTenantId(): string | undefined {
    return this.tenantId;
  }

  hasTenant(): boolean {
    return !!this.tenantId;
  }

  clearTenant(): void {
    this.tenantId = undefined;
  }

  setUser(user: AuthenticatedUser): void {
    this.user = user;
  }

  getUser(): AuthenticatedUser | undefined {
    return this.user;
  }

  getUserId(): string | undefined {
    return this.user?.id;
  }
}
