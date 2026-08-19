import { Request, Response } from 'express';
import { memoryData, Setting } from '../db/initSchema.js';
import { AuthRequest } from '../middleware/auth.js';

export const getSettings = (req: Request, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : undefined;
  let settings = memoryData.settings;

  if (storeId) {
    settings = settings.filter(s => s.store_id === storeId || s.store_id === undefined);
  }

  return res.json(settings);
};

export const updateSetting = (req: AuthRequest, res: Response) => {
  const key = String(req.params.key);
  const { value } = req.body;
  const requestId = (req as any).requestId || `req-${Date.now()}`;
  const userId = req.user?.id || 1;

  const setting = memoryData.settings.find(s => s.key === key);
  if (!setting) {
    return res.status(404).json({
      success: false,
      error: { code: 'RESOURCE_NOT_FOUND', message: `Setting key '${key}' not found.` },
      request_id: requestId
    });
  }

  if (value === undefined || value === null) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Setting value is required.' },
      request_id: requestId
    });
  }

  const strVal = String(value);

  // Validate according to value_type
  switch (setting.value_type) {
    case 'INTEGER':
      if (isNaN(parseInt(strVal, 10))) {
        return res.status(422).json({
          success: false,
          error: { code: 'TYPED_VALUE_INVALID', message: `Setting '${key}' requires an INTEGER value.` },
          request_id: requestId
        });
      }
      break;
    case 'DECIMAL':
      if (isNaN(parseFloat(strVal))) {
        return res.status(422).json({
          success: false,
          error: { code: 'TYPED_VALUE_INVALID', message: `Setting '${key}' requires a DECIMAL value.` },
          request_id: requestId
        });
      }
      break;
    case 'BOOLEAN':
      if (strVal !== 'true' && strVal !== 'false') {
        return res.status(422).json({
          success: false,
          error: { code: 'TYPED_VALUE_INVALID', message: `Setting '${key}' requires a BOOLEAN ('true' or 'false').` },
          request_id: requestId
        });
      }
      break;
    case 'JSON':
      try {
        JSON.parse(strVal);
      } catch (err) {
        return res.status(422).json({
          success: false,
          error: { code: 'TYPED_VALUE_INVALID', message: `Setting '${key}' requires a valid JSON string.` },
          request_id: requestId
        });
      }
      break;
  }

  setting.value = strVal;
  setting.updated_by = userId;
  setting.updated_at = new Date().toISOString();

  // Log Audit
  memoryData.audit_logs.push({
    id: memoryData.audit_logs.length + 1,
    company_id: 1,
    store_id: setting.store_id || 1,
    user_id: userId,
    action: 'UPDATE_SETTING',
    entity_type: 'Setting',
    entity_id: setting.id,
    new_values: JSON.stringify({ key, value: strVal }),
    request_id: requestId,
    created_at: new Date().toISOString()
  });

  return res.json({ message: 'Setting updated successfully', setting });
};
