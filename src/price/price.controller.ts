import { Controller, Get, Query } from '@nestjs/common';
import { PriceService } from './price.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('prices')
@Controller('prices')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get('last-24-hours')
  @ApiOperation({ summary: 'Get hourly prices for the last 24 hours' })
  @ApiQuery({ name: 'chain', enum: ['ethereum', 'polygon'], required: true })
  async getPricesLast24Hours(@Query('chain') chain: string) {
    const prices = await this.priceService.getPricesLast24Hours();
    const hourlyPrices = this.groupPricesByHour(
      prices.filter((p) => p.chain === chain),
    );
    console.log('price here');
    return hourlyPrices;
  }

  private groupPricesByHour(prices: any[]): any[] {
    const hourlyPrices = [];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const hourStart = new Date(now.getTime() - (i + 1) * 60 * 60 * 1000);
      const hourEnd = new Date(now.getTime() - i * 60 * 60 * 1000);
      const pricesInHour = prices.filter(
        (p) => p.timestamp >= hourStart && p.timestamp < hourEnd,
      );
      if (pricesInHour.length > 0) {
        const averagePrice =
          pricesInHour.reduce((sum, p) => sum + p.price, 0) /
          pricesInHour.length;
        hourlyPrices.push({
          hour: hourStart.toISOString(),
          price: averagePrice,
        });
      }
    }
    return hourlyPrices.reverse();
  }
}
