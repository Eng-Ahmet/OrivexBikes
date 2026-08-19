import { Request, Response } from 'express';
import { memoryData } from '../db/initSchema.js';

export const getRepairParts = (req: Request, res: Response) => {
  return res.json(memoryData.repair_parts);
};

export const getRepairServices = (req: Request, res: Response) => {
  return res.json(memoryData.repair_services);
};
