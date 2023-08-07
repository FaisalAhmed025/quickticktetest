import { Controller, Post, Param, HttpException, HttpStatus, Req, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Deposit, PaymentStatus } from 'src/deposit/entities/deposit.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { createHash } from 'crypto';
import axios from 'axios';
import { UserService } from 'src/user/user.service';
import { Request, Response } from 'express';
import { GeneralLedger } from 'src/ledger/entity';

@ApiTags('amarpay')
@Controller('amarpay')
export class AmarpayController {
  constructor(
    @InjectRepository(User) private userrepository: Repository<User>,
    @InjectRepository(Deposit) private depositrepository: Repository<Deposit>,
    @InjectRepository(GeneralLedger) private GeneralLedgerpository: Repository<GeneralLedger>,
    private readonly userService: UserService
    ) {}
    
  generateCustomTransactionId(): string {
    const timestamp = Date.now().toString();
    const randomString = Math.random().toString(36).substr(2, 6); // Generate a random alphanumeric string
    const hash = createHash('sha256').update(`AP${timestamp}${randomString}`).digest('hex');
    const shortenedHash = hash.substr(0, 16).toUpperCase();
    return shortenedHash;
  }



  @ApiBearerAuth()
  @Post('payment')
  async postPayment(@Req() req: Request, @Res() res: Response) {
    const jwttoken = req.headers['authorization'];
    const decodedtoken = await this.userService.verifyToken(jwttoken)
    const userID =decodedtoken.userID
    const user = await this.userrepository.findOne({where:{userID}})
    if(!user){
      throw new HttpException('user not found', HttpStatus.NOT_FOUND)
    }

    const {
      cus_name,
      cus_email,
      cus_phone,
      amount,
      desc,
      currency,
      cus_add1,
      cus_add2,
      cus_city,
      cus_country,
      tran_id,
      paymentgatway,
    } = req.body;
    const transactionId = tran_id || this.generateCustomTransactionId();
    const requestBody = {
      cus_name: cus_name || '',
      cus_email: cus_email || '',
      cus_phone: cus_phone || '',
      amount: amount || 100,
      tran_id: transactionId,
      signature_key: 'dbb74894e82415a2f7ff0ec3a97e4183',
      store_id: 'aamarpaytest',
      currency: currency || 'BDT',
      desc: desc || '',
      cus_add1: cus_add1 || '53, Gausul Azam Road, Sector-14, Dhaka, Bangladesh',
      cus_add2: cus_add2 || 'Dhaka',
      cus_city: cus_city || 'Dhaka',
      paymentgatway: paymentgatway || '',
      cus_country: cus_country || 'Bangladesh',
      success_url: `http://localhost:3000/amarpay/callback/${transactionId}`,
      fail_url: 'http://localhost:3000/fail',
      cancel_url: 'http://localhost:3000/cancel',
      type: 'json',
    };
  const url ='https://sandbox.aamarpay.com/jsonpost.php'
  try {
    const { data } = await axios.post(url,requestBody);
    if (data.result !== 'true') {
      let errorMessage = '';
      for (let key in data) {
        errorMessage += data[key] + '. ';
      }
    }
    return res.status(201).send(data);
    //  res.status(301).redirect(data.payment_url);
  } catch (error) {
    console.error(error);
    return res.render('error', {
      title: 'Error',
      errorMessage: 'An error occurred during payment processing.',
    });
  }
  }
  
@Post('callback/:transactionId')
 async  Confirmtransaction(
    @Param('transactionId') transactionId: string,
    @Req() req:Request, @Res() res:Response) {
    const {
      pg_service_charge_bdt,
      amount_original,
      gateway_fee,
      pg_service_charge_usd,
      pg_card_bank_name,
      pg_card_bank_country,
      card_number,
      card_holder,
      status_code,
      currency_merchant,
      ip_address,
      pg_txnid,
      mer_txnid,
      store_amount,
      pay_status,
      bank_txn,
      card_type,
      pg_card_risklevel,
      cus_name,
      cus_phone,
      cus_email,
      currency,
      pay_time,
      amount,
    } = req.body;
    const deposit = new Deposit()
    deposit.amount=req.body.amount
    deposit .depositname =cus_name
    deposit.transactionId =transactionId
    deposit.amount =amount
    deposit.transactiondate =pay_time
    deposit.pg_service_charge_bdt =pg_service_charge_bdt
    deposit.amount_original =amount_original
    deposit.gateway_fee =gateway_fee
    deposit.pg_service_charge_usd =pg_service_charge_usd
    deposit.bankname =pg_card_bank_name
    deposit.pg_card_bank_country =pg_card_bank_country
    deposit.card_number =card_number
    deposit.card_holder= card_holder
    deposit.status_code =status_code
    deposit.currency_merchant =currency_merchant
    deposit.ip_address =ip_address
    deposit.pg_txnid =pg_txnid
    deposit.mer_txnid =mer_txnid
    deposit.store_amount =store_amount
    deposit.bank_txn =bank_txn
    deposit.card_type =card_type
    deposit.pg_card_risklevel =pg_card_risklevel
    deposit.PaymentStatus = pay_status
    deposit.depositby =cus_name
    deposit.cus_phone =cus_phone
    deposit.cus_email =cus_email
    deposit.status=PaymentStatus.APPROVED
    await  this.depositrepository.save(deposit)
    await this.GeneralLedgerpository.save(deposit)
    const status = "success";
    const message = "payment successfull"
    return res.redirect(`https://www.flyfartrips.com/?message=${encodeURIComponent(message)}&status=${encodeURIComponent(status)}`)
  }

}
