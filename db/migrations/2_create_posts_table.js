/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable("posts", function (table) {
    table.increments("id").primary(); // Esto define la columna 'id' como clave primaria
    table.string("title").notNullable();
    table.text("data"); // Cambiado a tipo 'text' para almacenar código HTML
    table.boolean("is_active").defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.integer("user_id").unsigned();
    table
      .foreign("user_id")
      .references("users.userId")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable("posts");
}
