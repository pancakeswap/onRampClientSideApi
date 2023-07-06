import chalk from "chalk";
import { Connection, createConnection, getConnectionManager } from "typeorm";
import Log from "../middleware/Log";
import { typeOrmConfig } from "./orm-config";

export const connectDatabase = async (
    logger: typeof Log,
    RESET_DB: boolean
): Promise<Connection> => {
    let connection: Connection;

    try {
        connection = await createConnection(typeOrmConfig);
        logger.info(
            `${chalk.green("Database connected")}. (database: ${chalk.yellow(
                connection.options.database,
            )})`,
        );
    } catch (err: any) {
        logger.error(`err!", ${err}`);
        if (err.name === "AlreadyHasActiveConnectionError") {
            connection = getConnectionManager().get(typeOrmConfig.name);
        } else {
            throw new Error(
                `Unable to establish database connection: ${err.message}`,
            );
        }
    }

    if (RESET_DB) {
        logger.info(`Resetting database...`);
        await connection.dropDatabase();
    }
    await connection.showMigrations();
    await connection.runMigrations();
    await connection.synchronize();

    return connection;
};
