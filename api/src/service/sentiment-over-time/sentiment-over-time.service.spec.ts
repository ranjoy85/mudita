import { Test, TestingModule } from '@nestjs/testing';
import { SentimentOverTimeService } from './sentiment-over-time.service';

describe('SentimentOverTimeService', () => {
  let service: SentimentOverTimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SentimentOverTimeService],
    }).compile();

    service = module.get<SentimentOverTimeService>(SentimentOverTimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
