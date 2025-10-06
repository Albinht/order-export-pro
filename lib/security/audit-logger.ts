import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type AuditAction = 
  | 'LOGIN'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'EXPORT_ORDERS'
  | 'CREATE_STORE'
  | 'UPDATE_STORE'
  | 'DELETE_STORE'
  | 'UPDATE_ORDER_STATUS'
  | 'SECURITY_SETTINGS_UPDATE'
  | '2FA_ENABLED'
  | '2FA_DISABLED'
  | '2FA_VERIFIED'
  | '2FA_FAILED'
  | 'PASSWORD_CHANGED'
  | 'SESSION_EXPIRED'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED';

export interface AuditLogEntry {
  userId?: string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  errorMessage?: string;
}

/**
 * Log an audit event
 */
export async function logAuditEvent(entry: AuditLogEntry) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        details: entry.details ? JSON.stringify(entry.details) : null,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        success: entry.success ?? true,
        errorMessage: entry.errorMessage
      }
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't throw - audit logging should not break the app
  }
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(options: {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const where: any = {};
  
  if (options.userId) where.userId = options.userId;
  if (options.action) where.action = options.action;
  if (options.resource) where.resource = options.resource;
  
  if (options.startDate || options.endDate) {
    where.createdAt = {};
    if (options.startDate) where.createdAt.gte = options.startDate;
    if (options.endDate) where.createdAt.lte = options.endDate;
  }
  
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: options.limit || 100,
      skip: options.offset || 0
    }),
    prisma.auditLog.count({ where })
  ]);
  
  return {
    logs: logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null
    })),
    total
  };
}

/**
 * Clean up old audit logs based on retention policy
 */
export async function cleanupOldAuditLogs(retentionDays: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  try {
    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });
    
    console.log(`Cleaned up ${result.count} old audit logs`);
    
    // Log the cleanup action itself
    await logAuditEvent({
      action: 'SECURITY_SETTINGS_UPDATE',
      resource: 'audit_logs',
      details: {
        action: 'cleanup',
        deletedCount: result.count,
        retentionDays
      },
      success: true
    });
    
    return result.count;
  } catch (error) {
    console.error('Failed to cleanup audit logs:', error);
    throw error;
  }
}

/**
 * Get user activity summary
 */
export async function getUserActivitySummary(userId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const logs = await prisma.auditLog.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate
      }
    },
    select: {
      action: true,
      success: true,
      createdAt: true
    }
  });
  
  // Aggregate by action type
  const summary: Record<string, { count: number; lastOccurrence: Date }> = {};
  
  logs.forEach(log => {
    if (!summary[log.action]) {
      summary[log.action] = {
        count: 0,
        lastOccurrence: log.createdAt
      };
    }
    
    summary[log.action].count++;
    if (log.createdAt > summary[log.action].lastOccurrence) {
      summary[log.action].lastOccurrence = log.createdAt;
    }
  });
  
  return {
    totalActions: logs.length,
    period: `${days} days`,
    actions: summary
  };
}
