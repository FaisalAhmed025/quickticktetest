import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, Req, HttpStatus, Res } from '@nestjs/common';
import { SslcommerzService } from './sslcommerz.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Deposit, PaymentStatus } from 'src/deposit/entities/deposit.entity';
import { createHash } from 'crypto';
import { UserService } from 'src/user/user.service';
import { Request, Response } from 'express';
import { ApiBody, ApiTags } from '@nestjs/swagger';
const SSLCommerzPayment = require('sslcommerz-lts')


@ApiTags('SSLcommerzPayment')
@Controller('sslcommerz')
export class SslcommerzController {
constructor (@InjectRepository(User) private userrepository: Repository<User>,
@InjectRepository(Deposit) private depositrepository: Repository<Deposit>,
private readonly userservice:UserService){}
generateCustomTransactionId(): string {
  const timestamp = Date.now().toString();
  const randomString = Math.random().toString(36).substr(2, 6); // Generate a random alphanumeric string
  const hash = createHash('sha256').update(`${timestamp}${randomString}`).digest('hex');
  const shortenedHash = hash.substr(0, 16).toUpperCase();
  return shortenedHash;
}


@Post('initiate')
async init(
@Req() req: Request): Promise<{  checkoutpageurl?: string }> {
  const jwttoken = req.headers['authorization'];
  const decodedtoken = await this.userservice.verifyToken(jwttoken)
  const userID =decodedtoken.userID
  const user = await this.userrepository.findOne({where:{userID}})
  if(!user){
    throw new HttpException('user not found', HttpStatus.NOT_FOUND)
  }
  const transactionId = this.generateCustomTransactionId();

  const {amount} =req.body

  const data ={ 
  store_id: 'flyfarintlive',
  store_passwd:'5D19E28E2FBE477822',
  total_amount:amount,
  currency: "BDT",
  tran_id: transactionId,
  tran_date:Date(),
  success_url: `http://localhost:3000/sslcommerz/success/${transactionId}`,
  fail_url:   ` http://localhost:3000/sslcommerz/failure/${transactionId}`,
  cancel_url: `http://localhost:3000/sslcommerz/cancel/${transactionId}`,
  emi_option: 0,
  cus_name: `${user.firstName} "+"${user.lastName}`,
  cus_email: user.email,
  cus_phone: "0123456789",
  cus_add1: "Dhaka",
  cus_city: "Dhaka",
  cus_country: "Bangladesh",
  shipping_method: "NO",
  product_name: "Sample Product",
  product_category: "Sample Category",
  product_profile: "general",
  value_a:user.userID,
}
  try {
 
    const sslcz = new SSLCommerzPayment( process.env.SSL_STORE_ID, process.env.SSL_STORE_PASSWORD, true);
    const apiResponse = await sslcz.init(data);
    console.log(data);
    const gatewayPageURL = apiResponse.GatewayPageURL
    await this.depositrepository.save(data)
    return {checkoutpageurl:gatewayPageURL};
  } catch (error) {
    throw new Error('Failed to initiate payment');
  }
}

@Post('success/:transactionId')
async create(
@Body() data: any,
@Param('transactionId') transactionId: string,
@Req() req: Request,
@Res() res: Response

): Promise<any> {
try {
  const transaction = await this.depositrepository.findOne({where:{transactionId}});
  if (!transaction) {
    return { message: 'Transaction ID not found', error: true };
  }
  transaction.status = PaymentStatus.APPROVED;
  transaction.store_amount = data.store_amount
  transaction.transactiondate = data.tran_date
  transaction.val_id = data.val_id
  transaction.bank_txn = data.bank_tran_id
  await this.depositrepository.save(transaction);
  console.log(transaction);
  
  if(transaction.status === PaymentStatus.APPROVED){
   const message ='payment successfull'
   const status ='success'
   res.redirect(`https://flyfarladies.com/dashboard/profile?message=${encodeURIComponent(message)}&status=${encodeURIComponent(status)}`)
  }

} catch (error) {
  console.error('Error processing payment callback:', error);
  return { message: 'Error processing payment callback', error: true };
}
}

@Post('failure/:transactionId')
async failtransaction(
@Body() data: any,
@Param('transactionId') transactionId: string,
@Req() req: Request
): Promise<any> {
 await this.depositrepository.delete({transactionId});
 return { message: 'Transaction failed'};
}


@Post('cancel/:transactionId')
async CancellTransaction(
@Body() data: any,
@Param('transactionId') transactionId: string,
@Req() req: Request
): Promise<any> {
 await this.depositrepository.delete({transactionId});
 return { message: 'Transaction Cancelled'};
}


@Get('/validate/:val_id')
async validate(@Param('val_id') val_id: string, @Req() req: Request): Promise<any> {
const data={
  val_id: val_id
}
const sslcz = new SSLCommerzPayment(process.env.SSL_STORE_ID, process.env.SSL_STORE_PASSWORD,true);
const validationData = await sslcz.validate(data);
return validationData;
}


@Post('/initiate-refund')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      refund_amount: { type: 'number' },
      bank_tran_id: { type: 'string' },
      refund_remarks: { type: 'string' },
      refe_id: { type: 'string' },
    },
    required: ['refund_amount', 'bank_tran_id'],
  },
})

async initiateRefund(
  @Body('refund_amount') refund_amount: number,
  @Body('refund_remarks') refund_remarks: string,
  @Body('bank_tran_id') bank_tran_id: string,
  @Body('refe_id') refe_id: string,) {
  const data = {
    refund_amount:refund_amount,
    refund_remarks:refund_remarks,
    bank_tran_id:bank_tran_id,
    refe_id:refe_id,
};
  const sslcz = new SSLCommerzPayment( process.env.SSL_STORE_ID, process.env.SSL_STORE_PASSWORD, true);
  try {
    const response = await sslcz.initiateRefund(data);

    // Process the response received from SSLCommerz
    // Refer to the documentation for available response fields:
    // https://developer.sslcommerz.com/doc/v4/#initiate-the-refund

    return response;
  } catch (error) {
    // Handle any errors that occur during the refund initiation
    console.error(error);
    throw new HttpException('Error initiating refund', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}



@Get('/refund-query/:refund_ref_id')
async refundQuery(@Param('refund_ref_id') refund_ref_id: string) {
  const data = {
    refund_ref_id: refund_ref_id,
  };
  const sslcz = new SSLCommerzPayment( process.env.SSL_STORE_ID,  process.env.SSL_STORE_PASSWORD, true);
  try {
    const response = await sslcz.refundQuery(data);
    // Process the response received from SSLCommerz
    // Refer to the documentation for available response fields:
    // https://developer.sslcommerz.com/doc/v4/#initiate-the-refund
    return response;
  } catch (error) {
    // Handle any errors that occur during the refund query
    console.error(error);
    throw new HttpException('Error querying refund', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

@Get('/transaction-id/:trans_id')
async transactionQueryByTransactionId(@Param('trans_id') trans_id: string) {
  const data = {
    tran_id: trans_id,
  };
  const sslcz = new SSLCommerzPayment( process.env.SSL_STORE_ID,  process.env.SSL_STORE_PASSWORD, true);
  try {
    const response = await sslcz.transactionQueryByTransactionId(data);
    // Process the response received from SSLCommerz
    // Refer to the documentation for available response fields:
    // https://developer.sslcommerz.com/doc/v4/#by-session-id
    return response;
  } catch (error) {
    // Handle any errors that occur during the transaction query
    console.error(error);
    throw new HttpException('Error querying transaction', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

@Get('/session-id/:sessionkey')
async transactionQueryBySessionId(@Param('sessionkey') sessionkey: string) {
  const data = {
    sessionkey: sessionkey,
  };
  const sslcz = new SSLCommerzPayment( process.env.SSL_STORE_ID, process.env.SSL_STORE_PASSWORD, false);
    const response = await sslcz.transactionQueryBySessionId(data);
    return response;
  } catch (error) {
    // Handle any errors that occur during the transaction query
    console.error(error);
    throw new HttpException('Error querying transaction', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  
}
