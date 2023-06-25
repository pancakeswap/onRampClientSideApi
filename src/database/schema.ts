// Please note that if you changed the user, database, or password in the database creation section you will need to update the respective line items below.
import { Pool } from "pg";

const pool = new Pool({
     user: "pcs",
     host: "localhost",
     database: "api",
     password: "password",
     port: 5432,
});

export default pool