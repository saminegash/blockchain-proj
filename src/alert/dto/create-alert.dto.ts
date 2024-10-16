import { IsString, IsNumber, IsEmail, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAlertDto {
  @ApiProperty({
    description: 'The blockchain to monitor',
    enum: ['ethereum', 'polygon'],
  })
  @IsString()
  @IsIn(['ethereum', 'polygon'])
  chain: string;

  @ApiProperty({ description: 'The target price to trigger the alert' })
  @IsNumber()
  targetPrice: number;

  @ApiProperty({ description: 'The email address to send the alert to' })
  @IsEmail()
  email: string;
}
