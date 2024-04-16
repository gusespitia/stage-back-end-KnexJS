/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
      .createTable("profiles", function (table) {
        table.increments("id").primary(); // Esto define la columna 'id' como clave primaria
        table.string("name").notNullable();
        table.string("email").notNullable();
        table.text("data"); // Cambiado a tipo 'text' para almacenar código HTML
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
      })
  };
  
