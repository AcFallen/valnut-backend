import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { TenantContextService } from '../services/tenant-context.service';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    tenantId?: string;
    userType: string;
  };
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tenantContextService: TenantContextService,
  ) {}

  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const token = this.extractTokenFromHeader(req);
      
      if (token) {
        try {
          const payload = this.jwtService.verify(token);
          req.user = payload;
          
          // Si el usuario tiene tenantId, lo establecemos en el contexto
          if (payload.tenantId) {
            this.tenantContextService.setTenantId(payload.tenantId);
          }
        } catch (error) {
          // Si hay error en el token, continuamos sin usuario autenticado
          console.log('Token verification failed:', error.message);
        }
      }
      
      next();
    } catch (error) {
      // Si hay error, continuamos sin usuario autenticado
      next();
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}