import { Injectable } from '@nestjs/common';
import {
  ThrottlerModuleOptions,
  ThrottlerOptionsFactory,
} from '@nestjs/throttler';

@Injectable()
export class ThrottlerConfigService implements ThrottlerOptionsFactory {
  createThrottlerOptions(): ThrottlerModuleOptions {
    return {
      throttlers: [
        {
          ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
          limit: parseInt(process.env.RATE_LIMIT_LIMIT, 10) || 100,
        },
      ],
    };
  }
}
