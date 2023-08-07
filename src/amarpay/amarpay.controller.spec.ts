import { Test, TestingModule } from '@nestjs/testing';
import { AmarpayController } from './amarpay.controller';
import { AmarpayService } from './amarpay.service';

describe('AmarpayController', () => {
  let controller: AmarpayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AmarpayController],
      providers: [AmarpayService],
    }).compile();

    controller = module.get<AmarpayController>(AmarpayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
