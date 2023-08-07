import { Test, TestingModule } from '@nestjs/testing';
import { SslcommerzController } from './sslcommerz.controller';
import { SslcommerzService } from './sslcommerz.service';

describe('SslcommerzController', () => {
  let controller: SslcommerzController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SslcommerzController],
      providers: [SslcommerzService],
    }).compile();

    controller = module.get<SslcommerzController>(SslcommerzController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
