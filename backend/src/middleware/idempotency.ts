import { Response, NextFunction } from 'express';
import { createHash } from 'crypto';
import { memoryData, IdempotencyKey } from '../db/initSchema.js';
import { TracedRequest } from './requestTracing.js';

export interface IdempotentRequest extends TracedRequest {
  idempotencyKey?: string;
  idempotencyRecord?: IdempotencyKey;
}

export const idempotencyMiddleware = (req: IdempotentRequest, res: Response, next: NextFunction): void => {
  const idempotencyKey = req.header('idempotency-key') || req.header('Idempotency-Key');
  
  if (!idempotencyKey) {
    // If not provided on state-changing endpoint, proceed normally (or enforce for POSTs)
    return next();
  }

  req.idempotencyKey = idempotencyKey;
  const userId = (req as any).user?.id || 1;
  const endpoint = `${req.method} ${req.baseUrl}${req.path}`;
  const payloadStr = JSON.stringify(req.body || {});
  const requestHash = createHash('sha256').update(payloadStr).digest('hex');

  // Lookup existing key
  const existing = memoryData.idempotency_keys.find(
    (item) => item.key === idempotencyKey && item.user_id === userId && item.endpoint === endpoint
  );

  if (existing) {
    if (existing.status === 'COMPLETED') {
      if (existing.request_hash !== requestHash) {
        res.status(422).json({
          success: false,
          error: {
            code: 'IDEMPOTENCY_PAYLOAD_MISMATCH',
            message: 'Same Idempotency-Key reused with a different request payload.',
            details: { key: idempotencyKey }
          },
          request_id: req.requestId
        });
        return;
      }
      
      // Return cached response directly
      try {
        const bodyObj = existing.response_body ? JSON.parse(existing.response_body) : {};
        res.status(existing.response_status || 200).json(bodyObj);
        return;
      } catch (err) {
        res.status(existing.response_status || 200).send(existing.response_body);
        return;
      }
    }

    if (existing.status === 'PROCESSING') {
      res.status(409).json({
        success: false,
        error: {
          code: 'OPERATION_IN_PROGRESS',
          message: 'A request with this Idempotency-Key is currently being processed.',
          details: { key: idempotencyKey }
        },
        request_id: req.requestId
      });
      return;
    }
  }

  // Create new processing record
  const newRecord: IdempotencyKey = {
    id: memoryData.idempotency_keys.length + 1,
    key: idempotencyKey,
    user_id: userId,
    request_id: req.requestId || 'req-unknown',
    endpoint,
    request_hash: requestHash,
    status: 'PROCESSING',
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  };

  memoryData.idempotency_keys.push(newRecord);
  req.idempotencyRecord = newRecord;

  // Intercept res.json to capture response
  const originalJson = res.json.bind(res);
  res.json = (body: any): Response => {
    newRecord.status = res.statusCode >= 400 ? 'FAILED' : 'COMPLETED';
    newRecord.response_status = res.statusCode;
    newRecord.response_body = JSON.stringify(body);
    return originalJson(body);
  };

  next();
};
