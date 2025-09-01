export const PERMISSIONS = {
  // Gestión de usuarios
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  // Gestión de pacientes
  PATIENT_CREATE: 'patient:create',
  PATIENT_READ: 'patient:read',
  PATIENT_UPDATE: 'patient:update',
  PATIENT_DELETE: 'patient:delete',

  // Historial médico
  MEDICAL_HISTORY_CREATE: 'medical_history:create',
  MEDICAL_HISTORY_READ: 'medical_history:read',
  MEDICAL_HISTORY_UPDATE: 'medical_history:update',

  // Turnos y citas
  APPOINTMENT_CREATE: 'appointment:create',
  APPOINTMENT_READ: 'appointment:read',
  APPOINTMENT_UPDATE: 'appointment:update',
  APPOINTMENT_DELETE: 'appointment:delete',

  // Cola de espera
  QUEUE_MANAGE: 'queue:manage',
  QUEUE_VIEW: 'queue:view',

  // Reportes
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',

  // Configuración
  TENANT_SETTINGS: 'tenant:settings',
  TENANT_USERS_MANAGE: 'tenant:users_manage',

  // Sistema
  SYSTEM_ADMIN: 'system:admin',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];