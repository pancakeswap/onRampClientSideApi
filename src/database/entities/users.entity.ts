import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { MoonpayTxEntity } from './moonpayTxEntity'
import { MercuryoTxEntity } from './mercuryoTxEntity'

@Entity({ name: 'users' })
export class UserEntity  {
  constructor(
    walletAddress: string,
    moonpayTransactions: Array<MoonpayTxEntity>,
    mercuryoTransactions: Array<MercuryoTxEntity>,
  ) {
  
    this.walletAddress = walletAddress
    this.moonpayTransactions = moonpayTransactions
    this.mercuryoTransactions = mercuryoTransactions
  }
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'wallet_address',})
  walletAddress: string

  @OneToMany(() => MoonpayTxEntity, (tx: MoonpayTxEntity) => tx.user, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  moonpayTransactions: Array<MoonpayTxEntity>

  @OneToMany(() => MercuryoTxEntity, (tx: MercuryoTxEntity) => tx.user, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  mercuryoTransactions: Array<MercuryoTxEntity>
}
