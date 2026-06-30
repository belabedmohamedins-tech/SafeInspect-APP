// server/src/middleware/auth.ts
//
// JWT guard middleware.
// Usage: router.get('/protected', requireAuth, handler)
//
// Attaches req.inspector = { id, matricule, role } on success.

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  inspectorId: string;
  matricule:   string;
  role:        string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      inspector?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.inspector = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalid or expired' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.inspector) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    if (!roles.includes(req.inspector.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
