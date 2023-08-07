import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

let userCount = Math.floor(Math.random() *10000)
@Entity()
export class Traveller {
   @PrimaryGeneratedColumn()
   id: string;
   @Column()
   travellerID:string
   @BeforeInsert()
   generateUserId() {
    userCount++;
    this.travellerID = `FFT${userCount}`;
   }
   @Column()
   userID:string
   @Column()
   nameTitle:string
   @Column()
   firstName:string
   @Column()
   lastName:string
   @Column()
   gender:string
   @Column({type: "date"})
   DOB:Date
   @Column()
   nationality:string
   @Column()
   relation:string
   @Column()
   passportSizePhoto:string
   @Column()
   visaCopy:string
   @Column()
   email:string
   @Column({type:'date'})
   passportExpireDate:Date
   @Column()
   phone:string
   @CreateDateColumn()
   createdAt:Date
   @UpdateDateColumn()
   updatedAt:Date

}
