import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: any;
      tenantId?: string;
      file?: any;
    }

    interface Response {
      // Add any custom response properties if needed
    }
  }
}

export interface AuthRequest extends Request {
  user?: any;
  tenantId?: string;
  body: any;
  params: any;
  query: any;
  headers: any;
  file?: any;
}

export interface IdempotentRequest extends Request {
  idempotencyKey?: string;
}
