import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

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
      entities: [],
      synchronize:false,
      
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
