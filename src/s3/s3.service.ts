require('dotenv').config();
import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Repository } from 'typeorm';
import * as sharp from 'sharp';
import { Storage } from '@google-cloud/storage';
import path from 'path';

@Injectable()
export class GCSStorageService  {
    constructor(
        private ConfigService: ConfigService) {}

        async Addimage(file: Express.Multer.File) {
            const serviceAccountKeyFile = 's3config.json';
            process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountKeyFile;
            const storage = new Storage({ keyFilename: serviceAccountKeyFile });
            const bucketName = 'cdnquickticktesb2c'; // Replace with your actual bucket name
            const bucket = storage.bucket(bucketName);
            const fileName = `${file.originalname}.webp`;
            const modifiedName = fileName.replace(/\s+/g, '_');
            const fileObject = bucket.file(modifiedName);
            try {
              const imageBuffer = await sharp(file.buffer).webp().toBuffer();
              await fileObject.save(imageBuffer, {
                contentType: 'image/webp',
                public: true,
                validation: 'md5',
              });
          
              const fileUrl = `https://storage.googleapis.com/${bucketName}/${modifiedName}`;
              console.log(`File uploaded successfully to ${fileUrl}`);
              return fileUrl;
            } catch (err) {
              console.error('Error uploading file to Google Cloud Storage:', err);
              throw err;
            }
          }
    

    // // update cover image 


    // }
    
    // // // update cover image 
    //  async updateImageuserphotos(uuid: string, file:Express.Multer.File) {
    //     if (!file) {
    //         throw new BadRequestException('File not provided');
    //       }
    //     const user = await this.UserRepository.findOneBy({uuid})
    //     if (!user) {
    //       throw new BadRequestException('user not found');
    //     }

    //   const serviceAccountKeyFile = 's3config.json';
    //   process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountKeyFile;
    //   const storage = new Storage({ keyFilename: serviceAccountKeyFile });
    //   const bucketName = 'cdnflyfarladies'; // Replace with your actual bucket name
    //   const bucket = storage.bucket(bucketName);
    //   const fileName = `${file.originalname}.webp`;
    //   const fileObject = bucket.file(fileName);
    //   try {
    //     const imageBuffer = await sharp(file.buffer).webp().toBuffer();
    //     await fileObject.save(imageBuffer, {
    //       contentType: 'image/webp',
    //       public: true,
    //       validation: 'md5',
    //     });
    //     const imageUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    //     console.log(`File uploaded successfully to ${imageUrl}`);
    //     return imageUrl;
    //   } catch (err) {
    //     console.error('Error uploading file to Google Cloud Storage:', err);
    //     throw err;
    //   }

    // }

   


    //   // update cover image 
    //   async updatetestumonialIMages(testid: string, file:Express.Multer.File) {
    //     const imageBuffer = await sharp(file.buffer).webp().toBuffer();
    //     if (!file) {
    //         throw new BadRequestException('File not provided');
    //       }
    //     const blog = await this.TestimonialRepository.findOneBy({testid})
    //     const bucket = this.ConfigService.get<string>('DO_BUCKET_NAME')
    //     if (blog.testimonialimages || blog.ClientImage) {
    //         const testimonialimages = blog.testimonialimages[0].split('/').pop();
    //         const ClientImage =blog.ClientImage.split('/').pop();
    //         await this.s3.send(new DeleteObjectCommand({
    //             Bucket: bucket,
    //             Key: testimonialimages||ClientImage
    //         }))
    //     }
    //     const key =`${testid}/${file.originalname}.webp`
       
    //     try {
    //         const response: PutObjectCommandOutput = await this.s3.send(
    //             new PutObjectCommand({
    //                 Body: imageBuffer,
    //                 Bucket: bucket,
    //                 Key: key,
    //                 ACL: 'public-read',
    //                 ContentType: 'image/webp'
    //             }),
    //         );
    //         if (response.$metadata.httpStatusCode === 200) {
    //             return `https://${bucket}.${this.region}.cdn.digitaloceanspaces.com/${key}`

    //         }
    //         throw new Error("image not update in digital ocean s3")
    //     }
    //     catch (err) {
    //         this.logger.error("cannot save file inside s3 spacebucket", err);
    //         throw err;
    //     }

    // }



  //   async updateAlbumImage(Id: string, AlbumId: number, file: Express.Multer.File) {
  //       const tourpackage = await this.TourpackageRepo.findOneBy({ Id })
  //       if (!tourpackage) {
  //           throw new HttpException(
  //               `TourPackage not found with this id=${Id}`,
  //               HttpStatus.BAD_REQUEST,
  //           );
  //       }
  //       const albummage = await this.AlbumimageRepo.findOneBy({ AlbumId })
  //       if (!albummage) {
  //           throw new HttpException(
  //               `albummage not found with this id=${AlbumId}`,
  //               HttpStatus.BAD_REQUEST,
  //           );
  //       }
  //       const serviceAccountKeyFile = 's3config.json';
  //       process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountKeyFile;
  //       const storage = new Storage({ keyFilename: serviceAccountKeyFile });
  //       const bucketName = 'cdnflyfarladies'; // Replace with your actual bucket name
  //       const bucket = storage.bucket(bucketName);
  //       const fileName = `${file.originalname}.webp`;
  //       const fileObject = bucket.file(fileName);
  //       try {
  //         const imageBuffer = await sharp(file.buffer).webp().toBuffer();
  //         await fileObject.save(imageBuffer, {
  //           contentType: 'image/webp',
  //           public: true,
  //           validation: 'md5',
  //         });
  //         const imageUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
  //         console.log(`File uploaded successfully to ${imageUrl}`);
  //         return imageUrl;
  //       } catch (err) {
  //         console.error('Error uploading file to Google Cloud Storage:', err);
  //         throw err;
  //       }
      

  //  }

  //   async updateMainImage(Id: string, mainimgId: number, file: Express.Multer.File) {
  //       const imageBuffer = await sharp(file.buffer).webp().toBuffer();
  //       const tourpackage = await this.TourpackageRepo.findOneBy({ Id })
  //       if (!tourpackage) {
  //           throw new HttpException(
  //               `TourPackage not found with this id=${Id}`,
  //               HttpStatus.BAD_REQUEST,
  //           );
  //       }
  //       const mainImage = await this.MainImageeRepo.findOneBy({ mainimgId })
  //       if (!mainImage) {
  //           throw new HttpException(
  //               `mainImage not found with this id=${mainimgId}`,
  //               HttpStatus.BAD_REQUEST,
  //           );
  //       }
  //       const serviceAccountKeyFile = 's3config.json';
  //       process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountKeyFile;
  //       const storage = new Storage({ keyFilename: serviceAccountKeyFile });
  //       const bucketName = 'cdnflyfarladies'; // Replace with your actual bucket name
  //       const bucket = storage.bucket(bucketName);
  //       const fileName = `${file.originalname}.webp`;
  //       const fileObject = bucket.file(fileName);
  //       try {
  //         const imageBuffer = await sharp(file.buffer).webp().toBuffer();
  //         await fileObject.save(imageBuffer, {
  //           contentType: 'image/webp',
  //           public: true,
  //           validation: 'md5',
  //         });
  //         const imageUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
  //         console.log(`File uploaded successfully to ${imageUrl}`);
  //         return imageUrl;
  //       } catch (err) {
  //         console.error('Error uploading file to Google Cloud Storage:', err);
  //         throw err;
  //       }


  // }

    // async updatevisitedImage(Id: string, VimageId: number, file: Express.Multer.File) {
    //     const imageBuffer = await sharp(file.buffer).webp().toBuffer();
    //     const tourpackage = await this.TourpackageRepo.findOneBy({ Id })
    //     if (!tourpackage) {
    //         throw new HttpException(
    //             `TourPackage not found with this id=${Id}`,
    //             HttpStatus.BAD_REQUEST,
    //         );
    //     }
    //     const VisitedImage = await this.VisitedPlaceRepo.findOneBy({ VimageId })
    //     if (!VisitedImage) {
    //         throw new HttpException(
    //             `VisitedImage not found with this id=${VimageId}`,
    //             HttpStatus.BAD_REQUEST,
    //         );
    //     }
    //     const serviceAccountKeyFile = 's3config.json';
    //     process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountKeyFile;
    //     const storage = new Storage({ keyFilename: serviceAccountKeyFile });
    //     const bucketName = 'cdnflyfarladies'; // Replace with your actual bucket name
    //     const bucket = storage.bucket(bucketName);
    //     const fileName = `${file.originalname}.webp`;
    //     const fileObject = bucket.file(fileName);
    //     try {
    //       const imageBuffer = await sharp(file.buffer).webp().toBuffer();
    //       await fileObject.save(imageBuffer, {
    //         contentType: 'image/webp',
    //         public: true,
    //         validation: 'md5',
    //       });
    //       const imageUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    //       console.log(`File uploaded successfully to ${imageUrl}`);
    //       return imageUrl;
    //     } catch (err) {
    //       console.error('Error uploading file to Google Cloud Storage:', err);
    //       throw err;
    //     }


    // }
}
