import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { PriceService } from './price.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Price } from './entities/price.entity';

@ApiTags('prices')
@Controller('prices')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get('last-24-hours')
  @ApiOperation({ summary: 'Get hourly prices for the last 24 hours' })
  @ApiQuery({ name: 'chain', enum: ['ethereum', 'polygon'], required: true })
  async getPricesLast24Hours(@Query('chain') chain: string) {
    let prices = await this.priceService.getPricesLast24Hours();
    prices = prices.filter((p) => p.chain === chain);
    const hourlyPrices = this.groupPricesByHour(prices);
    return hourlyPrices;
  }

  private groupPricesByHour(prices: Price[]): any[] {
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
          pricesInHour.reduce((sum, p) => sum + +p.price, 0) /
          pricesInHour.length;
        hourlyPrices.push({
          hour: hourStart.toISOString(),
          price: averagePrice,
          chain: pricesInHour[0].chain,
        });
      }
    }
    return hourlyPrices.reverse();
  }

  @Get('swap-rate')
  async getSwapRate(@Query('ethAmount') ethAmount: string) {
    const amount = parseFloat(ethAmount);
    if (isNaN(amount)) {
      throw new BadRequestException('Invalid ETH amount');
    }
    return this.priceService.getSwapRate(amount);
  }
}
