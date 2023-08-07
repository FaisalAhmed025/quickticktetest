import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum PaymentStatus {
   PENDING = 'PENDING',
   APPROVED = 'APPROVED',
   REJECTED = 'REJECTED',
 }

let depositIdCounter = Math.floor(Math.random() *10000)
@Entity()
export class GeneralLedger {
   @PrimaryGeneratedColumn()
   id:number
   @Column({type:'varchar'})
   depositid: string;
   @BeforeInsert()
   generateUserId() {
      depositIdCounter++;
    this.depositid = `FFD${depositIdCounter}`;
 }
   @Column()
   userID: string;
   @Column()
   val_id: string;
   @Column()
   depositmethod:string
   @Column()
   sender:string
   @Column()
   reciever:string
   @Column()
   bankname:string
   @Column()
   paymentgateway:string
   @Column()
   transactionId:string
   @Column({type:'varchar'})
   depositname:string
   @Column({type:'varchar'})
   chequenumber:string
   @Column({type:'varchar'})
   depositby:string
   @Column({type:'varchar'})
   actionby:string
   @Column({type:'varchar'})
   rejectionreason:string
   @Column({type:'date'})
   chequeissuedate:Date
   @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
   status: PaymentStatus;
   @Column({type:'varchar'})
   transfertype: string
   @Column({type:'date'})
   transactiondate:Date
   @Column({type:'varchar'})
   attachment:string
   @Column({type:'integer'})
   amount:number
   @Column()
   pg_service_charge_bdt:string
   @Column()
   amount_original:string
   @Column()
   gateway_fee:string
   @Column()
   pg_service_charge_usd:string
   @Column()
   pg_card_bank_country:string
   @Column()
   card_number:string
   @Column()
   card_holder:string
   @Column()
   status_code:string
   @Column()
   currency_merchant:string
   @Column()
   ip_address:string
   @Column()
   pg_txnid:string
   @Column()
   mer_txnid:string
   @Column()
   store_amount:string
   @Column()
   bank_txn:string
   @Column()
   card_type:string
   @Column()
   pg_card_risklevel:string
   @Column()
   cus_phone:string
   @Column()
   cus_email:string
   @Column()
   PaymentStatus:string
   @CreateDateColumn()
   createdAt:Date
   @UpdateDateColumn()
   updatedAt:Date
}
