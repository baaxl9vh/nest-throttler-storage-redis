import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { ThrottlerStorageRedisService } from '../../lib';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.test.local', '.env.test'],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        ttl: 10,
        limit: 5,
        ignoreUserAgents: [/npm-test-user-agent/g],
        storage: new ThrottlerStorageRedisService({
          prefix: 'throttler-test',
          socket: {
            host: config.get('REDIS_HOST'),
            port: config.get('REDIS_PORT'),
          },
        }),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
