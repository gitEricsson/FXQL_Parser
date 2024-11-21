import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { FxqlService } from './fxql.service';
import { FxqlRequestDto, FxqlResponseDto } from './dto/fxql.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('FXQL')
@Controller('')
export class FxqlController {
  constructor(private readonly fxqlService: FxqlService) {}

  @Post()
  @ApiOperation({
    summary: 'Parse FXQL statement',
    description: 'Parse, validate, and save FXQL statements to the database.',
  })
  @ApiBody({
    description: 'FXQL statement to be parsed and validated',
    schema: {
      type: 'object',
      properties: {
        FXQL: {
          type: 'string',
          example:
            'USD-GBP {\\n  BUY 0.85\\n  SELL 0.90\\n  CAP 10000\\n}\\n\\nEUR-JPY {\\n  BUY 145.20\\n  SELL 146.50\\n  CAP 50000\\n}\\n\\nNGN-USD {\\n  BUY 0.0022\\n  SELL 0.0023\\n  CAP 2000000\\n}',
        },
      },
      required: ['FXQL'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'FXQL Statement Parsed Successfully.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'FXQL Statement Parsed Successfully.',
        },
        code: { type: 'string', example: 'FXQL-200' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              EntryId: { type: 'number', example: 1 },
              SourceCurrency: { type: 'string', example: 'USD' },
              DestinationCurrency: { type: 'string', example: 'GBP' },
              SellPrice: { type: 'number', example: 0.85 },
              BuyPrice: { type: 'number', example: 0.9 },
              CapAmount: { type: 'number', example: 10000 },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid FXQL Statement.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid FXQL Statement.' },
        code: { type: 'string', example: 'FXQL-400' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'An error occurred while processing the FXQL statement.',
        },
        code: { type: 'string', example: 'FXQL-500' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async parseFxql(@Body() request: FxqlRequestDto): Promise<FxqlResponseDto> {
    const entries = await this.fxqlService.parseFxql(request.FXQL);

    return {
      message: 'FXQL Statement Parsed Successfully.',
      code: 'FXQL-200',
      data: entries,
    };
  }
}
