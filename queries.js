// queries.js

import knex from "knex";
import { knexConfig } from "./knexfile.js";

// Create a Knex instance
const db = knex(knexConfig["development"]);

// Function to get all todos
export async function getAllTodos() {
  try {
    const todos = await db("todos").select("*");
    return todos;
  } catch (error) {
    throw new Error("Error fetching todos:", error);
  }
}

// Function to get a specific todo by its id
export async function getTodoById(id) {
  try {
    const todo = await db("todos").select("*").where("id", id);
    return todo;
  } catch (error) {
    throw new Error("Error fetching todo:", error);
  }
}

// queries.js

// Función para agregar un nuevo todo
export async function postTodo(title) {
  try {
    // Insertar el nuevo todo en la base de datos
    const [newTodoId] = await db("todos").insert({ title });
    // Obtener el todo recién insertado
    const newTodo = await db("todos").where("id", newTodoId).first();
    return newTodo;
  } catch (error) {
    throw new Error("Error adding todo:", error);
  }
}
