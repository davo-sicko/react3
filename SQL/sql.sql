DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 1. Таблица ролей
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Таблица пользователей
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    role_id INT NOT NULL REFERENCES roles(role_id) ON DELETE RESTRICT,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    discount_coupon VARCHAR(50),
    discount_percent INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Таблица категорий
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- 4. Таблица услуг 
CREATE TABLE services (
    service_id SERIAL PRIMARY KEY,
    category_id INT NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    duration INT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    has_discount BOOLEAN DEFAULT FALSE,
    discount_percent INT DEFAULT 0
);

-- 5. Таблица записей
CREATE TABLE appointments (
    appointment_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    service_id INT NOT NULL REFERENCES services(service_id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Таблица платежей
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    appointment_id INT NOT NULL REFERENCES appointments(appointment_id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Вставка ролей
INSERT INTO roles (name) VALUES 
('admin'), 
('client');

-- 8. Вставка пользователей
INSERT INTO users (role_id, email, password, discount_coupon, discount_percent) VALUES
(1, 'isip_d.e.isahanyan@mpt.ru', '123', NULL, 0),
(2, 'isip_t.a.hrustalev@mpt.ru', '123', 'GOLDENBOOT10', 10),
(2, 'isip_d.v.lozovoy@mpt.ru', '123', 'CHAMPION20', 20),
(2, 'isip_k.a.sinegribov@mpt.ru', '123', NULL, 0);

-- 9. Вставка категорий
INSERT INTO categories (name) VALUES
('Кастомизация формы'),
('Сервис бутс и шипов'),
('Вратарская экипировка'),
('Персональный подбор и VIP');

-- 10. Вставка услуг
INSERT INTO services (category_id, name, description, duration, price, has_discount, discount_percent) VALUES
(1, 'Нанесение фамилии и номера (Шрифт РПЛ/Евро)', 'Термоперенос официального клубного шрифта на игровую футболку', 25, 1200.00, FALSE, 0),
(1, 'Установка патчей турниров (UEFA / РПЛ)', 'Приварка нарукавных шевронов Лиги Чемпионов или Чемпионата', 15, 800.00, TRUE, 15),
(1, 'Индивидуальный дизайн клубной нашивки', 'Разработка и нанесение уникального логотипа команды', 40, 2200.00, FALSE, 0),
(2, 'Термоформовка бутс под стопу', 'Разогрев в печи и анатомическая посадка обуви под стопу игрока', 35, 2500.00, FALSE, 0),
(2, 'Замена и смазка шипов (SG / гибриды)', 'Демонтаж старых шипов, чистка резьбы и установка комплекта шипов', 20, 950.00, TRUE, 20),
(2, 'Растяжка бутс в проблемных зонах', 'Механическая точечная коррекция ширины колодки', 30, 1400.00, FALSE, 0),
(3, 'Глубокая чистка и восстановление латекса перчаток', 'Бережное мытье спецсоставом и нанесение активатора сцепления', 45, 1900.00, FALSE, 0),
(3, 'Установка защитных пластин на пальцы (Spines)', 'Индивидуальный монтаж жестких суппортов в перчатки', 30, 1500.00, TRUE, 10),
(4, 'Бронирование VIP-примерочной с экипировщиком', 'Индивидуальный подбор комплекта формы на сезон с персональным менеджером', 60, 3000.00, FALSE, 0),
(4, 'Тестирование бутс на мини-газоне в шоуруме', 'Тест-драйв разных типов подошвы (FG, AG, TF) перед покупкой', 30, 1000.00, FALSE, 0);

-- 11. Вставка записей
INSERT INTO appointments (user_id, service_id, appointment_date, appointment_time, status, notes) VALUES
(2, 1, '2026-10-05', '14:00:00', 'completed', 'Нанести номер 7 и Ronaldo'),
(2, 2, '2026-10-10', '16:30:00', 'scheduled', 'Патч Лиги Чемпионов на рукав'),
(3, 4, '2026-10-06', '12:00:00', 'scheduled', 'Формовка бутс');

-- 12. Вставка платежей
INSERT INTO payments (appointment_id, user_id, amount, status) VALUES
(1, 2, 1200.00, 'completed');