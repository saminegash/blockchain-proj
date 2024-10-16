import { DataSource } from 'typeorm';
import { Price } from './price.entity';

export const priceProviders = [
  {
    provide: 'PRICE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Price),
    inject: ['DATA_SOURCE'],
  },
];
