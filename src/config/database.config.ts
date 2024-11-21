import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { FxqlEntry } from '../entities/fxql.entity';
import { DatabaseConnectionSingleton } from './singleton.config';

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const connectionOptions: TypeOrmModuleOptions = {
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [FxqlEntry],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    };

    // Set the connection in the singleton
    const dbConnectionSingleton = DatabaseConnectionSingleton.getInstance();
    dbConnectionSingleton.setConnection(connectionOptions);

    return connectionOptions;
  }
}
