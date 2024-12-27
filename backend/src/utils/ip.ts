import { Request } from 'express';

export const getRealIp = (req: Request): string => {
  const realIp = req.headers['x-real-ip'] as string;
  if (realIp) return realIp;

  const forwardedFor = req.headers['x-forwarded-for'] as string;
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip || 'unknown';
}; 