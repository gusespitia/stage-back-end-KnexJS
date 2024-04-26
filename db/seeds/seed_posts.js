/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("posts").del();
  await knex("posts").insert([
    { id: 1, title: "Gus", data: "data example", is_active: "1", user_id: "1" },
    { id: 2, title: "Gus", data: "data example", is_active: "1", user_id: "1" },
    { id: 3, title: "Gus", data: "data example", is_active: "1", user_id: "1" },
  ]);
}
