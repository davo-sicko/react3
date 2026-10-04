const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Pool } = require("pg");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

pool.on("connect", () => {
  console.log("Подключение к PostgreSQL установлено!");
});

pool.on("error", (err) => {
  console.log("Ошибка подключения к PostgreSQL: ", err);
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API работает!", timestamp: new Date() });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");
    res.json({
      message: "Подключение к БД работает!",
      current_time: result.rows[0].current_time,
    });
  } catch (error) {
    console.error("Ошибка теста БД: ", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/services", async (req, res) => {
  try {
    const query = `
      SELECT s.*, c.name AS category_name
      FROM services s
      JOIN categories c ON s.category_id = c.category_id
      ORDER BY s.service_id ASC
    `;
    const result = await pool.query(query);
    console.log(`Найдено услуг: ${result.rows.length}`);
    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка запроса services:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/categories", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM categories ORDER BY category_id ASC"
    );
    console.log(`Найдено категорий: ${result.rows.length}`);
    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка запроса categories:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/categories", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ message: "Название категории не может быть пустым" });
    }

    const result = await pool.query(
      `INSERT INTO categories(name) VALUES ($1) RETURNING *`,
      [name.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка добавления категории: ", error);
    res
      .status(500)
      .json({ message: "Ошибка сервера при добавлении категории" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Заполните email и пароль!" });
    }

    const result = await pool.query(
      `SELECT u.user_id, u.role_id, u.email, u.password, u.discount_coupon, u.discount_percent, r.name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0 || result.rows[0].password !== password) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    const user = result.rows[0];
    delete user.password;
    res.json(user);
  } catch (error) {
    console.error("Ошибка при входе:", error);
    res.status(500).json({ message: "Ошибка сервера при авторизации" });
  }
});

app.patch("/api/users/discount", async (req, res) => {
  try {
    const { email, discount_coupon, discount_percent } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET discount_coupon = $1, discount_percent = $2 
       WHERE email = $3 
       RETURNING user_id, email, discount_coupon, discount_percent`,
      [discount_coupon, discount_percent, email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка обновления купона: ", error);
    res
      .status(500)
      .json({ message: "Ошибка сервера при обновлении скидки" });
  }
});

app.patch("/api/services/:id/discount", async (req, res) => {
  try {
    const { id } = req.params;
    const { has_discount, discount_percent } = req.body;

    const result = await pool.query(
      `UPDATE services 
       SET has_discount = $1, discount_percent = $2 
       WHERE service_id = $3 RETURNING *`,
      [has_discount, discount_percent || 0, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка обновления скидки услуги:", error);
    res.status(500).json({ error: error.message });
  }
});


app.post("/api/appointments", async (req, res) => {
  try {
    const { user_id, service_id, amount, notes } = req.body;

    const appResult = await pool.query(
      `INSERT INTO appointments (user_id, service_id, appointment_date, appointment_time, notes, status)
       VALUES ($1, $2, CURRENT_DATE, CURRENT_TIME, $3, 'scheduled') RETURNING *`,
      [user_id, service_id, notes || "Заказ футбольной экипировки"]
    );

    await pool.query(
      `INSERT INTO payments (appointment_id, user_id, amount, status)
       VALUES ($1, $2, $3, 'completed')`,
      [appResult.rows[0].appointment_id, user_id, amount]
    );

    res.status(201).json({ message: "Запись и оплата успешно оформлены" });
  } catch (error) {
    console.error("Ошибка создания заказа: ", error);
    res.status(500).json({ error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log(`1) Каталог услуг: http://localhost:${PORT}/api/services`);
  console.log(`2) Категории: http://localhost:${PORT}/api/categories`);
  console.log(`3) Тест БД: http://localhost:${PORT}/api/test-db`);
});