import { Module } from '@nestjs/common';

import { ThrottlerStorageRedisService } from './nest-throttler-storage-redis.service';

@Module({
  providers: [ThrottlerStorageRedisService],
  exports: [ThrottlerStorageRedisService],
})
export class NestThrottlerStorageRedisModule {}
