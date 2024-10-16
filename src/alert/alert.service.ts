import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './entities/alert.entity';
import { PriceService } from '../price/price.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AlertService {
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
    // Implement logic to check alerts and send emails
  }

  private async sendEmail(to: string, subject: string, text: string) {
    await this.transporter.sendMail({
      from: this.configService.get('smtp.user'),
      to,
      subject,
      text,
    });
  }
}
