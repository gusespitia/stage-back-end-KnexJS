import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const knexConfig = {
  development: {
    client: "mysql",
    connection: {
      host: "ID396978_reactApp.db.webhosting.be",
      user: "ID396978_reactApp",
      password: "k0Rk95Aq022945918312",
      database: "ID396978_reactApp",
    },
    migrations: {
      directory: __dirname + "/db/migrations",
    },
    seeds: {
      directory: __dirname + "/db/seeds",
    },
  },
  production: {
    client: "mysql",
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: __dirname + "/db/migrations",
    },
    seeds: {
      directory: __dirname + "/db/seeds/production",
    },
  },
};

export default knexConfig;
