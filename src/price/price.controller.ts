import { Controller, Get } from '@nestjs/common';
import { PriceService } from './price.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('prices')
@Controller('prices')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get('last-24-hours')
  @ApiOperation({ summary: 'Get prices for the last 24 hours' })
  async getPricesLast24Hours() {
    return this.priceService.getPricesLast24Hours();
  }
}
