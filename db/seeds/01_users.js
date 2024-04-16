/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("users").del();
  await knex("users").insert([
    { id: 1, name: "Gus", email: "gus@gmail.com" },
    { id: 2, name: "Cesar", email: "cesar@gmail.com" },
    { id: 3, name: "Ines", email: "ines@gmail.com" },
  ]);
};
