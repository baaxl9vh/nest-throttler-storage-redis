import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { createClient, RedisClientOptions, RedisClientType, RedisScripts } from 'redis';

@Injectable()
export class ThrottlerStorageRedisService<
  S extends RedisScripts = Record<string, never>,
> implements ThrottlerStorage, OnModuleDestroy
{
  public static DEFAULT_PREFIX = 'rate_limit';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private redis: RedisClientType<any, S>;
  private count = 1000;
  private prefix = '';
  private closeAfterDestroyed = true;

  storage: Record<string, number[]> = {};

  constructor (
    private readonly options: Omit<
      RedisClientOptions<never, S> & {
        prefix?: string;
        closeAfterDestroyed?: boolean;
      },
      'modules'
    >,
  ) {
    this.redis = createClient(options);
    this.prefix = options.prefix ? options.prefix + ':' : '';
    if (options.closeAfterDestroyed === undefined) {
      this.closeAfterDestroyed = true;
    } else {
      this.closeAfterDestroyed = options.closeAfterDestroyed;
    }
    this.redis.connect();
  }

  onModuleDestroy () {
    if (this.closeAfterDestroyed) {
      this.redis
        .QUIT()
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .then(() => {})
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .catch(() => {});
    }
  }

  async getRecord (key: string): Promise<number[]> {
    const keys = (
      await this.redis.scan(0, {
        MATCH: `${this.prefix}${ThrottlerStorageRedisService.DEFAULT_PREFIX}:${key}:*`,
        COUNT: this.count,
      })
    ).keys;
    return keys.map((k) => parseInt(k.split(':').pop() || '')).sort();
  }

  async addRecord (key: string, ttl: number): Promise<void> {
    await this.redis.set(
      `${this.prefix}${ThrottlerStorageRedisService.DEFAULT_PREFIX}:${key}:${
        Date.now() + ttl * 1000
      }`,
      ttl,
      { EX: ttl },
    );
  }
}
