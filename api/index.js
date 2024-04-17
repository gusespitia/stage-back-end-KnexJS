import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import mysql from "mysql";
import { getUsers } from "./userController.js";
import { getAllTodos, getTodoById, postTodo } from "./queries.js";

const app = express();
const port = process.env.PORT || 8020;
app.use(express.json());
app.use(bodyParser.json());

const dbConfig = {
  host: "ID396978_reactApp.db.webhosting.be",
  user: "ID396978_reactApp",
  password: "k0Rk95Aq022945918312",
  database: "ID396978_reactApp",
  timeout: 60000, // Establece el tiempo de espera de inactividad en 60 segundos (o el valor que consideres adecuado)
};

// Ruta para obtener todos los usuarios
app.get("/api/users", async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
});

// Ruta para manejar el webhook de creación de usuario desde Userfront
app.post("/userfront/webhook", async (req, res) => {
  try {
    if (req.body && req.body.record) {
      const newUser = req.body.record;
      const connection = mysql.createConnection(dbConfig);
      const query =
        "INSERT INTO users (userId, username, email, phoneNumber, name, image, data, roles) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
      const values = [
        newUser.userId,
        newUser.username,
        newUser.email,
        newUser.phoneNumber,
        newUser.name,
        newUser.image,
        JSON.stringify(newUser.data),
        newUser.authorization &&
        newUser.authorization[newUser.tenantId] &&
        newUser.authorization[newUser.tenantId].roles
          ? JSON.stringify(newUser.authorization[newUser.tenantId].roles)
          : null,
      ];
      connection.connect();
      connection.query(query, values, (error, result) => {
        connection.end(); // Cierra la conexión después de usarla
        if (error) {
          console.error("Error inserting new user into MySQL database:", error);
          res
            .status(500)
            .send(
              "Error al guardar los datos del nuevo usuario en la base de datos"
            );
          return;
        }
        console.log(
          "Nuevo usuario creado y guardado en la base de datos:",
          result
        );
        res
          .status(200)
          .send(
            "Datos del nuevo usuario recibidos y guardados correctamente en la base de datos"
          );
      });
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
app.post("/userfront/updated/webhook", (req, res) => {
  try {
    const eventData = req.body; // Datos recibidos del webhook de Userfront
    console.log("esta es la info enviada", eventData);
    const userId = eventData.record.userId; // Obtén el ID del usuario eliminado

    try {
      const connection = mysql.createConnection(dbConfig);
      const query =
        "UPDATE users SET username = ?, email = ?, phoneNumber = ?, name = ?, image = ?, data = ?, roles = ? WHERE userId = ?";
      const values = [
        eventData.record.username,
        eventData.record.email,
        eventData.record.phoneNumber,
        eventData.record.name,
        eventData.record.image,
        JSON.stringify(eventData.record.data),
        eventData.record.roles ? JSON.stringify(eventData.record.roles) : null,
        userId,
      ];

      connection.connect();
      connection.query(query, values, (error, result) => {
        connection.end();
        if (error) {
          console.error("Error updating user information:", error);
          res
            .status(500)
            .send("Error al actualizar la información del usuario");
          return;
        }
        console.log("Información de usuario actualizada:", result);
        res.status(200).send("Webhook received successfully");
      });
    } catch (error) {
      console.error("Error handling Userfront webhook:", error);
      res.status(500).send("Error handling Userfront webhook");
    }
  } catch (error) {
    console.error("Error handling Userfront webhook:", error);
    res.status(500).send("Error handling Userfront webhook");
  }
});

app.post("/userfront/delete/webhook", async (req, res) => {
  try {
    const eventData = req.body; // Datos recibidos del webhook de Userfront
    console.log("esta es la info enviada", eventData);
    const userId = eventData.record.userId; // Obtén el ID del usuario eliminado

    // Realiza las operaciones necesarias, como desactivar la cuenta del usuario en tu base de datos
    try {
      const connection = mysql.createConnection(dbConfig);
      const query = "UPDATE users SET status = 0 WHERE userId = ?";
      const values = [userId];

      connection.connect();
      connection.query(query, values, (error, result) => {
        connection.end();
        if (error) {
          console.error("Error desactivando la cuenta del usuario:", error);
          res.status(500).send("Error al desactivar la cuenta del usuario");
          return;
        }
        console.log("Cuenta de usuario desactivada:", result);
        res.status(200).send("Webhook received successfully");
      });
    } catch (error) {
      console.error(
        "Error al manejar el webhook de eliminación de usuario de Userfront:",
        error
      );
      res
        .status(500)
        .send(
          "Error al manejar el webhook de eliminación de usuario de Userfront"
        );
    }
  } catch (error) {
    console.error(
      "Error al manejar el webhook de eliminación de usuario de Userfront:",
      error
    );
    res
      .status(500)
      .send(
        "Error al manejar el webhook de eliminación de usuario de Userfront"
      );
  }
});

// Ruta para obtener información del usuario desde Frontuser
app.get("/frontuser/:userId", async (req, res) => {
  const userId = req.params.userId;
  const token = process.env.FRONTUSER_API_TOKEN;

  try {
    const response = await fetch(
      `https://api.userfront.com/v0/tenants/vbqwm45b/users/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
    const todos = await getAllTodos();
    res.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Error fetching todos" });
  }
});

// Ruta POST para crear un nuevo todo
app.post("/todos", async (req, res) => {
  try {
    const { title } = req.body;
    const newTodo = await postTodo(title);
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
