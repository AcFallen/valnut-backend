import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
  private tenantId?: string;

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
}
