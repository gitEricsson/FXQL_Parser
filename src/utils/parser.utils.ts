export interface ParserPosition {
  line: number;
  column: number;
}

export class ParserUtils {
  static findPosition(input: string, index: number): ParserPosition {
    const lines = input.slice(0, index).split('\n');
    return {
      line: lines.length,
      column: lines[lines.length - 1].length + 1,
    };
  }

  static getContextSnippet(input: string, index: number): string {
    const start = Math.max(0, index - 20);
    const end = Math.min(input.length, index + 20);
    const snippet = input.slice(start, end);
    return `...${snippet}...`;
  }
}

export class FxqlParseError extends Error {
  constructor(
    message: string,
    public readonly line: number,
    public readonly column: number,
    public readonly snippet: string,
  ) {
    super(message);
    this.name = 'FxqlParseError';
  }
}
