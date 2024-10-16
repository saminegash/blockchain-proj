import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Price } from './entities/price.entity';
import { ConfigService } from '@nestjs/config';
import Moralis from 'moralis';
@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);

  constructor(
    @InjectRepository(Price)
    private priceRepository: Repository<Price>,
    private configService: ConfigService,
  ) {
    Moralis.start({
      apiKey: process.env.MORALIS_API_KEY,
    });
  }

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
      this.logger.error(`Error saving prices: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to save prices',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async fetchPrice(chain: string): Promise<number> {
    try {
      const response = await Moralis.EvmApi.token.getTokenPrice(
        this.getAddress(chain),
      );

      return response.raw.usdPrice;
    } catch (error) {
      this.logger.error(
        `Error fetching ${chain} price: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        `Failed to fetch ${chain} price`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getAddress(chain: string): {
    chain: string;
    include: 'percent_change';
    address: string;
  } {
    const addresses = {
      ethereum: {
        chain: '0x1',
        include: 'percent_change',
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      },

      polygon: {
        chain: '0x89',
        include: 'percent_change',
        address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
      },
    };
    return addresses[chain] || '';
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
    const response = await this.priceRepository.find({
      where: {
        timestamp: MoreThan(oneDayAgo),
      },
      order: { timestamp: 'DESC' },
    });
    return response;
  }

  async getSwapRate(
    ethAmount: number,
  ): Promise<{ btcAmount: number; feeEth: number; feeUSD: number }> {
    try {
      const response = await Moralis.EvmApi.token.getMultipleTokenPrices(
        { chain: '0x1', include: 'percent_change' },
        {
          tokens: [
            { tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' },
            { tokenAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' },
          ],
        },
      );

      console.log(ethAmount);
      const ethPrice = response.raw[0].usdPrice;
      const btcPrice = response.raw[1].usdPrice;

      // Calculate swap values
      const ethValue = ethAmount * ethPrice;
      const btcAmount = ethValue / btcPrice;

      const feePercentage = 0.03 / 100;
      const feeEth = ethAmount * feePercentage;
      const feeUSD = feeEth * ethPrice;

      return {
        btcAmount,
        feeEth,
        feeUSD,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching ethereum and bitcoin price: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        `Failed to calculate swap rate`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
