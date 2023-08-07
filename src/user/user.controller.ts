import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, UseInterceptors, UploadedFiles, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { GCSStorageService } from 'src/s3/s3.service';
import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@ApiTags('authmodule')
@Controller('user')
export class UserController {
  constructor(@InjectRepository(User) private  userrepository: Repository<User>,
    private readonly userService: UserService,
    private readonly s3service: GCSStorageService,
    ) {}
    
  @Post('registration')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'nid', maxCount: 2 }
  ]))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
        nid: { type: 'string', format:'binary' },
      }
    },
  })
  async Register(
    @UploadedFiles()
    file: {
      tinFile?: Express.Multer.File[]
    },
  @Req() req: Request,
  @Res() res: Response,
  @Body() authdto:CreateUserDto
) {
  const ExistUser = await this.userService.getUserByEmail(authdto.email);
  if (ExistUser) {
    throw new HttpException(
      'User Already Exist,please try again with another email',
      HttpStatus.BAD_REQUEST,
    );
  }
  let tinFile;
  if (file.tinFile && file.tinFile.length > 0) {
    tinFile = await this.s3service.Addimage(file.tinFile[0]);
    authdto.nid =tinFile;
  }
  await this.userService.Register(authdto);
  return res
    .status(HttpStatus.CREATED)
    .json({ status: 'success', message: 'user registration successful'});
}

@Post('login')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
    },
  },
})

async login(
  @Body('email') email: string,
  @Body('password') password: string,
  @Req() req: Request,
  @Res() res: Response,
) {
  const token = await this.userService.login(email, password);
  return res.status(HttpStatus.CREATED).json({
    status: 'success',
    message: 'login successfull',
    access_token: token
  });
}

@ApiBearerAuth()
@Get('dashboard')
async dashboard(@Req() req: Request) {
  const jwt_token  = req.headers['authorization']
  const decoded_token = await this.userService.verifyToken(jwt_token);
  const userID = decoded_token.userID
  const user = await this.userrepository.findOne({where:{userID}})
  const userResponse = {
    userID: user.userID,
    firstName:user.firstName,
    lastName:user.lastName,
    walletbalance:user.walletbalance,
    activeStatus:user.activeStatus,
    email: user.email,
    password:user.password
  };
  return userResponse;

}

@Get('all')
async allagent(){
  const users = await this.userrepository.find({order:{created_At:'DESC'}});
  return users;
}

@ApiBearerAuth()
@Patch('update')
@UseInterceptors(FileFieldsInterceptor([
  { name: 'nid', maxCount: 2 },
]))
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      email: { type: 'string' },
      password: { type: 'string' },
      nid: { type: 'string', format:'binary'},
     
    }
  },
})
async updateagent(
  @UploadedFiles()
  file: {
    nid?: Express.Multer.File[],

  },
@Req() req: Request,
@Res() res: Response,
@Body() updateuserDTO:UpdateUserDto
) {
const jwt_Token = req.headers['authorization'];
const decodedtoken =  await this.userService.verifyToken(jwt_Token)
const userID =decodedtoken.userID
const user = await this.userrepository.findOne({where:{userID}})
if (!user) {
  throw new HttpException('user not found', HttpStatus.NOT_FOUND)
}

let nid;
if (file.nid && file.nid.length > 0) {
  nid = await this.s3service.Addimage(file.nid[0]);
  user.nid =nid;
}

if (updateuserDTO.firstName !== undefined) {
  user.firstName = updateuserDTO.firstName;
}
if (updateuserDTO.lastName !== undefined) {
  user.lastName = updateuserDTO.lastName;
}

if (updateuserDTO.email !== undefined) {
  user.email = updateuserDTO.email;
}

if (updateuserDTO.password !== undefined) {
  user.password = await bcrypt.hash(updateuserDTO.password,10)
}
await this.userrepository.save(user)
return res
  .status(HttpStatus.CREATED)
  .json({ status: 'success', message: 'user update successful'});
}

@ApiBearerAuth()
@Delete('delete')
async deleteuser(@Req()  req:Request, @Res() res:Response,){
  const jwt_Token = req.headers['authorization'];
  const decodedtoken =  await this.userService.verifyToken(jwt_Token)
  const userID =decodedtoken.userID
  const user = await this.userrepository.findOne({where:{userID}})
  if (!user) {
    throw new HttpException('user not found', HttpStatus.NOT_FOUND)
  }
   await this.userrepository.delete({userID})
   return res
  .status(HttpStatus.OK)
  .json({ status: 'success', message: 'user has deleted'});
}


}
