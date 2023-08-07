import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTravellerDto } from './dto/create-traveller.dto';
import { UpdateTravellerDto } from './dto/update-traveller.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Traveller } from './entities/traveller.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TravellerService {
  constructor(@InjectRepository(Traveller) private travllerRepository:Repository<Traveller>){}

  async addtraveller(createTravellerDto: CreateTravellerDto) {
    const travller = await this.travllerRepository.create(createTravellerDto)
    await this.travllerRepository.save(travller)
  }

 async findAll() {
    return  await this.travllerRepository.find({order:{createdAt:'DESC'}});
  }

 async findOne(travellerID: string) {
    return await this.travllerRepository.findOne({where:{travellerID}})
  }

async  updatetraveller(travellerid: string, updateTravellerDto: UpdateTravellerDto) {
    return await this.travllerRepository.update(travellerid, updateTravellerDto)
  }

 async remove(travellerID: string) {
  const deletetravller = await this.travllerRepository.findOne({where:{travellerID}})
  if (!deletetravller){
    throw new HttpException('traveller not found', HttpStatus.BAD_REQUEST)
  }
  await this.travllerRepository.delete({travellerID}); 
}
}

