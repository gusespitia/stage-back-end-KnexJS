import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import mysql from "mysql";
import cors from "cors"; // Importa el middleware cors
import path from "path"; // Importa el mÃ³dulo path
import multer from "multer"; // Importa multer para el almacenamiento de archivos
import { getUsers } from "./api/userController.js";
import {
  getAllTodos,
  getTodoById,
  postTodo,
  getAllPostsByUserId,
  createPost,
} from "./api/queries.js";

const app = express();
const PORT = process.env.PORT || 8020;
app.use(express.json());
app.use(bodyParser.json());
// Permitir solicitudes desde todos los orÃ­genes
app.use(cors());

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
// // Configurar el middleware CORS para permitir solicitudes desde http://localhost:5173
// // Middleware para habilitar CORS
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*"); // Permitir solicitudes desde cualquier origen
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });
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
// Ruta para obtener informaciÃ³n del usuario desde Frontuser
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

// Route to handle the webhook for user update from Userfront
app.post("/userfront/updated/webhook", (req, res) => {
  try {
    const eventData = req.body; // Data received from the Userfront webhook
    console.log("This is the info sent", eventData);
    const userId = eventData.record.userId; // Get the ID of the deleted user

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
          res.status(500).send("Error updating user information");
          return;
        }
        console.log("User information updated:", result);
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

// Route to handle the webhook for user deletion from Userfront
app.post("/userfront/delete/webhook", async (req, res) => {
  try {
    const eventData = req.body; // Data received from the Userfront webhook
    console.log("This is the info from userfront DELETE TASK", eventData);
    const userId = eventData.record.userId; // Get the ID of the deleted user

    // Perform necessary operations, such as deactivating the user account in your database
    try {
      const connection = mysql.createConnection(dbConfig);
      const query = "UPDATE users SET status = 0 WHERE userId = ?";
      const values = [userId];

      connection.connect();
      connection.query(query, values, (error, result) => {
        connection.end();
        if (error) {
          console.error("Error deactivating user account:", error);
          res.status(500).send("Error deactivating user account");
          return;
        }
        console.log("User account deactivated:", result);
        res.status(200).send("Webhook received successfully");
      });
    } catch (error) {
      console.error("Error handling Userfront user deletion webhook:", error);
      res.status(500).send("Error handling Userfront user deletion webhook");
    }
  } catch (error) {
    console.error("Error handling Userfront user deletion webhook:", error);
    res.status(500).send("Error handling Userfront user deletion webhook");
  }
});
// Crear una Ãºnica conexiÃ³n a la base de datos
const connection = mysql.createConnection(dbConfig);

// Ruta para manejar el webhook de creaciÃ³n de usuario desde Userfront
app.post("/userfront/webhook", async (req, res) => {
  try {
    if (!req.body || !req.body.record) {
      return res.status(400).send("Request does not contain new user data");
    }

    const newUser = req.body.record;
    console.log("This is the info for a NEW USER", JSON.stringify(newUser));

    // Realizar una solicitud GET a Userfront para obtener los roles del usuario reciÃ©n creado
    const userIdUser = newUser.userId;
    console.log(userIdUser);

    const userfrontResponse = await fetch(
      `https://back-end-knex-js.vercel.app/frontuser/${userIdUser}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer uf_live_admin_xbpwd96n_165cffc95b40532c917fd5fb59ce8260`,
        },
      }
    );

    if (!userfrontResponse.ok) {
      throw new Error("Error fetching user roles from Userfront");
    }

    // Extrae los roles del usuario de la respuesta
    const userData = await userfrontResponse.json();
    const roles =
      userData.authorization &&
      userData.authorization.xbpwd96n &&
      userData.authorization.xbpwd96n.roles
        ? userData.authorization.xbpwd96n.roles.join(",")
        : null;

    // Imprime el contenido de authorization en la consola
    console.log("Contenido de authorization:", userData.authorization);

    // Con los roles obtenidos, procede a guardar los datos del usuario en la base de datos
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
      roles, // Ahora roles es una cadena de texto en lugar de un JSON
    ];

    connection.connect();
    connection.query(query, values, (error, result) => {
      connection.end(); // Close the connection after using it
      if (error) {
        console.error("Error inserting new user into MySQL database:", error);
        res.status(500).send("Error saving new user data to the database");
        return;
      }
      console.log("New user created and saved to the database:", result);
      res
        .status(200)
        .send("New user data received and saved successfully to the database");
    });
  } catch (error) {
    console.error("Error handling Userfront webhook:", error);
    res.status(500).send("Error handling Userfront webhook");
  }
});

// FunciÃ³n para ejecutar una consulta a la base de datos utilizando una promesa
function executeQuery(query, values) {
  return new Promise((resolve, reject) => {
    connection.query(query, values, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

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
app.get("/todose/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const todo = await getTodoById(id);
    res.json(todo);
  } catch (error) {
    console.error("Error fetching todo:", error);
    res.status(500).json({ error: "Error fetching todo" });
  }
});

// Ruta para actualizar el rol de un usuario
app.put("/updateUserRole/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { roles } = req.body;

    const url = `https://api.userfront.com/v0/tenants/vbqwm45b/users/${userId}/roles`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer uf_test_admin_xbpwd96n_c9a7bff77e3d3552fca270f56c9b50ea",
      },
      body: JSON.stringify({ roles: roles }),
    });

    const responseData = await response.json();
    console.log(responseData);

    res
      .status(200)
      .json({ message: "User role updated successfully", data: responseData });
  } catch (error) {
    console.error("Error updating user role in Userfront:", error);
    res.status(500).json({ error: "Error updating user role in Userfront" });
  }
});

// Ruta para actualizar los datos de un usuario
app.put("/updateUser/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = req.body;

    const url = `https://api.userfront.com/v0/tenants/xbpwd96n/users/${userId}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer uf_test_admin_xbpwd96n_c9a7bff77e3d3552fca270f56c9b50ea",
      },
      body: JSON.stringify(userData),
    });

    const responseData = await response.json();
    console.log(responseData);

    res
      .status(200)
      .json({ message: "User data updated successfully", data: responseData });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ error: "Error updating user data" });
  }
});

// Ruta para actualizar los datos de un usuario
app.put("/findusers", async () => {
  const playload = {
    filters: {
      conjunction: "and",
      filterGroups: [
        {
          conjunction: "and",
          filters: [],
        },
      ],
    },
  };
  const response = await fetch(
    "https://api.userfront.com/v0/tenants/xbpwd96n/users/find",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer uf_test_admin_xbpwd96n_c9a7bff77e3d3552fca270f56c9b50ea",
      },
      body: JSON.stringify(playload),
    }
  );
  console.log(response.json());
});

// ALMACENAR IMAGENES
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("image"), (req, res) => {
  const imageUrl = "/images/" + req.file.filename;
  res.json({ imageUrl: imageUrl });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Ruta para obtener todos los posts de un usuario por ID
app.get("/users/posts/:userId", async (req, res) => {
  try {
    const userId = req.params.userId; // Obtiene el ID del usuario de los parámetros de la URL
    const posts = await getAllPostsByUserId(userId); // Llama a la función para obtener todos los posts de un usuario por ID
    res.json(posts); // Devuelve los posts como respuesta
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Error fetching posts" });
  }
});

// Ruta POST para crear un nuevo post

// Ruta POST para crear un nuevo post
app.post("/newposts", async (req, res) => {
  try {
    // Extraer los campos del cuerpo de la solicitud
    const { title, data, user_id } = req.body;

    // Llamar a la función para crear un nuevo post en la base de datos
    const newPost = await createPost(title, data, user_id);

    // Devolver el nuevo post creado como respuesta
    res.status(201).json(newPost);
  } catch (error) {
    // Manejar errores si ocurren durante el proceso de creación del post
    console.error("Error creating new Post:", error);
    res.status(500).json({ error: "Error creating new Post" });
  }
});
