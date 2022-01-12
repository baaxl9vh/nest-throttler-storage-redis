import { Controller, Get } from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly service: AppService) {}

  @Get()
  index() {
    return 'hello world';
  }

  @Get('limit')
  @Throttle(2, 5)
  limit() {
    return 'limit';
  }

  @Get('skip-throttle')
  @SkipThrottle(true)
  skipThrottle() {
    return 'skip throttle';
  }
}
