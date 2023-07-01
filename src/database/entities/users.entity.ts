import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { MoonpayTxEntity } from './Transactions.entity'

@Entity({ name: 'users' })
export class UserEntity  {
  constructor(
    walletAddress: string,
    transactions: Array<MoonpayTxEntity>,
  ) {
  
    this.walletAddress = walletAddress
    this.transactions = transactions
  }
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'wallet_address', unique: true})
  walletAddress: string

  @OneToMany(() => MoonpayTxEntity, (tx: MoonpayTxEntity) => tx.user, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  transactions: Array<MoonpayTxEntity>

}
