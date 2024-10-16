import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertService } from './alert.service';
import { AlertController } from './alert.controller';
import { Alert } from './entities/alert.entity';
import { PriceModule } from '../price/price.module';

@Module({
  imports: [TypeOrmModule.forFeature([Alert]), PriceModule],
  providers: [AlertService],
  controllers: [AlertController],
})
export class AlertModule {}
