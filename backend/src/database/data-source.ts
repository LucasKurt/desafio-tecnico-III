import 'dotenv/config';
import { DataSource } from 'typeorm';
import { baseTypeOrmOptions } from './typeorm.options';

export default new DataSource({
  ...baseTypeOrmOptions(),
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
  logging: true,
});
