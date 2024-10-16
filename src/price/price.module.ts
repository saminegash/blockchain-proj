import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceService } from './price.service';
import { PriceController } from './price.controller';
import { Price } from './entities/price.entity';
import { priceProviders } from './entities/price.providers';

@Module({
  imports: [TypeOrmModule.forFeature([Price])],
  providers: [PriceService, ...priceProviders],
  controllers: [PriceController],
  exports: [PriceService],
})
export class PriceModule {}
