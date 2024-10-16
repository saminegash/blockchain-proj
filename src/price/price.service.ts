import { Inject, Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Price } from './entities/price.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PriceService {
  // constructor(
  //   @InjectRepository(Price)
  //   private priceRepository: Repository<Price>,
  //   private configService: ConfigService,
  // ) {}
  constructor(
    @Inject('PRICE_REPOSITORY')
    private priceRepository: Repository<Price>,
    private configService: ConfigService,
  ) {}

  async savePrices() {
    //TODO
    // Implement Moralis API call to get prices
    // Save prices to the database
  }

  async getPricesLastHour(chain: string): Promise<Price[]> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.priceRepository.find({
      where: {
        chain,
        timestamp: MoreThanOrEqual(oneHourAgo),
      },
      order: { timestamp: 'DESC' },
    });
  }

  async getPricesLast24Hours(): Promise<Price[]> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.priceRepository.find({
      where: {
        timestamp: MoreThanOrEqual(oneDayAgo),
      },
      order: { timestamp: 'DESC' },
    });
  }
}
