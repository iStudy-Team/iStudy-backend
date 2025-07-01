export interface ActivityLogData {
  id: string;
  user_id: string;
  action: string;
  entity_type?: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface ActivityLogQuery {
  user_id?: string;
  action?: string;
  entity_type?: string;
  startDate?: string;
  endDate?: string;
  ip_address?: string;
}

export interface ActivityLogSummary {
  totalLogs: number;
  uniqueUsers: number;
  topActions: Array<{
    action: string;
    count: number;
  }>;
  topEntityTypes: Array<{
    entity_type: string;
    count: number;
  }>;
}

export enum ActivityAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  VIEW = 'VIEW',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  PAYMENT = 'PAYMENT',
  ENROLLMENT = 'ENROLLMENT',
}

export enum EntityType {
  USER = 'USER',
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT',
  CLASS = 'CLASS',
  INVOICE = 'INVOICE',
  PAYMENT = 'PAYMENT',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  NOTIFICATION = 'NOTIFICATION',
}
