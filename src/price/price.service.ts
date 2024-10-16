import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Price } from './entities/price.entity';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);

  constructor(
    @InjectRepository(Price)
    private priceRepository: Repository<Price>,
    private configService: ConfigService,
  ) {}

  async savePrices() {
    try {
      const chains = ['ethereum', 'polygon'];
      for (const chain of chains) {
        const price = await this.fetchPrice(chain);
        await this.priceRepository.save({
          chain,
          price,
          timestamp: new Date(),
        });
        this.logger.log(`Saved ${chain} price: $${price}`);
      }
    } catch (error) {
      this.logger.error('Error saving prices', error.stack);
    }
  }

  private async fetchPrice(chain: string): Promise<number> {
    const apiKey = this.configService.get('moralis.apiKey');
    const url = `https://deep-index.moralis.io/api/v2/erc20/${this.getAddress(chain)}/price`;

    try {
      const response = await axios.get(url, {
        headers: {
          'X-API-Key': apiKey,
        },
      });
      return parseFloat(response.data.usdPrice);
    } catch (error) {
      this.logger.error(`Error fetching ${chain} price`, error.stack);
      throw error;
    }
  }

  private getAddress(chain: string): string {
    // You might want to store these in a configuration file
    const addresses = {
      ethereum: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
      polygon: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', // WMATIC
    };
    return addresses[chain];
  }

  async getPricesLastHour(chain: string): Promise<Price[]> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.priceRepository.find({
      where: {
        chain,
        timestamp: MoreThan(oneHourAgo),
      },
      order: { timestamp: 'DESC' },
    });
  }

  async getPricesLast24Hours(): Promise<Price[]> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.priceRepository.find({
      where: {
        timestamp: MoreThan(oneDayAgo),
      },
      order: { timestamp: 'DESC' },
    });
  }
}
