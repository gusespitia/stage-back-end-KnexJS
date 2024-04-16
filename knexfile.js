// Cargar las variables de entorno desde el archivo .env
import dotenv from "dotenv";
dotenv.config();

// Obtener la URL del archivo actual
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// knexfile.js
const knexConfig = {
  development: {
    client: "mysql",
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
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

export { knexConfig };
