import { Test, TestingModule } from '@nestjs/testing';
import { SslcommerzService } from './sslcommerz.service';

describe('SslcommerzService', () => {
  let service: SslcommerzService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SslcommerzService],
    }).compile();

    service = module.get<SslcommerzService>(SslcommerzService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
