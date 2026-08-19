import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export interface TracedRequest extends Request {
  requestId?: string;
}

export const requestTracingMiddleware = (req: TracedRequest, res: Response, next: NextFunction) => {
  const existingId = req.header('x-request-id') || req.header('X-Request-ID');
  const requestId = existingId || `req-${randomUUID()}`;
  
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  next();
};
