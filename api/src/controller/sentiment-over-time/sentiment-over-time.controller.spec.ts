import { Test, TestingModule } from '@nestjs/testing';
import { SentimentOverTimeController } from './sentiment-over-time.controller';

describe('SentimentOverTimeController', () => {
  let controller: SentimentOverTimeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SentimentOverTimeController],
    }).compile();

    controller = module.get<SentimentOverTimeController>(SentimentOverTimeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
