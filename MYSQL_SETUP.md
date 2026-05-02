# MySQL Setup

The app uses a local Node/Express API with MySQL.

## 1. Create the database tables

Run this SQL file in MySQL:

```bash
mysql -u root -p < database/schema.sql
```

Or open `database/schema.sql` in phpMyAdmin/MySQL Workbench and execute it.

## 2. Create local environment config

Copy `.env.example` to `.env`, then update the values for your machine:

```env
API_PORT=4000
CLIENT_URL=http://localhost:5173

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=ellectro_ma

ADMIN_EMAIL=admin@ellectro.ma
ADMIN_PASSWORD=admin123
JWT_SECRET=change-this-to-a-long-random-secret

VITE_API_URL=http://localhost:4000/api
```

## 3. Start both servers

Terminal 1:

```bash
npm run api
```

Terminal 2:

```bash
npm run dev
```

Then open:

```text
http://localhost:5173
```

## 4. Check database connection

Open:

```text
http://localhost:4000/api/health
```

You should see:

```json
{"ok":true,"database":"connected"}
```

## 5. Admin login

Use the values from `.env`:

```text
Email: admin@ellectro.ma
Password: admin123
```
