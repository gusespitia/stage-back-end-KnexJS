import express from "express";
import bodyParser from "body-parser";
import { getAllTodos, getTodoById, postTodo } from "./queries.js"; // Import query functions
import fetch from "node-fetch"; // Importa fetch si no lo has hecho ya
import dotenv from "dotenv"; // Importa dotenv para cargar variables de entorno
dotenv.config(); // Carga las variables de entorno desde el archivo .env si existe

const port = process.env.PORT || 8010;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Ruta para obtener información del usuario desde Frontuser
// Middleware para parsear JSON
app.use(express.json());

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
