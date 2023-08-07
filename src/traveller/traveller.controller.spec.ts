import { Test, TestingModule } from '@nestjs/testing';
import { TravellerController } from './traveller.controller';
import { TravellerService } from './traveller.service';

describe('TravellerController', () => {
  let controller: TravellerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TravellerController],
      providers: [TravellerService],
    }).compile();

    controller = module.get<TravellerController>(TravellerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
