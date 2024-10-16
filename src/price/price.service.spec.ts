import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { PriceService } from './price.service';
import { Price } from './entities/price.entity';
import { Repository } from 'typeorm';

describe('PriceService', () => {
  let service: PriceService;
  let repository: Repository<Price>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceService,
        {
          provide: getRepositoryToken(Price),
          useClass: Repository,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('fake-api-key'),
          },
        },
      ],
    }).compile();

    service = module.get<PriceService>(PriceService);
    repository = module.get<Repository<Price>>(getRepositoryToken(Price));
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('savePrices', () => {
    it('should save prices for ethereum and polygon', async () => {
      const saveSpy = jest
        .spyOn(repository, 'save')
        .mockResolvedValue({} as Price);
      const fetchPriceSpy = jest
        .spyOn(service as any, 'fetchPrice')
        .mockResolvedValue(2000);

      await service.savePrices();

      expect(fetchPriceSpy).toHaveBeenCalledTimes(2);
      expect(fetchPriceSpy).toHaveBeenCalledWith('ethereum');
      expect(fetchPriceSpy).toHaveBeenCalledWith('polygon');
      expect(saveSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('getPricesLastHour', () => {
    it('should return prices from the last hour', async () => {
      const mockPrices = [{ price: 2000, timestamp: new Date() }];
      jest.spyOn(repository, 'find').mockResolvedValue(mockPrices as Price[]);

      const result = await service.getPricesLastHour('ethereum');

      expect(result).toEqual(mockPrices);
    });
  });

  describe('getPricesLast24Hours', () => {
    it('should return prices from the last 24 hours', async () => {
      const mockPrices = [{ price: 2000, timestamp: new Date() }];
      jest.spyOn(repository, 'find').mockResolvedValue(mockPrices as Price[]);

      const result = await service.getPricesLast24Hours();

      expect(result).toEqual(mockPrices);
    });
  });
});
