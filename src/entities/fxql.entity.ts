import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class FxqlEntry {
  @PrimaryGeneratedColumn()
  EntryId: number;

  @Column()
  SourceCurrency: string;

  @Column()
  DestinationCurrency: string;

  @Column('decimal', { precision: 10, scale: 4 })
  SellPrice: number;

  @Column('decimal', { precision: 10, scale: 4 })
  BuyPrice: number;

  @Column('integer')
  CapAmount: number;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
