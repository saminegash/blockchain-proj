import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AlertService } from './alert.service';
import { Alert } from './entities/alert.entity';
import { PriceService } from '../price/price.service';
import { Repository } from 'typeorm';

describe('AlertService', () => {
  let service: AlertService;
  let repository: Repository<Alert>;
  let priceService: PriceService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertService,
        {
          provide: getRepositoryToken(Alert),
          useClass: Repository,
        },
        {
          provide: PriceService,
          useValue: {
            getPricesLastHour: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test@example.com'),
          },
        },
      ],
    }).compile();

    service = module.get<AlertService>(AlertService);
    repository = module.get<Repository<Alert>>(getRepositoryToken(Alert));
    priceService = module.get<PriceService>(PriceService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAlert', () => {
    it('should create a new alert', async () => {
      const createSpy = jest
        .spyOn(repository, 'create')
        .mockReturnValue({} as Alert);
      const saveSpy = jest
        .spyOn(repository, 'save')
        .mockResolvedValue({} as Alert);

      await service.createAlert('ethereum', 2000, 'test@example.com');

      expect(createSpy).toHaveBeenCalledWith({
        chain: 'ethereum',
        targetPrice: 2000,
        email: 'test@example.com',
      });
      expect(saveSpy).toHaveBeenCalled();
    });
  });

  describe('checkAlerts', () => {
    it('should check and trigger alerts', async () => {
      const mockAlerts = [
        {
          id: 1,
          chain: 'ethereum',
          targetPrice: 2000,
          email: 'test@example.com',
          triggered: false,
        },
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(mockAlerts as Alert[]);
      jest.spyOn(service as any, 'getCurrentPrice').mockResolvedValue(2100);
      const sendEmailSpy = jest
        .spyOn(service as any, 'sendEmail')
        .mockResolvedValue(undefined);
      const saveSpy = jest
        .spyOn(repository, 'save')
        .mockResolvedValue({} as Alert);

      await service.checkAlerts();

      expect(sendEmailSpy).toHaveBeenCalled();
      expect(saveSpy).toHaveBeenCalledWith({
        ...mockAlerts[0],
        triggered: true,
      });
    });
  });

  describe('checkPriceIncrease', () => {
    it('should check for price increases and send alerts', async () => {
      const mockPrices = [
        { price: 2100, timestamp: new Date() },
        { price: 2000, timestamp: new Date(Date.now() - 60 * 60 * 1000) },
      ];
      jest
        .spyOn(priceService, 'getPricesLastHour')
        .mockResolvedValue(mockPrices as any[]);
      const sendEmailSpy = jest
        .spyOn(service as any, 'sendEmail')
        .mockResolvedValue(undefined);

      await service.checkPriceIncrease();

      expect(sendEmailSpy).toHaveBeenCalled();
    });
  });
});
