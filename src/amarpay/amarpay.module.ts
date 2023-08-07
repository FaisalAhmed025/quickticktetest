import { Module } from '@nestjs/common';
import { AmarpayService } from './amarpay.service';
import { AmarpayController } from './amarpay.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deposit } from 'src/deposit/entities/deposit.entity';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/entities/user.entity';
import { GeneralLedger } from 'src/ledger/entity';

@Module({
  imports:[TypeOrmModule.forFeature([Deposit, User,GeneralLedger]), UserModule],
  controllers: [AmarpayController],
  providers: [AmarpayService]
})
export class AmarpayModule {}
