import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './users.entity';

export enum TX_STATUS {
  PENDING='PENDING',
  COMPLETED='COMPLETED',
  FAILED='FAILED'
}

@Entity({ name: 'mercuryoTransaction' })
export class MercuryoTxEntity  {
  constructor(
    transactionId,
    status,
    amount,
    fiatCurrency,
    cryptoCurrency,
  ) {
    this.transactionId = transactionId,
    this.status = status,
    this.amount = amount,
    this.fiatCurrency = fiatCurrency,
    this.cryptoCurrency = cryptoCurrency,
    this.date = new Date()
  }
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  transactionId: string;

  @Column({ type: 'text' })
  status: keyof typeof TX_STATUS;

  @Column()
  amount: number;

  @Column({ type: 'text' })
  fiatCurrency: string;

  @Column({ type: 'text' })
  cryptoCurrency: string;

  @Column({ type: 'text' })
  date: Date;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.mercuryoTransactions)
  @JoinColumn({ name: 'tx_id' })
  user: UserEntity;

}
