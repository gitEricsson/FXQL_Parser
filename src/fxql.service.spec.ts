import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FxqlService } from './fxql.service';
import { FxqlEntry } from './entities/fxql.entity';
import { BadRequestException } from '@nestjs/common';
import { FxqlParseError } from './utils/parser.utils';

describe('FxqlService', () => {
  let service: FxqlService;
  let repository: Repository<FxqlEntry>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FxqlService,
        {
          provide: getRepositoryToken(FxqlEntry),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest
              .fn()
              .mockImplementation((entry) =>
                Promise.resolve({ EntryId: 1, ...entry }),
              ),
          },
        },
      ],
    }).compile();

    service = module.get<FxqlService>(FxqlService);
    repository = module.get<Repository<FxqlEntry>>(
      getRepositoryToken(FxqlEntry),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseFxql', () => {
    it('should successfully parse valid FXQL statement', async () => {
      const validFxql = `USD-GBP {
        BUY 0.85
        SELL 0.90
        CAP 10000
      }`;

      const result = await service.parseFxql(validFxql);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        SourceCurrency: 'USD',
        DestinationCurrency: 'GBP',
        BuyPrice: 0.85,
        SellPrice: 0.9,
        CapAmount: 10000,
      });
    });

    it('should handle multiple valid statements', async () => {
      const validFxql = `
        USD-GBP {
          BUY 0.85
          SELL 0.90
          CAP 10000
        }
        EUR-JPY {
          BUY 145.20
          SELL 146.50
          CAP 50000
        }`;

      const result = await service.parseFxql(validFxql);
      expect(result).toHaveLength(2);
    });

    it('should use latest values for duplicate currency pairs', async () => {
      const duplicateFxql = `
        USD-GBP {
          BUY 0.85
          SELL 0.90
          CAP 10000
        }
        USD-GBP {
          BUY 0.86
          SELL 0.91
          CAP 12000
        }`;

      const result = await service.parseFxql(duplicateFxql);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        SourceCurrency: 'USD',
        DestinationCurrency: 'GBP',
        BuyPrice: 0.86,
        SellPrice: 0.91,
        CapAmount: 12000,
      });
    });

    it('should reject invalid currency codes', async () => {
      const invalidFxql = `
            US-GBP {
              BUY 0.85
              SELL 0.90
              CAP 10000
            }`;

      await expect(service.parseFxql(invalidFxql)).rejects.toThrow(
        FxqlParseError,
      );
    });

    it('should reject negative CAP values', async () => {
      const invalidFxql = `
            USD-GBP {
              BUY 0.85
              SELL 0.90
              CAP -10000
            }`;

      await expect(service.parseFxql(invalidFxql)).rejects.toThrow(
        FxqlParseError,
      );
    });

    it('should reject invalid numeric formats', async () => {
      const invalidFxql = `
            USD-GBP {
              BUY 0.85
              SELL abc
              CAP 10000
            }`;

      await expect(service.parseFxql(invalidFxql)).rejects.toThrow(
        FxqlParseError,
      );
    });

    it('should reject when maximum statement limit is exceeded', async () => {
      // Generate 1001 valid statements
      const statements = Array(1001)
        .fill(
          `
            USD-GBP {
              BUY 0.85
              SELL 0.90
              CAP 10000
            }`,
        )
        .join('\n');

      await expect(service.parseFxql(statements)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  it('should provide line numbers in error messages', async () => {
    const invalidFxql = `
            USD-GBP {
              BUY 0.85
              SELL abc
              CAP 10000
            }`;

    try {
      await service.parseFxql(invalidFxql);
    } catch (error) {
      expect(error).toBeInstanceOf(FxqlParseError);
      expect(error.line).toBe(3);
      expect(error.column).toBeDefined();
      expect(error.snippet).toContain('SELL abc');
    }
  });

  it('should handle malformed currency pairs', async () => {
    const invalidFxql = `
            USDD-GBP {
              BUY 0.85
              SELL 0.90
              CAP 10000
            }`;

    try {
      await service.parseFxql(invalidFxql);
    } catch (error) {
      expect(error).toBeInstanceOf(FxqlParseError);
      expect(error.message).toContain('Invalid currency pair format');
    }
  });

  it('should validate decimal places in rates', async () => {
    const invalidFxql = `
            USD-GBP {
              BUY 0.85555555
              SELL 0.90
              CAP 10000
            }`;

    try {
      await service.parseFxql(invalidFxql);
    } catch (error) {
      expect(error).toBeInstanceOf(FxqlParseError);
      expect(error.message).toContain('Invalid BUY value');
    }
  });
});
