import "reflect-metadata"
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import {  MoonpayTxEntity, UserEntity } from "./entities";

export const typeOrmConfig: PostgresConnectionOptions = {
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "pcs",
  name: 'text',
  password: "Emcg45245!",
  database: "api",
  // synchronize: true,
  // logging: true,
  entities: [UserEntity, MoonpayTxEntity],
  subscribers: [],
  migrations: [],
}