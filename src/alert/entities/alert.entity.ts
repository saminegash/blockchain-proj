import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chain: string;

  @Column('decimal', { precision: 10, scale: 2 })
  targetPrice: number;

  @Column()
  email: string;

  @Column({ default: false })
  triggered: boolean;
}
