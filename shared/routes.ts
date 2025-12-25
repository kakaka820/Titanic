import { z } from 'zod';
import { insertPassengerSchema, passengers } from './schema';

export const api = {
  passengers: {
    list: {
      method: 'GET' as const,
      path: '/api/passengers',
      responses: {
        200: z.array(z.custom<typeof passengers.$inferSelect>()),
      },
    },
    eda: {
      method: 'GET' as const,
      path: '/api/analysis/eda',
      responses: {
        200: z.object({
          totalPassengers: z.number(),
          transportedCount: z.number(),
          transportedRate: z.number(),
          features: z.array(z.object({
            feature: z.string(),
            data: z.array(z.object({
              label: z.string(),
              transported: z.number(),
              notTransported: z.number(),
              total: z.number(),
              rate: z.number(),
            }))
          }))
        })
      }
    },
    ml: {
      method: 'GET' as const,
      path: '/api/analysis/ml',
      responses: {
        200: z.object({
          importances: z.array(z.object({
            feature: z.string(),
            importance: z.number(),
          })),
          metrics: z.array(z.object({
            model: z.string(),
            accuracy: z.number(),
            cv_score: z.number(),
          })),
          suggestedFeatures: z.array(z.string()),
        })
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
