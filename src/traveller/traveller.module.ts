import { Module } from '@nestjs/common';
import { TravellerService } from './traveller.service';
import { TravellerController } from './traveller.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Traveller } from './entities/traveller.entity';
import { S3Module } from 'src/s3/s3.module';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Traveller, User]), S3Module, UserModule],
  controllers: [TravellerController],
  providers: [TravellerService]
})
export class TravellerModule {}
