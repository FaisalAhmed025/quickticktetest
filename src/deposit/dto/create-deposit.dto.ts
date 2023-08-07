export class CreateDepositDto {
   userID: string;
   depositmethod:string
   sender:string
   reciever:string
   bankname:string
   paymentgateway:string
   transactionid:string
   depositname:string
   chequenumber:string
   depositby:string
   actionby:string
   rejectionreason:string
   chequeissuedate:Date
   transfertype: string
   transactiondate:Date
   attachment:string
   amount:number
}
