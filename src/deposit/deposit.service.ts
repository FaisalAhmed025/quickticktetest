import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { UpdateDepositDto } from './dto/update-deposit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Deposit } from './entities/deposit.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DepositService {
  constructor(@InjectRepository(Deposit) private depositrepository: Repository<Deposit>){}
  
  async createdepositrequest(createDepositrequestDto: CreateDepositDto) {
    const deposit = await this.depositrepository.create(createDepositrequestDto)
    await this.depositrepository.save(deposit)
   }
 
  async findAll() {
     return await this.depositrepository.find({order:{createdAt:'DESC'}});
   }
   
  async getdepositId(depositid: string) {
     const deposited = await this.depositrepository.findOne({where:{depositid}});
     if(!deposited){
       throw new HttpException('depositid not found', HttpStatus.NOT_FOUND)
     }
     return deposited;
   }
}
