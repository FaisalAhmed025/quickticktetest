import { Module } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { DepositController } from './deposit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deposit } from './entities/deposit.entity';
import { UserModule } from 'src/user/user.module';
import { S3Module } from 'src/s3/s3.module';
import { User } from 'src/user/entities/user.entity';
import { GeneralLedger } from 'src/ledger/entity';

@Module({
  imports:[TypeOrmModule.forFeature([Deposit,User, GeneralLedger]), UserModule, S3Module],
  controllers: [DepositController],
  providers: [DepositService]
})
export class DepositModule {}
