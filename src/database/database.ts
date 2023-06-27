import { Connection, DataSource, createConnection, getConnectionManager } from "typeorm";
import { typeOrmConfig } from "./orm-config";

let connection: DataSource | undefined;

export const connectDatabase = async (
    resetDB: boolean
): Promise<Connection> => {
    try {
        const pre = getDatabase()
        if (pre) return pre
        connection = await createConnection(typeOrmConfig);
        console.log('Database Connected')

    } catch (err: any) {
        console.error("err!", err);

        if (err.name === "AlreadyHasActiveConnectionError") {
            connection = getConnectionManager().get(typeOrmConfig.name);

        } else {
            throw new Error(
                `Unable to establish database connection: ${err.message}`,
            );
        } 
    }

    if (resetDB) {
        await resetDatabase(connection)
        return connection
    }
    await connection.showMigrations();
    await connection.runMigrations();
    await connection.synchronize();

    return connection;
};

export const resetDatabase = async (connection?: Connection) => {
    console.info(`Resetting database...`);

    try {
        connection = connection || (await createConnection(typeOrmConfig));
    } catch (error) {
        if (/AlreadyHasActiveConnectionError/.exec(error.message)) {
            // Use existing connection.
            connection = connection
        } else {
            throw error;
        }
    }
    await connection.dropDatabase();
};


// Gets the existing database connection
export function getDatabase(): DataSource | null {
	// if (!dbConnection) throw new Error("Tried to get database before it was initialised");
	if (!connection) return null;
	return connection;
}