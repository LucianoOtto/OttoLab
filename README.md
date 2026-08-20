# Backend — Catálogo de Impresión 3D

API REST en Node + Express + Postgres para un catálogo de productos de impresión 3D.
Sin pago online: los clientes consultan por email a través de un formulario de contacto
(usando Brevo para el envío).

## Estructura

```
back/
├── db/
│   ├── schema.sql        # Crea las tablas
│   └── seed-admin.js     # Crea tu primer usuario admin
├── src/
│   ├── config/           # Conexión a Postgres y cliente de Brevo
│   ├── controllers/      # Lógica de cada endpoint
│   ├── middlewares/      # Auth (JWT), roles, manejo de errores
│   ├── models/           # Queries SQL a la base de datos
│   ├── routes/           # Definición de rutas
│   ├── utils/            # JWT y envío de emails
│   └── app.js            # Configuración de Express
├── index.js               # Punto de entrada
└── .env.example
```

## Puesta en marcha

1. Instalar dependencias:
   ```
   npm install
   ```

2. Copiar `.env.example` a `.env` y completar los valores (datos de Postgres,
   `JWT_SECRET`, y las credenciales de Brevo: `BREVO_API_KEY`, `EMAIL_FROM`,
   `CONTACT_RECEIVER_EMAIL`).

3. Crear la base de datos en Postgres (si todavía no existe) y correr el schema:
   ```
   psql -U tu_usuario -d impresion3d -f db/schema.sql
   ```

4. Crear tu usuario admin:
   ```
   npm run seed:admin -- "Tu Nombre" tu@email.com tuContraseñaSegura
   ```

5. Levantar el servidor en desarrollo:
   ```
   npm run dev
   ```

## Autenticación

- `POST /api/auth/login` — envía `{ email, password }`, devuelve un JWT.
- Ese token se manda en cada request protegido como header:
  `Authorization: Bearer <token>`
- Roles disponibles: `admin` (todo, incluido borrar) y `editor` (crear/editar,
  no borrar). Se asignan en la tabla `users`.

## Endpoints

### Productos (público en lectura, admin/editor para escribir)
- `GET /api/products` — lista productos. Filtros: `?category=slug&search=texto`.
  Un visitante anónimo solo ve productos `active = true`; el admin logueado ve todos.
- `GET /api/products/:id`
- `POST /api/products` *(auth)*
- `PUT /api/products/:id` *(auth)*
- `DELETE /api/products/:id` *(auth, solo admin)*

### Categorías (público en lectura)
- `GET /api/categories`
- `POST /api/categories` *(auth)*
- `PUT /api/categories/:id` *(auth)*
- `DELETE /api/categories/:id` *(auth, solo admin)*

### Contacto (formulario público + bandeja de entrada admin)
- `POST /api/contact` — público. Body: `{ name, email, phone?, subject?, message, product_id? }`.
  Guarda el mensaje en la base y te manda un email por Brevo (más una confirmación
  automática a quien escribió).
- `GET /api/contact` *(auth)* — lista mensajes. Filtro: `?status=nuevo|leido|respondido`.
- `PATCH /api/contact/:id/status` *(auth)* — Body: `{ status }`.

## Notas

- Saqué del `package.json` original `nodemailer`, `resend` y `qrcode` porque no se usan
  en este flujo (elegiste Brevo, y no hay caso de uso para QR en un catálogo sin pago).
  Si después los necesitás para algo puntual, se agregan sin problema.
- `bcrypt` se usa para hashear contraseñas de usuarios admin/editor.
- `uuid` quedó instalado por si querés nombres de archivo únicos al subir imágenes de
  productos más adelante (no se usa todavía porque no armamos upload de imágenes).