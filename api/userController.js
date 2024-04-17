// userController.js

import connectToDatabase from "./db.js";

async function getUsers() {
  try {
    const connection = await connectToDatabase();
    const [rows, fields] = await connection.query("SELECT * FROM users");
    return rows;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export { getUsers };
