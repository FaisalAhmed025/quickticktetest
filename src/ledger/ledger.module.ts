import { Module } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { LedgerController } from './ledger.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneralLedger } from './entity';

@Module({
  imports:[TypeOrmModule.forFeature([GeneralLedger])],
  controllers: [LedgerController],
  providers: [LedgerService]
})
export class LedgerModule {}
