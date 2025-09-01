# Valnut Backend - Sistema SaaS Multitenant

Sistema SaaS multitenant para gestión de consultorios nutricionales construido con NestJS, TypeORM y PostgreSQL.

## 🚀 Características Principales

### Arquitectura Multitenant
- **Una sola base de datos** para todos los clientes
- **Filtrado automático por tenant_id** en todas las consultas
- **Middleware de contexto** para extraer tenant del JWT
- **Guards** para validar acceso por tenant

### Sistema de Usuarios
- **SYSTEM_ADMIN**: Administrador del sistema completo
- **TENANT_OWNER**: Dueño del consultorio (administrador del tenant)
- **TENANT_USER**: Usuario del consultorio (nutricionista/recepcionista)

### Sistema de Roles y Permisos
- **Roles predeterminados**: Nutricionista y Recepcionista
- **Roles personalizables** con permisos granulares
- **Permisos por módulo**: usuarios, pacientes, citas, reportes, etc.

### Módulos Implementados
1. **Core**: Contexto de tenant, middleware y guards
2. **Tenants**: Gestión de consultorios
3. **Users**: Usuarios con soporte multitenant
4. **Auth**: Autenticación con JWT extendido
5. **Roles**: Sistema de roles y permisos
6. **Memberships**: Planes de suscripción y pagos

## 🛠️ Setup del Proyecto

### Prerrequisitos
- Node.js 18+
- PostgreSQL 14+
- pnpm

### Instalación

```bash
# Clonar e instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
```

### Variables de Entorno

```env
# Database
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=valnut_user
DB_PASSWORD=valnut_password
DB_NAME=valnut_db

# JWT
JWT_SECRET=your_jwt_secret_key_here

# App
PORT=3000
NODE_ENV=development
```

### Base de Datos

```bash
# Las tablas se crean automáticamente con synchronize: true
# Solo ejecutar seeders para datos iniciales (admin, membresías y tenant demo)
pnpm seed
```

## 📊 Estructura de la Base de Datos

### Tablas Core
- **tenants**: Consultorios/clientes
- **users**: Usuarios con tenant_id y user_type
- **profiles**: Perfiles de usuario (email único por tenant)

### Sistema de Roles
- **roles**: Roles por tenant (y roles del sistema)
- **user_roles**: Asignación usuario-rol

### Membresías
- **memberships**: Planes de suscripción
- **tenant_memberships**: Asignación tenant-plan
- **payment_history**: Historial de pagos

## 🔐 Autenticación y Autorización

### Flujo de Seguridad Completo

El sistema implementa un flujo de seguridad multicapa que procesa cada request en el siguiente orden:

#### 1. **TenantMiddleware** (Procesamiento de Contexto)
```
Request → TenantMiddleware → Guards → Controller
```

**Ubicación**: `src/core/middleware/tenant.middleware.ts`  
**Se ejecuta en**: TODAS las rutas (`*`)

```typescript
// Flujo del middleware:
1. Extrae token JWT del header Authorization
2. Verifica y decodifica el token JWT
3. Extrae información del usuario (id, username, tenantId, userType)
4. Establece contexto de tenant si existe payload.tenantId
5. Añade req.user para uso posterior
6. Continúa al siguiente middleware/guard
```

**Comportamiento por tipo de usuario**:
- **System Admin** (`userType: 'SYSTEM_ADMIN'`): `tenantId: null` - Sin contexto de tenant
- **Tenant Owner/User**: `tenantId: "uuid"` - Contexto establecido automáticamente

#### 2. **Guards de Autenticación y Autorización**

##### A. **JwtAuthGuard** (Autenticación)
```typescript
// src/auth/guards/jwt-auth.guard.ts
@UseGuards(JwtAuthGuard)
```

**Proceso**:
1. Verifica que existe token JWT válido
2. Valida firma del token con JWT_SECRET
3. Si es ruta `@Public()` → bypassa autenticación
4. Si token válido → pasa al siguiente guard
5. Si token inválido → retorna 401 Unauthorized

##### B. **PermissionsGuard** (Autorización)
```typescript
// src/core/guards/permissions.guard.ts
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions(PERMISSIONS.SYSTEM_ADMIN)
```

**Proceso detallado**:
```typescript
1. Verifica si el endpoint requiere permisos específicos (@RequirePermissions)
2. Si no requiere permisos → permite acceso
3. Si requiere permisos:
   a. Verifica que el usuario esté autenticado (req.user)
   b. SYSTEM_ADMIN → acceso automático a todo
   c. Para otros usuarios:
      - Obtiene tenantId del contexto
      - Valida que usuario pertenezca al tenant correcto
      - Consulta permisos del usuario en la BD
      - Verifica si tiene TODOS los permisos requeridos
   d. Si tiene permisos → permite acceso
   e. Si no tiene permisos → retorna 403 Forbidden
```

##### C. **TenantGuard** (Contexto de Tenant)
```typescript
// src/core/guards/tenant.guard.ts
@UseGuards(JwtAuthGuard, TenantGuard)
@RequireTenant()
```

**Proceso**:
1. Verifica que existe contexto de tenant activo
2. SYSTEM_ADMIN → bypassa validación (acceso global)
3. Otros usuarios → requiere tenantId válido
4. Si no hay contexto → retorna 400 Bad Request

### JWT Payload Estructura
```typescript
{
  sub: string;        // User ID (UUID)
  username: string;   // Username único
  tenantId?: string;  // Tenant ID (null para system admin)
  userType: string;   // 'SYSTEM_ADMIN' | 'TENANT_OWNER' | 'TENANT_USER'
  iat: number;        // Issued at timestamp  
  exp: number;        // Expiration timestamp
}
```

### Configuración de Guards por Endpoint

#### **Rutas Públicas** (sin autenticación)
```typescript
@Public()
@Post('/auth/login')
// No guards aplicados
```

#### **Rutas Autenticadas** (solo JWT)
```typescript
@UseGuards(JwtAuthGuard)
@Get('/profile')
// Solo requiere token válido
```

#### **Rutas con Permisos** (JWT + Permisos)
```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions(PERMISSIONS.USER_CREATE)
@Post('/users')
// Requiere token + permiso específico
```

#### **Rutas de Sistema** (Solo System Admin)
```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions(PERMISSIONS.SYSTEM_ADMIN)
@Get('/tenants')
// Solo system admins
```

### Sistema de Permisos Granular

#### **Tipos de Permisos**
```typescript
// src/common/constants/permissions.constant.ts
export const PERMISSIONS = {
  // Usuarios
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // Pacientes  
  PATIENT_CREATE: 'patient:create',
  PATIENT_READ: 'patient:read',
  // ... más permisos
  
  // Sistema
  SYSTEM_ADMIN: 'system:admin',
  TENANT_SETTINGS: 'tenant:settings',
}
```

#### **Resolución de Permisos**
```typescript
// Proceso en PermissionsGuard.getUserPermissions():
1. Obtiene roles del usuario en el tenant actual
2. Por cada rol:
   - Si es rol de sistema → añade SYSTEM_ADMIN
   - Añade todos los permisos del rol
3. Retorna set único de permisos
4. Verifica si incluye TODOS los permisos requeridos
```

### Decoradores Implementados

#### **@Public()** - Ruta Pública
```typescript
// src/auth/decorators/public.decorator.ts
@Public()
@Post('/auth/login')
// Bypassa JwtAuthGuard
```

#### **@RequirePermissions()** - Permisos Específicos
```typescript
// src/core/decorators/require-permissions.decorator.ts
@RequirePermissions(PERMISSIONS.USER_CREATE, PERMISSIONS.USER_UPDATE)
@Patch('/users/:id')
// Requiere ambos permisos (AND logic)
```

#### **@RequireTenant()** - Contexto de Tenant
```typescript
// src/core/decorators/require-tenant.decorator.ts
@RequireTenant()
@Get('/patients')
// Requiere tenantId en contexto (excluye system admin)
```

### Manejo de Errores de Seguridad

#### **401 Unauthorized**
- Token JWT inválido, expirado o malformado
- Usuario no autenticado

#### **403 Forbidden**  
- Usuario autenticado pero sin permisos suficientes
- Usuario de tenant A intentando acceder a datos de tenant B

#### **400 Bad Request**
- Falta contexto de tenant cuando es requerido
- Datos de request inválidos

### Ejemplos de Flujo Completo

#### **Caso 1: System Admin accede a lista de tenants**
```
1. Request: GET /tenants
   Headers: Authorization: Bearer <token>

2. TenantMiddleware:
   - Decodifica JWT → userType: 'SYSTEM_ADMIN', tenantId: null
   - No establece contexto de tenant (system admin global)
   - req.user = { id, username, userType: 'SYSTEM_ADMIN', tenantId: null }

3. JwtAuthGuard:
   - Valida token JWT → ✅ Válido
   - Continúa al siguiente guard

4. PermissionsGuard:
   - Verifica @RequirePermissions(PERMISSIONS.SYSTEM_ADMIN)
   - userType === 'SYSTEM_ADMIN' → ✅ Acceso automático
   - Continúa al controller

5. Controller: TenantsController.findAll()
   - System admin puede ver todos los tenants
   - Retorna lista completa sin filtros
```

#### **Caso 2: Tenant User accede a usuarios de su tenant**
```
1. Request: GET /users
   Headers: Authorization: Bearer <token>

2. TenantMiddleware:
   - Decodifica JWT → userType: 'TENANT_USER', tenantId: 'tenant-uuid-123'
   - Establece contexto: TenantContextService.setTenantId('tenant-uuid-123')
   - req.user = { id, username, userType: 'TENANT_USER', tenantId: 'tenant-uuid-123' }

3. JwtAuthGuard:
   - Valida token JWT → ✅ Válido
   - Continúa al siguiente guard

4. PermissionsGuard:
   - Verifica @RequirePermissions(PERMISSIONS.USER_READ)
   - userType !== 'SYSTEM_ADMIN' → consulta permisos en BD
   - getUserPermissions('user-id', 'tenant-uuid-123'):
     a. Busca roles del usuario en tenant-uuid-123
     b. Usuario tiene rol 'Recepcionista'  
     c. Rol incluye permiso 'user:read'
   - ✅ Tiene permiso requerido
   - Continúa al controller

5. Controller: UsersController.findAll()
   - Consulta automáticamente filtrada por tenantId: 'tenant-uuid-123'
   - Retorna solo usuarios del tenant actual
```

#### **Caso 3: Usuario sin permisos intenta acceder**
```
1. Request: DELETE /users/123
   Headers: Authorization: Bearer <token>

2. TenantMiddleware:
   - Decodifica JWT → userType: 'TENANT_USER', tenantId: 'tenant-uuid-123'
   - Establece contexto de tenant
   - req.user = { id, username, userType: 'TENANT_USER', tenantId: 'tenant-uuid-123' }

3. JwtAuthGuard:
   - Valida token JWT → ✅ Válido

4. PermissionsGuard:
   - Verifica @RequirePermissions(PERMISSIONS.USER_DELETE)
   - getUserPermissions('user-id', 'tenant-uuid-123'):
     a. Usuario tiene rol 'Recepcionista'
     b. Rol NO incluye permiso 'user:delete' (solo read/create)
   - ❌ No tiene permiso requerido
   - Retorna 403 Forbidden

❌ Request bloqueado - Usuario no autorizado
```

#### **Caso 4: Token inválido o expirado**
```
1. Request: GET /users
   Headers: Authorization: Bearer <token_expirado>

2. TenantMiddleware:
   - Intenta decodificar JWT → ❌ Token expirado
   - console.log('Token verification failed: jwt expired')
   - No establece req.user
   - Continúa (middleware no bloquea)

3. JwtAuthGuard:
   - Verifica token → ❌ Token inválido/expirado
   - Retorna 401 Unauthorized

❌ Request bloqueado - Autenticación fallida
```

### Configuración de Seguridad por Módulo

#### **Tenants Module** (Solo System Admin)
```typescript
@Controller('tenants')
@UseGuards(JwtAuthGuard) // Solo autenticación JWT
export class TenantsController {
  
  @Get()
  @Public() // ❌ INCORRECTO - permitiría acceso sin auth
  
  @Get()  // ✅ CORRECTO - requiere token JWT válido
  async findAll() {
    // System admin puede ver todos
    // Otros usuarios no tienen acceso por configuración del controller
  }
}
```

#### **Users Module** (Filtrado por Tenant)
```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  
  @Get()
  @RequirePermissions(PERMISSIONS.USER_READ)
  async findAll() {
    // Automáticamente filtrado por tenant del usuario
    // System admin ve todos los usuarios
  }
  
  @Delete(':id')
  @RequirePermissions(PERMISSIONS.USER_DELETE, PERMISSIONS.USER_UPDATE)
  async remove() {
    // Requiere AMBOS permisos (AND logic)
    // Solo usuarios con rol que tenga ambos permisos
  }
}
```

### Consideraciones de Rendimiento

#### **Cache de Contexto**
- El contexto de tenant se mantiene durante toda la request
- No se consulta múltiples veces en la misma request
- TenantContextService usa AsyncLocalStorage para aislamiento

#### **Optimizaciones de DB**
```typescript
// PermissionsGuard consulta eficiente:
const userPermissions = await this.getUserPermissions(userId, tenantId);

// Une roles y permisos en una sola query
// Cache de permisos por usuario/tenant (futuro)
// Índices en user_roles(userId, tenantId) y role_permissions
```

## 🌐 APIs Disponibles

### Autenticación
- `POST /auth/login` - Login con username/password
- `POST /auth/register` - Registro de usuario

### Tenants (Solo System Admin)
- `GET /tenants` - Listar todos los tenants
- `POST /tenants` - Crear tenant
- `GET /tenants/:id` - Obtener tenant por ID
- `PATCH /tenants/:id` - Actualizar tenant
- `DELETE /tenants/:id` - Eliminar tenant

### Memberships
- `GET /memberships` - Listar planes disponibles
- `POST /memberships` - Crear plan (System Admin)
- `POST /memberships/tenant` - Asignar plan a tenant
- `GET /memberships/tenant/:tenantId` - Historial de membresías

### Roles
- `GET /roles` - Listar roles (tenant + sistema)
- `POST /roles` - Crear rol personalizado
- `POST /roles/assign` - Asignar rol a usuario
- `DELETE /roles/unassign/:userId/:roleId` - Quitar rol

### Users
- `GET /users` - Listar usuarios (filtrado por tenant)
- `POST /users` - Crear usuario
- `PATCH /users/:id` - Actualizar usuario

## 🧪 Datos de Prueba

Después de ejecutar `pnpm seed`, tendrás:

### System Admin
- **Username**: `system_admin`
- **Password**: `admin123!`
- **Email**: `admin@valnut.com`

### Demo Tenant
- **Tenant**: Consultorio Nutricional Demo
- **Owner Username**: `demo_owner`
- **Receptionist Username**: `demo_receptionist`
- **Password** (ambos): `demo123!`

### Membresías Disponibles
- Plan Básico ($29.99/mes)
- Plan Profesional ($79.99/mes)
- Plan Empresarial ($149.99/mes)
- Planes anuales con descuento

## 🔧 Desarrollo

### Comandos Útiles

```bash
# Desarrollo
pnpm start:dev

# Seeders (datos iniciales)
pnpm seed

# Linting y formato
pnpm lint
pnpm format

# Tests
pnpm test
pnpm test:watch
pnpm test:cov
```

### Estructura del Proyecto

```
src/
├── common/           # Enums, constantes, DTOs comunes
├── config/           # Configuraciones
├── core/             # Módulo core (tenant context, guards, middleware)
├── database/         # Seeders con datos iniciales
├── auth/             # Autenticación y autorización
├── users/            # Gestión de usuarios
├── tenants/          # Gestión de tenants
├── roles/            # Sistema de roles
├── memberships/      # Planes y pagos
└── main.ts           # Punto de entrada
```

## 🔐 Seguridad

- ✅ **Filtrado automático** por tenant en todas las consultas
- ✅ **Validación estricta** de permisos por endpoint
- ✅ **Encriptación** de contraseñas con bcrypt
- ✅ **Audit trail** con campos createdBy/updatedBy
- ✅ **Soft delete** en todas las entidades críticas

## 📈 Performance

- ✅ **Índices optimizados** en tenant_id y campos críticos
- ✅ **Paginación** implementable en todos los listados
- ✅ **Queries eficientes** con joins optimizados
- ✅ **Cache** de contexto por request

## 🚀 Próximos Pasos

El sistema está listo para agregar:
1. **Módulo de Pacientes** con filtrado por tenant
2. **Sistema de Citas** con calendar scheduling
3. **Reportes avanzados** con métricas por tenant
4. **Cola de espera** para gestión de turnos
5. **API de integración** para partners

## 📝 Notas Importantes

- Todas las consultas se filtran automáticamente por tenant
- Los system admins pueden acceder a todos los tenants
- Los roles se pueden personalizar por tenant
- El sistema soporta tanto roles predefinidos como personalizados
- Las membresías controlan límites por tenant (usuarios, pacientes, etc.)

## 🤝 Contribución

1. Fork el proyecto
2. Crear branch para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver archivo [LICENSE.md](LICENSE.md) para detalles.