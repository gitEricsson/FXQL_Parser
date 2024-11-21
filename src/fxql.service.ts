import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FxqlEntry } from './entities/fxql.entity';
import { ParserUtils, FxqlParseError } from './utils/parser.utils';
import { decode } from 'he';

@Injectable()
export class FxqlService {
  constructor(
    @InjectRepository(FxqlEntry)
    private fxqlRepository: Repository<FxqlEntry>,
  ) {}

  async parseFxql(fxql: string): Promise<FxqlEntry[]> {
    const decodedFxql = decode(fxql);

    const statements = this.splitStatements(decodedFxql);

    if (statements.length > 1000) {
      throw new BadRequestException(
        'Maximum 1000 currency pairs per request allowed',
      );
    }

    const processedPairs = new Map<string, FxqlEntry>();

    for (const [index, statement] of statements.entries()) {
      try {
        const entry = await this.parseStatement(statement, index);
        delete entry.createdAt;

        const pairKey = `${entry.SourceCurrency}-${entry.DestinationCurrency}`;
        processedPairs.set(pairKey, entry);
      } catch (error) {
        if (error instanceof FxqlParseError) {
          throw error;
        }
        throw new BadRequestException(
          `Error in statement ${index + 1}: ${error.message}`,
        );
      }
    }

    return Array.from(processedPairs.values());
  }

  private splitStatements(fxql: string): string[] {
    if (fxql.includes('\\n')) {
      return fxql.split(/\\n\\n/).map((stmt) => stmt.trim());
    } else {
      return fxql
        .split(/}\s*(?=\w+-\w+|$)/)
        .map((item) => item.replace(/\\n/g, '\n').trim())
        .filter(Boolean);
    }
  }

  private async parseStatement(
    statement: string,
    startIndex: number,
  ): Promise<FxqlEntry> {
    try {
      const currencyPairRegex = /^([A-Z]{3})-([A-Z]{3})\s*{/;
      const match = statement.match(currencyPairRegex);

      if (!match) {
        const pos = ParserUtils.findPosition(statement, 0);
        throw new FxqlParseError(
          'Invalid currency pair format',
          pos.line,
          pos.column,
          ParserUtils.getContextSnippet(statement, 0),
        );
      }

      const [sourceCurrency, destinationCurrency] = [match[1], match[2]];

      // Validate currencies
      if (
        !this.isValidCurrency(sourceCurrency) ||
        !this.isValidCurrency(destinationCurrency)
      ) {
        const errorIndex = statement.indexOf(match[0]);
        const pos = ParserUtils.findPosition(statement, errorIndex);
        throw new FxqlParseError(
          `Invalid currency code: ${!this.isValidCurrency(sourceCurrency) ? sourceCurrency : destinationCurrency}`,
          pos.line,
          pos.column,
          ParserUtils.getContextSnippet(statement, errorIndex),
        );
      }

      // Parse values with detailed error reporting
      const values = await this.parseValues(statement, startIndex);

      const entry = this.fxqlRepository.create({
        SourceCurrency: sourceCurrency,
        DestinationCurrency: destinationCurrency,
        ...values,
      });

      await this.fxqlRepository.save(entry);

      return entry;
    } catch (error) {
      if (error instanceof FxqlParseError) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  private async parseValues(statement: string, startIndex: number) {
    const fields = ['BUY', 'SELL', 'CAP'];
    const values: Record<string, number> = {};

    for (const field of fields) {
      const regex = new RegExp(`${field}\\s+(\\d+(?:\\.\\d+)?)`);
      const match = statement.match(regex);

      if (!match) {
        const errorIndex =
          statement.indexOf(field) !== -1
            ? statement.indexOf(field)
            : statement.length;
        const pos = ParserUtils.findPosition(
          statement,
          errorIndex + startIndex,
        );

        throw new FxqlParseError(
          `Missing or invalid ${field} value`,
          pos.line,
          pos.column,
          ParserUtils.getContextSnippet(statement, errorIndex),
        );
      }

      const value =
        field === 'CAP' ? parseInt(match[1], 10) : parseFloat(match[1]);

      if (isNaN(value) || (field === 'CAP' && value < 0)) {
        const errorIndex = statement.indexOf(match[1]);
        const pos = ParserUtils.findPosition(
          statement,
          errorIndex + startIndex,
        );
        throw new FxqlParseError(
          `Invalid ${field} value: ${match[1]}`,
          pos.line,
          pos.column,
          ParserUtils.getContextSnippet(statement, errorIndex),
        );
      }

      if (field !== 'CAP') {
        values[
          `${field[0].toUpperCase() + field.substring(1).toLowerCase()}Price`
        ] = value;
      } else {
        values[
          `${field[0].toUpperCase() + field.substring(1).toLowerCase()}Amount`
        ] = value;
      }
    }

    return values;
  }

  private isValidCurrency(currency: string): boolean {
    return /^[A-Z]{3}$/.test(currency);
  }
}
