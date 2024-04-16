/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("users", function (table) {
      table.increments("id").primary(); // Esto define la columna 'id' como clave primaria
      table.string("name").notNullable();
      table.string("email").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })

    .createTable("todos", function (table) {
      table.increments("id").primary(); // Esto define la columna 'id' como clave primaria
      table.string("title").notNullable();
      table.boolean("is_active").defaultTo(false);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.integer("user_id").unsigned();
      table
        .foreign("user_id")
        .references("users.id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("todos").dropTable("users");
};
