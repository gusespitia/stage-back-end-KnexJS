import express from "express";
import { getAllTodos, getTodoById, postTodo } from "./queries.js"; // Import query functions
import fetch from "node-fetch"; // Importa fetch si no lo has hecho ya
import dotenv from "dotenv"; // Importa dotenv para cargar variables de entorno
dotenv.config(); // Carga las variables de entorno desde el archivo .env si existe

const port = process.env.PORT || 8010;
const app = express();

// Ruta para obtener información del usuario desde Frontuser
app.get("/frontuser/:userId", async (req, res) => {
  const userId = req.params.userId;
  const token = process.env.FRONTUSER_API_TOKEN; // Obtiene el token de acceso desde las variables de entorno

  try {
    const response = await fetch(
      `https://api.userfront.com/v0/tenants/vbqwm45b/users/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Incluye el token de acceso en el encabezado de autorización
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error fetching user data from Frontuser");
    }

    const userData = await response.json();
    res.json(userData);
  } catch (error) {
    console.error("Error fetching user data from Frontuser:", error);
    res.status(500).json({ error: "Error fetching user data from Frontuser" });
  }
});

// Route handler to get all todos
app.get("/todos", async (req, res) => {
  try {
    const todos = await getAllTodos(); // Use query function
    res.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Error fetching todos" });
  }
});

// Ruta POST para crear un nuevo todo
app.post("/todos", async (req, res) => {
  try {
    const { title } = req.body; // Obtiene el título del cuerpo de la solicitud
    const newTodo = await postTodo(title); // Llama a la función para crear un nuevo todo
    res.json(newTodo);
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ error: "Error creating todo" });
  }
});

// Route handler to get todo by id using query function
app.get("/todos/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const todo = await getTodoById(id);
    res.json(todo);
  } catch (error) {
    console.error("Error fetching todo:", error);
    res.status(500).json({ error: "Error fetching todo" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});

// Función para actualizar el rol del usuario en Userfront
async function updateUserRoles(userId, rolesToUpdate) {
  try {
    const url = `https://api.userfront.com/v0/tenants/vbqwm45b/users/${userId}/roles`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer uf_test_admin_xbpwd96n_c9a7bff77e3d3552fca270f56c9b50ea",
      },
      body: JSON.stringify({ roles: rolesToUpdate }),
    });

    const responseData = await response.json();
    console.log(responseData);
    return responseData;
  } catch (error) {
    console.error("Error updating user roles in Userfront:", error);
    throw new Error("Error updating user roles in Userfront");
  }
}

// Ejemplo de uso
const userId = 4; // ID del usuario que deseas actualizar
const rolesToUpdate = ["student"]; // Nuevos roles a asignar

try {
  const response = await updateUserRoles(userId, rolesToUpdate);
  console.log(response);
} catch (error) {
  console.error("Error updating user roles:", error);
}
