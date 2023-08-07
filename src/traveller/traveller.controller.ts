import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, Req, Res, HttpException, HttpStatus } from '@nestjs/common';
import { TravellerService } from './traveller.service';
import { CreateTravellerDto } from './dto/create-traveller.dto';
import { UpdateTravellerDto } from './dto/update-traveller.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Traveller } from './entities/traveller.entity';
import { GCSStorageService } from 'src/s3/s3.service';
import { UserService } from 'src/user/user.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';


@ApiTags('traveller Module')
@Controller('traveller')
export class TravellerController {
  constructor(
  @InjectRepository(User) private userpository: Repository<User>,
  @InjectRepository(Traveller) private travllerRepository:Repository<Traveller>,
  private readonly travellerService: TravellerService,
  private s3service: GCSStorageService,
  private readonly userService: UserService,
  ) {}

@ApiBearerAuth()
@Post('add')
@UseInterceptors(FileFieldsInterceptor([
  { name: 'passportSizePhoto', maxCount: 2 },
  { name: 'visaCopy', maxCount: 2 }
]))
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      nameTitle: { type: 'string'},
      firstName: { type: 'string'},
      lastName: { type: 'string'},
      gender: { type: 'string'},
      DOB: { type: 'date' },
      relation: { type: 'string'},
      phone: { type: 'string'},
      email: { type: 'string'},
      nationality:{type:'string'},
      passportExpireDate:{type:'date'},
      passportSizePhoto: { type: 'string', format:'binary'},
      visaCopy: { type: 'string', format:'binary'},
    }
  },
})


//add traveller
async createtraveller(
@UploadedFiles()
file: {
  passportSizePhoto?: Express.Multer.File[],
  visaCopy?: Express.Multer.File[]
},
@Req() req: Request,
@Res() res: Response,
@Body() createTravellerDto: CreateTravellerDto) {
  const token = req.headers['authorization']
  const decodedToken = await this.userService.verifyToken(token)
  const userID = decodedToken.userID;
  const user = await this.userpository.findOne({where:{userID:userID}})
  if (!user) {
    throw new HttpException('user not found', HttpStatus.NOT_FOUND)
  }
  createTravellerDto.userID =userID
  let passportSizePhoto;
  if (file.passportSizePhoto && file.passportSizePhoto.length > 0) {
    passportSizePhoto = await this.s3service.Addimage(file.passportSizePhoto[0]);
    createTravellerDto.passportSizePhoto =passportSizePhoto;
  }
  let visaCopy;
  if (file.visaCopy && file.visaCopy.length > 0) {
    visaCopy = await this.s3service.Addimage(file.visaCopy[0]);
    createTravellerDto.visaCopy =visaCopy;
  }

  await this.travellerService.addtraveller(createTravellerDto);
  return res
  .status(HttpStatus.CREATED)
  .json({ status: 'success', message: 'traveller addd successful'});
}
 
//my traveller list


@ApiBearerAuth()
@Get('/user/travellerlist')
async findAll(
  @Req() req:Request
) {
  const token = req.headers['authorization']
  const decodedToken = await this.userService.verifyToken(token)
  const userID = decodedToken.userID;
  const user = await this.userpository.findOne({ where:{userID}});
  if (!user) {
    throw new HttpException('user not found', HttpStatus.NOT_FOUND)
  }
  const alltraveller = await this.travllerRepository.find({where:{userID}, order:{createdAt:'DESC'}})
  if (!alltraveller) {
    throw new HttpException('tarveller not found', HttpStatus.NOT_FOUND)
  }
  return alltraveller;
}

@Get(':travellerID')
findOne(@Param('travellerID') travellerID: string) {
  return this.travellerService.findOne(travellerID);
}

@Get('all/traveller')
async alltraveller() {
  return await this.travellerService.findAll();
}


@ApiBearerAuth()
@Patch('update')
@UseInterceptors(FileFieldsInterceptor([
{ name: 'passportSizePhoto', maxCount: 2 },
{ name: 'visaCopy', maxCount: 2 }
]))
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      nameTitle: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      gender: { type: 'string',},
      DOB: { type: 'date' },
      relation: { type: 'string'},
      phone: { type: 'string'},
      email: { type: 'string'},
      nationality:{type:'string'},
      passportExpireDate:{type:'date'},
      passportSizePhoto: { type: 'string', format:'binary'},
      visaCopy: { type: 'string', format:'binary'},
    }
  },
})
async updateTraveller(
@UploadedFiles()
file: {
  passportSizePhoto?: Express.Multer.File[],
  visaCopy?: Express.Multer.File[]
},
@Body('travellerID') travellerID: string,
@Req() req: Request,
@Res() res: Response,
@Body() updateTravellerDto: UpdateTravellerDto
) {
const token = req.headers['authorization']
const decodedToken = await this.userService.verifyToken(token)
const userID = decodedToken.userID;
const user = await this.userpository.findOne({ where:{userID}});
if (!user) {
  throw new HttpException('user not found', HttpStatus.NOT_FOUND)
}
const traveller = await this.travellerService.findOne(travellerID);
if (!traveller) {
  throw new HttpException('Traveller not found', HttpStatus.NOT_FOUND);
}

let passportSizePhoto;
if (file.passportSizePhoto && file.passportSizePhoto.length > 0) {
  passportSizePhoto = await this.s3service.Addimage(file.passportSizePhoto[0]);
  traveller.passportSizePhoto = passportSizePhoto;
}

let visaCopy;
if (file.visaCopy && file.visaCopy.length > 0) {
  visaCopy = await this.s3service.Addimage(file.visaCopy[0]);
  traveller.visaCopy = visaCopy;
}


// Update other properties if provided
if (updateTravellerDto.NameTitle !== undefined) {
  traveller.nameTitle = updateTravellerDto.NameTitle;
}

if (updateTravellerDto.firstName !== undefined) {
  traveller.firstName = updateTravellerDto.firstName;
}

if (updateTravellerDto.gender !== undefined) {
  traveller.gender = updateTravellerDto.gender;
}

if (updateTravellerDto.lastName !== undefined) {
  traveller.lastName = updateTravellerDto.lastName;
}

if (updateTravellerDto.DOB !== undefined) {
  traveller.DOB = updateTravellerDto.DOB;
}

if (updateTravellerDto.phone !== undefined) {
  traveller.phone = updateTravellerDto.phone;
}

if (updateTravellerDto.email !== undefined) {
  traveller.email = updateTravellerDto.email;
}

if (updateTravellerDto.nationality !== undefined) {
  traveller.nationality = updateTravellerDto.nationality;
}

if (updateTravellerDto.passportExpireDate !== undefined) {
  traveller.passportExpireDate = updateTravellerDto.passportExpireDate;
}
await this.travllerRepository.save(traveller);
return res.status(HttpStatus.OK).json({
  status: 'success',
  message: 'Traveller updated successfully',
});
}

@ApiBearerAuth()
@Delete(':travellerID')
async deletetraveller( 
@Res() res: Response,
@Req() req: Request,
@Param('travellerID') travellerID: string,) {
  const token = req.headers['authorization']
  await this.userService.verifyToken(token)
  await this.travellerService.remove(travellerID)
  return res.status(HttpStatus.OK).json({
    status: 'success',
    message: 'Traveller has deleted successfully',
  });
}

}
