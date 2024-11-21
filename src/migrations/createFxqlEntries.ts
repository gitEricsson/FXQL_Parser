import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateFxqlEntries implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'fxql_entry',
        columns: [
          {
            name: 'EntryId',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'SourceCurrency',
            type: 'varchar',
            length: '3',
            isNullable: false,
          },
          {
            name: 'DestinationCurrency',
            type: 'varchar',
            length: '3',
            isNullable: false,
          },
          {
            name: 'SellPrice',
            type: 'decimal',
            precision: 10,
            scale: 4,
            isNullable: false,
          },
          {
            name: 'BuyPrice',
            type: 'decimal',
            precision: 10,
            scale: 4,
            isNullable: false,
          },
          {
            name: 'CapAmount',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'fxql_entry',
      new TableIndex({
        name: 'IDX_CURRENCY_PAIR',
        columnNames: ['SourceCurrency', 'DestinationCurrency'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('fxql_entry', 'IDX_CURRENCY_PAIR');
    await queryRunner.dropTable('fxql_entry');
  }
}
