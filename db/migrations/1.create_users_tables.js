/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .createTable("users", function (table) {
      table.increments("id").primary(); // Esto define la columna 'id' como clave primaria
      table.bigInteger("userId").notNullable();
      table.string("username").notNullable();
      table.string("name").nullable();
      table.string("email").notNullable();
      table.string("phoneNumber").nullable();
      table.string("image").notNullable();
      table.jsonb("data").notNullable();
      table.string("roles").nullable();
      table.boolean("isEmailConfirmed").notNullable();
      table.boolean("isPhoneNumberConfirmed").notNullable();
      table.boolean("isConfirmed").notNullable();
      table.boolean("isMfaRequired").notNullable();
      table.jsonb("preferredFirstFactor").notNullable();
      table.jsonb("preferredSecondFactor").notNullable();
      table.timestamp("lastActiveAt").notNullable();
      table.timestamp("confirmedEmailAt").notNullable();
      table.timestamp("confirmedPhoneNumberAt").notNullable();
      table.timestamp("confirmedAt").notNullable();
      table.timestamp("createdAt").notNullable();
      table.timestamp("updatedAt").notNullable();
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
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable("todos").dropTable("users");
}
