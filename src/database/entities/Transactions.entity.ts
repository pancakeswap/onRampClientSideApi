import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeUpdate,
} from 'typeorm';
import { UserEntity } from './users.entity';

export enum TX_STATUS {
  PENDING='PENDING',
  COMPLETED='COMPLETED',
  FAILED='FAILED'
}

@Entity({ name: 'transaction' })
export class MoonpayTxEntity  {
  constructor(
    transactionId: string,
    type: string,
    status: keyof typeof TX_STATUS,
    amount: number,
    fiatCurrency: string,
    cryptoCurrency: string,
    user: UserEntity
) {
    this.transactionId = transactionId,
    this.type = type,
    this.status = status,
    this.amount = amount,
    this.fiatCurrency = fiatCurrency,
    this.cryptoCurrency = cryptoCurrency,
    this.user = user,
    this.date = new Date()
  }
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', unique: true })
  transactionId: string;

  @Column({ type: 'text' })
  type: string;

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

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.transactions)
  @JoinColumn({ name: 'tx_id' })
  user: UserEntity;
}
