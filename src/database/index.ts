import { Connection, createConnection, getConnectionOptions } from 'typeorm';

export async function createDatabaseConnection(): Promise<Connection> {
  const options = await getConnectionOptions();

  if (process.env.NODE_ENV === "test") {
    Object.assign(options, {
      database: "fin_api"
    })
  }

  return createConnection(options)
}
