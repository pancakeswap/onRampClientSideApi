import 'reflect-metadata'
import { createConnection, Connection } from 'typeorm'
import {
  UserEntity,
  MoonpayTxEntity,
  MercuryoTxEntity,
} from './database/entities'
import { createUsers } from './crud/'

const app = async () => {
  const connection: Connection = await createConnection({
    type: "postgres",
  host: "localhost",
  port: 5432,
  username: "pcs",
  password: "Emcg45245!",
  database: "api",
  // synchronize: true,
  logging: true,
    entities: [
      UserEntity,
      MoonpayTxEntity,
      MercuryoTxEntity,
    ],
    // logger: new CustomeLogger(),
    // host: 'localhost',
    // port: 3306,
    // username: 'test',
    // password: 'test',
    // database: 'test',
  })
  // Creates database schema for all entities registered in this connection.
  // Can be used only after connection to the database is established.
  // pass true to drop everything b4 creating anything
  // await connection.dropDatabase()
  await connection.synchronize(false).catch(console.error)
  await createUsers(connection)
}

app()
