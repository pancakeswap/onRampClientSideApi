import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './users.entity';

export enum TX_STATUS {
  pending='pending',
  complete='complete',
  failed='failed'
}

@Entity({ name: 'transaction' })
export class MoonpayTxEntity  {
  constructor(
    transactionId: string,
    type: string,
    status: keyof typeof TX_STATUS,
    fiatAmount: number,
    cryptoAmount: number,
    providerFee: number,
    networkFee: number,
    rate: number,
    fiatCurrency: string,
    cryptoCurrency: string,
    network: string,
    updatedAt: string,
    user: UserEntity
) {
    this.transactionId = transactionId,
    this.type = type,
    this.status = status,
    this.fiatAmount = fiatAmount,
    this.cryptoAmount = cryptoAmount,
    this.providerFee = providerFee,
    this.networkFee = networkFee,
    this.rate = rate,
    this.fiatCurrency = fiatCurrency,
    this.cryptoCurrency = cryptoCurrency,
    this.network = network,
    this.user = user,
    this.updatedAt = updatedAt,
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

  @Column({type: "decimal", precision: 10, scale: 4})
  fiatAmount: number;

  @Column({type: "decimal", precision: 10, scale: 4})
  
  cryptoAmount: number;

  @Column({type: "decimal", precision: 10, scale: 4})
  
  providerFee: number;

  @Column({type: "decimal", precision: 10, scale: 4})
  
  networkFee: number;

  @Column({type: "decimal", precision: 10, scale: 4})
  
  rate: number;

  @Column({ type: 'text' })
  fiatCurrency: string;

  @Column({ type: 'text' })
  cryptoCurrency: string;

  @Column({ type: 'text' })
  network: string;

  @Column({ type: 'text' })
  date: Date;

  @Column({ type: 'text' })
  updatedAt: string;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.transactions)
  @JoinColumn({ name: 'tx_id' })
  user: UserEntity;
}