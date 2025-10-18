-- Заполнение таблиц тестовыми данными для Grace Salon

-- 1. Создаем тестового пользователя
INSERT INTO "User" ("telegramId", "firstName", "lastName", "username", "phone", "isActive", "createdAt", "updatedAt") 
VALUES (123456789, 'Тестовый', 'Пользователь', 'testuser', '+7 (999) 123-45-67', true, NOW(), NOW());

-- 2. Создаем мастеров
INSERT INTO "Master" ("name", "specialization", "description", "photoUrl", "experience", "isActive", "createdAt", "updatedAt") 
VALUES 
('Анна Иванова', 'Мастер маникюра', 'Опытный мастер с 5-летним стажем. Специализируется на классическом и аппаратном маникюре.', 'https://via.placeholder.com/300x300/ec4899/ffffff?text=AI', 5, true, NOW(), NOW()),
('Мария Петрова', 'Мастер педикюра', 'Специалист по аппаратному педикюру с 3-летним опытом.', 'https://via.placeholder.com/300x300/ec4899/ffffff?text=MP', 3, true, NOW(), NOW()),
('Елена Смирнова', 'Мастер бровей', 'Специалист по коррекции и окрашиванию бровей.', 'https://via.placeholder.com/300x300/ec4899/ffffff?text=ES', 4, true, NOW(), NOW());

-- 3. Создаем услуги
INSERT INTO "Service" ("name", "description", "price", "duration", "category", "isActive", "createdAt", "updatedAt") 
VALUES 
('Маникюр классический', 'Классический маникюр с покрытием гель-лаком', 1500, 60, 'Маникюр', true, NOW(), NOW()),
('Педикюр аппаратный', 'Аппаратный педикюр с покрытием гель-лаком', 2000, 90, 'Педикюр', true, NOW(), NOW()),
('Коррекция бровей', 'Коррекция формы бровей воском', 800, 30, 'Брови', true, NOW(), NOW()),
('Окрашивание бровей', 'Окрашивание бровей краской', 1200, 45, 'Брови', true, NOW(), NOW());

-- 4. Связываем мастеров с услугами
INSERT INTO "MasterService" ("masterId", "serviceId", "createdAt", "updatedAt") 
VALUES 
(1, 1, NOW(), NOW()), -- Анна Иванова - Маникюр классический
(2, 2, NOW(), NOW()), -- Мария Петрова - Педикюр аппаратный
(3, 3, NOW(), NOW()), -- Елена Смирнова - Коррекция бровей
(3, 4, NOW(), NOW()); -- Елена Смирнова - Окрашивание бровей

-- 5. Создаем расписание мастеров
INSERT INTO "MasterSchedule" ("masterId", "dayOfWeek", "startTime", "endTime", "isWorking", "createdAt", "updatedAt") 
VALUES 
-- Анна Иванова (ID: 1)
(1, 1, '09:00', '18:00', true, NOW(), NOW()), -- Понедельник
(1, 2, '09:00', '18:00', true, NOW(), NOW()), -- Вторник
(1, 3, '09:00', '18:00', true, NOW(), NOW()), -- Среда
(1, 4, '09:00', '18:00', true, NOW(), NOW()), -- Четверг
(1, 5, '09:00', '18:00', true, NOW(), NOW()), -- Пятница
(1, 6, '10:00', '16:00', true, NOW(), NOW()), -- Суббота
-- Мария Петрова (ID: 2)
(2, 1, '09:00', '18:00', true, NOW(), NOW()),
(2, 2, '09:00', '18:00', true, NOW(), NOW()),
(2, 3, '09:00', '18:00', true, NOW(), NOW()),
(2, 4, '09:00', '18:00', true, NOW(), NOW()),
(2, 5, '09:00', '18:00', true, NOW(), NOW()),
(2, 6, '10:00', '16:00', true, NOW(), NOW()),
-- Елена Смирнова (ID: 3)
(3, 1, '09:00', '18:00', true, NOW(), NOW()),
(3, 2, '09:00', '18:00', true, NOW(), NOW()),
(3, 3, '09:00', '18:00', true, NOW(), NOW()),
(3, 4, '09:00', '18:00', true, NOW(), NOW()),
(3, 5, '09:00', '18:00', true, NOW(), NOW()),
(3, 6, '10:00', '16:00', true, NOW(), NOW());

-- 6. Создаем тестовую запись
INSERT INTO "Appointment" ("userId", "masterId", "serviceId", "appointmentDate", "notes", "totalPrice", "status", "createdAt", "updatedAt") 
VALUES (1, 1, 1, '2024-10-19 14:00:00', 'Тестовая запись', 1500, 'PENDING', NOW(), NOW());

-- 7. Создаем админа
INSERT INTO "Admin" ("telegramId", "firstName", "lastName", "username", "isActive", "createdAt", "updatedAt") 
VALUES (987654321, 'Админ', 'Системы', 'admin', true, NOW(), NOW());
