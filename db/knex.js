import knexConfig from "../knexfile.js";
const { NODE_ENV } = process.env;
const environment = NODE_ENV || "development";
const config = knexConfig[environment];

import knex from "knex";
const db = knex(config);

export default db;
