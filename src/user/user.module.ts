

import { S3Module } from './../s3/s3.module';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';



@Module({
  imports:[TypeOrmModule.forFeature([User]), S3Module,
  JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions:{expiresIn:'1d'},
  }),
],
  controllers: [UserController],
  providers: [UserService],
  exports:[UserService]
})
export class UserModule {}
