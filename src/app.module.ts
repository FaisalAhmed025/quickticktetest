import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { S3Module } from './s3/s3.module';
import { TravellerModule } from './traveller/traveller.module';
import { Traveller } from './traveller/entities/traveller.entity';
import { DepositModule } from './deposit/deposit.module';
import { Deposit } from './deposit/entities/deposit.entity';
import { AmarpayModule } from './amarpay/amarpay.module';
import { SslcommerzModule } from './sslcommerz/sslcommerz.module';
import { LedgerModule } from './ledger/ledger.module';
import { GeneralLedger } from './ledger/entity';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true,}),
    TypeOrmModule.forRoot({
      type: 'mysql',
      username:"flyfarin_qktickets",
      password: "@Kayes70455",
      host: "flyfarint.com",
      database:"flyfarin_qkticktes_b2c",
      // username:'root',
      // password:'',
      // host: '127.0.0.1',
      // database:'quickticketsb2c',
      port:3306,
      entities: [User,Traveller, Deposit,GeneralLedger],
      synchronize:false,
      
    }),
    UserModule,
    S3Module,
    TravellerModule,
    DepositModule,
    AmarpayModule,
    SslcommerzModule,
    LedgerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
