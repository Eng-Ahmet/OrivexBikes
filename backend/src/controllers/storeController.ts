import { Request, Response } from 'express';
import { memoryData } from '../db/initSchema.js';

export const getStores = (req: Request, res: Response) => {
  return res.json(memoryData.stores);
};
