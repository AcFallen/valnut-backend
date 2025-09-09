import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT!, 10) || 5433,
    username: process.env.DB_USERNAME || 'valnut_user',
    password: process.env.DB_PASSWORD || 'valnut_password',
    database: process.env.DB_NAME || 'valnut_db',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
    // dropSchema:true,
    logging: process.env.NODE_ENV === 'development',
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  }),
);
