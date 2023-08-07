import { Test, TestingModule } from '@nestjs/testing';
import { AmarpayService } from './amarpay.service';

describe('AmarpayService', () => {
  let service: AmarpayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AmarpayService],
    }).compile();

    service = module.get<AmarpayService>(AmarpayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
