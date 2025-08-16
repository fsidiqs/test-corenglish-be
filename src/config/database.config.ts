import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Task } from '../modules/tasks/entities/task.entity';
import { config } from 'dotenv';

config();

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    // Check if DATABASE_URL is provided (Railway style)
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    
    if (databaseUrl) {
      return {
        type: 'postgres',
        url: databaseUrl,
        entities: [Task],
        migrations: ['dist/migrations/*.js'],
        synchronize: this.configService.get<boolean>('DB_SYNCHRONIZE', false),
        logging: this.configService.get<boolean>('DB_LOGGING', false),
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      };
    }

    // Fallback to individual config values
    return {
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      username: this.configService.get<string>('DB_USERNAME', 'postgres'),
      password: this.configService.get<string>('DB_PASSWORD', 'password'),
      database: this.configService.get<string>('DB_NAME', 'task_management'),
      entities: [Task],
      migrations: ['dist/migrations/*.js'],
      synchronize: this.configService.get<boolean>('DB_SYNCHRONIZE', false),
      logging: this.configService.get<boolean>('DB_LOGGING', false),
    };
  }
}

// DataSource configuration for TypeORM CLI
const databaseUrl = process.env.DATABASE_URL;

const dataSourceOptions: DataSourceOptions = databaseUrl
  ? {
      type: 'postgres',
      url: databaseUrl,
      entities: ['src/**/*.entity.ts'],
      migrations: ['src/migrations/*.ts'],
      synchronize: false,
      logging: false,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }
  : {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'task_management',
      entities: ['src/**/*.entity.ts'],
      migrations: ['src/migrations/*.ts'],
      synchronize: false,
      logging: false,
    };

export default new DataSource(dataSourceOptions);
