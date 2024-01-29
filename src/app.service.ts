import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AppService {
  //This scheduler added for keeping service up, otherwise server goes to sleep
  @Cron(CronExpression.EVERY_10_MINUTES)
  onModuleInit() {
    console.log('@Cron for keeping service up');
  }
  getHello(): string {
    return 'Hello World!';
  }
}
