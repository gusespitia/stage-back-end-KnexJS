/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
  .createTable("posts", function (table) {
    table.increments("id").primary(); // Esto define la columna 'id' como clave primaria
    table.string("title").notNullable();
    table.text("data"); // Cambiado a tipo 'text' para almacenar código HTML
    table.boolean("is_active").defaultTo(true);
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

// GET POST BY USERID
// Ruta para obtener todos los posts de un usuario por ID
app.get("/users/:userId/posts", async (req, res) => {
  try {
    const userId = req.params.userId; // Obtiene el ID del usuario de los parámetros de la URL
    const posts = await getAllPostsByUserId(userId); // Llama a la función para obtener todos los posts de un usuario por ID
    res.json(posts); // Devuelve los posts como respuesta
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Error fetching posts" });
  }
});
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable("posts");
  }
  
