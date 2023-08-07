
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { S3Controller } from './s3.controller';
import { GCSStorageService } from './s3.service';


@Module({
  imports: [
  TypeOrmModule.forFeature([])],
  controllers: [S3Controller],
  providers: [GCSStorageService],
  exports:[GCSStorageService]
})
export class S3Module {}
