import { Module } from '@nestjs/common';
import { SslcommerzService } from './sslcommerz.service';
import { SslcommerzController } from './sslcommerz.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deposit } from 'src/deposit/entities/deposit.entity';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Deposit,User]), UserModule],
  controllers: [SslcommerzController],
  providers: [SslcommerzService]
})
export class SslcommerzModule {}
