import { Controller, Get, Post, Body, Patch, Param, Delete,  HttpException, HttpStatus, UseInterceptors, UploadedFiles, Req, Res, NotFoundException } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { Deposit, PaymentStatus } from './entities/deposit.entity';
import { Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { User } from 'src/user/entities/user.entity';
import { GCSStorageService } from 'src/s3/s3.service';
import { UserService } from 'src/user/user.service';
import { createHash } from 'crypto';
import { ApiBearerAuth,ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { GeneralLedger } from 'src/ledger/entity';

@ApiTags('deposit')
@Controller('deposit')
export class DepositController {
  constructor(
    @InjectRepository(User) private userrepository: Repository<User>,
    @InjectRepository(Deposit) private depositrepository: Repository<Deposit>,
    @InjectRepository(GeneralLedger) private GeneralLedgerpository: Repository<GeneralLedger>,
    private readonly depositservice: DepositService,
    private s3service: GCSStorageService,
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
  @Post('create')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'attachment', maxCount: 2 }
  ]))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        depositmethod: { type: 'string' },
        sender: { type: 'string' },
        reciever: { type: 'string',},
        bankname: { type: 'string' },
        paymentgateway: { type: 'string' },
        transactionid: { type: 'string' },
        depositname: { type: 'string'},
        chequenumber: { type: 'string'},
        depositby: { type: 'string'},
        actionby: { type: 'string'},
        rejectionreason: { type: 'string'},
        chequeissuedate: { type: 'string'},
        transfertype:{type:'string'},
        transactiondate:{type:'date'},
        amount:{type:'number'},
        attachment: { type: 'string', format:'binary'},
      }
    },
  })
  async RequestDeposit(
    @UploadedFiles()
    file: {
      attachment?: Express.Multer.File[]
    },

    @Req() req: Request,
    @Res() res: Response,
    @Body() depositrequestdto:CreateDepositDto
) {
  const jwttoken = req.headers['authorization'];
  const decodedtoken = await this.userService.verifyToken(jwttoken)
  const userID = decodedtoken.userID
  const user = await this.userrepository.findOne({where:{userID}})
  if(!user){
    throw new HttpException('user not found', HttpStatus.NOT_FOUND)
  }
  let attachment;
  if (file.attachment && file.attachment.length > 0) {
    attachment = await this.s3service.Addimage(file.attachment[0]);
    depositrequestdto.attachment =attachment;
  }
  depositrequestdto.userID =userID;
  await this.depositservice.createdepositrequest(depositrequestdto);
  return res
    .status(HttpStatus.CREATED)
    .json({ status: 'success', message: 'deposit request successful'});
}


@Patch('approve/:depositid')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      actionby: { type: 'string' },
      userID: { type: 'string' },
    },
  },
})
async ApprovedDeposit(
  @Param('depositid') depositid: string,
  @Body('userID') userID:string,
  @Req() req: Request,
  @Res() res: Response,
) {
  const user = await this.userrepository.findOne({where:{userID}})
  if(!user){
    throw new HttpException('user not found', HttpStatus.NOT_FOUND)
  }
  const deposit = await this.depositrepository.findOne({where:{depositid}})
  if(!deposit){
    throw new HttpException('deposit not found', HttpStatus.NOT_FOUND)
  }
if(deposit.status !=PaymentStatus.PENDING){
  throw new HttpException('Deposit request already approved or rejected', HttpStatus.BAD_REQUEST)
}
deposit.status =PaymentStatus.APPROVED
await this.depositrepository.save(deposit)
// await this.GeneralLedgerpository.save(deposit)
await this.userrepository.save(user)
// await this.GeneralLedgerpository.save(agent)
return res
  .status(HttpStatus.CREATED)
  .json({ status: 'success', message: 'amount approved'});
}


@Patch('reject/:depositid')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      actionby: { type: 'string' },
      rejectionreason: { type: 'string' },
    },
  },
})

async RejectDeposit(
  @Param('depositid') depositid: string,
  @Body('userID') userID:string,
  @Body() body: { rejectionreason: string; actionby: string },
  @Req() req: Request,
  @Res() res: Response,
) {

const deposit = await this.depositrepository.findOne({where:{depositid}})
if(!deposit){
  throw new HttpException('deposit not found', HttpStatus.NOT_FOUND)
}

const user = await this.userrepository.findOne({where:{userID}})
if(!user){
  throw new HttpException('user not found', HttpStatus.NOT_FOUND)
}

deposit.status =PaymentStatus.REJECTED
deposit.actionby = `Action by ${body.actionby}`;
    if (!body.actionby) {
      throw new NotFoundException('Action by??');
    }
    deposit.rejectionreason = `Rejected due to ${body.rejectionreason}`;
    if (!body.rejectionreason) {
      throw new NotFoundException('please add reason');
    }
await this.depositrepository.save(deposit)
return res
  .status(HttpStatus.CREATED)
  .json({ status: 'success', message: 'amount rejected'});
}

  @Get('all')
  findAll() {
    return this.depositservice.findAll();
  }

  @Get(':depositid')
 async findOne(@Param('depositid') depositid: string) {
    return  await this.depositservice.getdepositId(depositid)
  }


  }


