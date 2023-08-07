import { IsEmail } from "class-validator";
import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

let userCount = Math.floor(Math.random() *10000)
@Entity()
export class User {
   @PrimaryGeneratedColumn()
   id:number
   @Column({type: "varchar"})
   userID:string
   @BeforeInsert()
   generateUserId() {
    userCount++;
    this.userID = `FFA${userCount}`;
   }
   @Column({type: "varchar"})
   firstName:string
   @Column({type: "varchar"})
   lastName:string
   @IsEmail({}, { message: 'Incorrect email' })
   @Column({type: "varchar"})
   email:string
   @Column({type: "varchar"})
   password:string
   @Column({type: "varchar"})
   walletbalance:number
   @Column({type: "varchar"})
   access_token:string
   @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
   created_At: Date;
   @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
   updated_At: Date;
   @Column()
   ipAddress: string;
   @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
   loginTime: Date;
   @Column()
   browserName: string;
   @Column()
   activeStatus: boolean;
   @Column({ default: 0 })
   loginAttempts: number;
   @Column({ default: false })
   isLocked: boolean;
   @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
   join_At: Date;
   @Column()
   nid:string
}
