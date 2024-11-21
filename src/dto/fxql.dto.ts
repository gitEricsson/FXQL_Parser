import { IsString, Matches, IsNotEmpty } from 'class-validator';

export class FxqlRequestDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^([A-Z]{3}-[A-Z]{3}\s*{[\s\S]*?}(?:\s*\n)?)+$/, {
    message: 'Invalid FXQL statement format',
  })
  FXQL: string;
}

export class FxqlResponseDto {
  message: string;
  code: string;
  data: FxqlEntry[];
}

export interface FxqlEntry {
  EntryId: number;
  SourceCurrency: string;
  DestinationCurrency: string;
  SellPrice: number;
  BuyPrice: number;
  CapAmount: number;
}
