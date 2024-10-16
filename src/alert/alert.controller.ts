import { Controller, Post, Body } from '@nestjs/common';
import { AlertService } from './alert.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('alerts')
@Controller('alerts')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new price alert' })
  async createAlert(
    @Body() alertData: { chain: string; targetPrice: number; email: string },
  ) {
    return this.alertService.createAlert(
      alertData.chain,
      alertData.targetPrice,
      alertData.email,
    );
  }
}
