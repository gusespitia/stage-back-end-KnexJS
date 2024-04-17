import express from "express";
import bodyParser from "body-parser"; // Importa bodyParser para analizar el cuerpo de la solicitud

import { getAllTodos, getTodoById, postTodo } from "./queries.js"; // Import query functions
import fetch from "node-fetch"; // Importa fetch si no lo has hecho ya
import dotenv from "dotenv"; // Importa dotenv para cargar variables de entorno
dotenv.config(); // Carga las variables de entorno desde el archivo .env si existe

const port = process.env.PORT || 8020;
const app = express();
app.use(express.json());

app.post("/frontuser/webhook", async (req, res) => {
  try {
    // Verifica que el webhook tenga la acción de creación de usuario
    if (req.body.action === "create" && req.body.model === "user") {
      // Obtén la información del usuario creado del cuerpo del webhook
      const user = req.body.record;

      // Realiza el llamado a la API que deseas cada vez que se crea un usuario
      const response = await fetch("URL_DE_TU_API", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.WEBHOOK_API_KEY}`, // Utiliza tu clave de API de webhook almacenada en variables de entorno
        },
        body: JSON.stringify(user), // Envía la información del usuario creado como cuerpo de la solicitud
      });

      // Verifica si la solicitud fue exitosa
      if (response.ok) {
        console.log(
          "Llamado exitoso a la API después de crear un usuario:",
          user
        );
        res
          .status(200)
          .send("Llamado exitoso a la API después de crear un usuario");
      } else {
        console.error(
          "Error en el llamado a la API después de crear un usuario:",
          response.statusText
        );
        res
          .status(response.status)
          .send("Error en el llamado a la API después de crear un usuario");
      }
    } else {
      res
        .status(400)
        .send("El webhook no corresponde a la acción de creación de usuario");
    }
  } catch (error) {
    console.error("Error en el manejo del webhook:", error);
    res.status(500).send("Error en el manejo del webhook");
  }
});

// // CREAR NUEVOS USUARIOS
// const newUser = {
//   email: "martha@example.com",
//   username: "marthaesp",
//   name: "Martha Espitia",
//   password: "Martha123456789",
// };

// const response = await fetch(
//   "https://api.userfront.com/v0/tenants/vbqwm45b/users",
//   {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization:
//         "Bearer uf_test_admin_xbpwd96n_c9a7bff77e3d3552fca270f56c9b50ea",
//     },
//     body: JSON.stringify(newUser),
//   }
// );

// const responseData = await response.json();
// console.log(responseData);

// Middleware para analizar el cuerpo de la solicitud como JSON
app.use(bodyParser.json());

// Ruta para manejar el webhook de creación de usuario desde Userfront
app.post("/userfront/webhook", async (req, res) => {
  try {
    // Verifica que la solicitud contenga los datos del nuevo usuario
    if (req.body && req.body.record) {
      const newUser = req.body.record;

      // Aquí puedes guardar los datos del nuevo usuario en tu base de datos
      // Ejemplo de cómo guardar los datos en una base de datos ficticia
      const savedUser = {
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        id: newUser.userId,
        role: "user", // Asigna un rol predeterminado al nuevo usuario
      };

      // Aquí puedes realizar la lógica para guardar los datos en tu base de datos
      console.log("Nuevo usuario creado:", savedUser);

      res.status(200).send("Datos del nuevo usuario recibidos correctamente");
    } else {
      res
        .status(400)
        .send("La solicitud no contiene los datos del nuevo usuario");
    }
  } catch (error) {
    console.error("Error al manejar el webhook de Userfront:", error);
    res.status(500).send("Error al manejar el webhook de Userfront");
  }
});

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

// Define la ruta para actualizar los roles de los usuarios
app.post("/update-user-roles", async (req, res) => {
  try {
    // Extrae los datos necesarios de la solicitud
    const { userId, rolesToUpdate } = req.body;

    // Llama a la función para actualizar los roles del usuario en Userfront
    const response = await updateUserRoles(userId, rolesToUpdate);

    // Envía la respuesta de vuelta al cliente
    res.json(response);
  } catch (error) {
    console.error("Error updating user roles:", error);
    res.status(500).json({ error: "Error updating user roles" });
  }
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
