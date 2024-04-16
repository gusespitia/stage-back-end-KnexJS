import { NODE_ENV } from 'process';
import knexConfig from "../knexfile";

const environment = NODE_ENV !== "development";
const config = knexConfig[environment];

export default require("knex")(config);

