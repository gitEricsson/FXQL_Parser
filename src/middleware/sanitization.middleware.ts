import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as sanitizeHtml from 'sanitize-html';
import validator from 'validator';

@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.query) {
      Object.keys(req.query).forEach((key) => {
        const value = req.query[key];
        if (typeof value === 'string') {
          req.query[key] = validator.escape(
            sanitizeHtml(value, {
              allowedTags: [],
              allowedAttributes: {},
            }),
          );
        }
      });
    }

    if (req.body) {
      this.sanitizeObject(req.body);
    }

    next();
  }

  private sanitizeObject(obj: any) {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === 'string') {
        obj[key] = validator.escape(
          sanitizeHtml(obj[key], {
            allowedTags: [],
            allowedAttributes: {},
          }),
        );
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.sanitizeObject(obj[key]);
      }
    });
  }
}
