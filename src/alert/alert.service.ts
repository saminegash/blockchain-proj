import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './entities/alert.entity';
import { PriceService } from '../price/price.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    private priceService: PriceService,
    private configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('smtp.host'),
      port: this.configService.get('smtp.port'),
      auth: {
        user: this.configService.get('smtp.user'),
        pass: this.configService.get('smtp.pass'),
      },
    });
  }

  async createAlert(
    chain: string,
    targetPrice: number,
    email: string,
  ): Promise<Alert> {
    const alert = this.alertRepository.create({ chain, targetPrice, email });
    return this.alertRepository.save(alert);
  }

  async checkAlerts() {
    try {
      const alerts = await this.alertRepository.find({
        where: { triggered: false },
      });
      for (const alert of alerts) {
        const currentPrice = await this.getCurrentPrice(alert.chain);
        if (currentPrice >= alert.targetPrice) {
          await this.sendAlertEmail(alert, currentPrice);
          alert.triggered = true;
          await this.alertRepository.save(alert);
        }
      }
    } catch (error) {
      this.logger.error('Error checking alerts', error.stack);
    }
  }

  async checkPriceIncrease() {
    const chains = ['ethereum', 'polygon'];
    for (const chain of chains) {
      try {
        const prices = await this.priceService.getPricesLastHour(chain);
        if (prices.length < 2) continue;

        const currentPrice = prices[0].price;
        const oneHourAgoPrice = prices[prices.length - 1].price;
        const increasePercentage =
          ((currentPrice - oneHourAgoPrice) / oneHourAgoPrice) * 100;

        if (increasePercentage > 3) {
          await this.sendPriceIncreaseEmail(
            chain,
            currentPrice,
            oneHourAgoPrice,
            increasePercentage,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error checking price increase for ${chain}`,
          error.stack,
        );
      }
    }
  }

  private async getCurrentPrice(chain: string): Promise<number> {
    const prices = await this.priceService.getPricesLastHour(chain);
    return prices[0]?.price || 0;
  }

  private async sendAlertEmail(alert: Alert, currentPrice: number) {
    const subject = `Price Alert: ${alert.chain.toUpperCase()} has reached $${currentPrice}`;
    const text = `The price of ${alert.chain.toUpperCase()} has reached your target price of $${alert.targetPrice}. The current price is $${currentPrice}.`;
    await this.sendEmail(alert.email, subject, text);
  }

  private async sendPriceIncreaseEmail(
    chain: string,
    currentPrice: number,
    previousPrice: number,
    increasePercentage: number,
  ) {
    const subject = `Price Increase Alert: ${chain.toUpperCase()} price has increased by ${increasePercentage.toFixed(2)}%`;
    const text = `The price of ${chain.toUpperCase()} has increased by ${increasePercentage.toFixed(2)}% in the last hour. Previous price: $${previousPrice.toFixed(2)}. Current price: $${currentPrice.toFixed(2)}.`;
    await this.sendEmail(this.configService.get('alertEmail'), subject, text);
  }

  private async sendEmail(to: string, subject: string, text: string) {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('smtp.user'),
        to,
        subject,
        text,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      this.logger.error('Error sending email', error.stack);
    }
  }
}
