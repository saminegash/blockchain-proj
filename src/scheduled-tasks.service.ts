import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PriceService } from './price/price.service';
import { AlertService } from './alert/alert.service';

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name);

  constructor(
    private readonly priceService: PriceService,
    private readonly alertService: AlertService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handlePriceFetching() {
    this.logger.log('Fetching prices');
    await this.priceService.savePrices();
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleAlertChecking() {
    this.logger.log('Checking alerts');
    await this.alertService.checkAlerts();
    await this.alertService.checkPriceIncrease();
  }
}
