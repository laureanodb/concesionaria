# Automotores Laureano

Web pública y panel de administración de la concesionaria.

- **Web pública**: portada con destacados, catálogo con filtros y ficha de cada vehículo con botón de WhatsApp.
- **Panel** (`/admin`): stock (alta, edición, baja, estados, publicar u ocultar), carga de fotos y usuarios con roles.

## Tecnologías

Next.js 16 (App Router, TypeScript), Tailwind CSS 4, Prisma 7 y SQLite (en desarrollo).

## Cómo correrlo en tu compu

Requisito: [Node.js](https://nodejs.org) 20 o superior.

```bash
npm install
cp .env.example .env      # completá SESSION_SECRET (el comando para generarla está en el archivo)
npm run db:setup          # crea la base de datos, el usuario admin y autos de ejemplo
npm run dev
```

- Web: http://localhost:3000
- Panel: http://localhost:3000/admin. Entrás con `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` del `.env`. **Cambiá esa contraseña.**

## Comandos útiles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta el sitio en modo desarrollo |
| `npm run build` / `npm start` | Compila y corre la versión de producción |
| `npm test` | Corre los tests |
| `npm run lint` / `npm run typecheck` | Revisa el código |
| `npm run db:migrate` | Crea una migración después de cambiar `prisma/schema.prisma` |
| `npm run db:studio` | Abre un editor visual de la base de datos |

## Estructura

```
prisma/                 esquema, migraciones y datos iniciales (seed)
src/app/(sitio)/        web pública: portada, catálogo (/autos) y ficha (/autos/[slug])
src/app/admin/          panel: login, resumen, stock, carga y edición, usuarios
src/app/admin/actions/  acciones del servidor (guardar, borrar, subir fotos…)
src/app/api/fotos/      sirve las fotos subidas
src/lib/                base de datos, sesión, validaciones, consultas y formatos
src/proxy.ts            protege las rutas /admin
```

## Notas

- Lo que se muestra en la web pública queda en caché y se actualiza solo cada vez que se modifica el stock desde el panel.
- Los autos **vendidos** o **no publicados** no aparecen en la web.
- Las fotos se guardan en la carpeta `uploads/`, y la base de datos en `prisma/dev.db`. Ninguna de las dos se sube a git.

## Para publicarla (más adelante)

1. Base de datos: pasar a PostgreSQL (por ejemplo Neon, que tiene plan gratis). Hay que cambiar `provider` en el esquema y usar `@prisma/adapter-pg`.
2. Fotos: guardarlas en Vercel Blob o Cloudinary. Solo cambia `src/lib/storage.ts`.
3. Deploy en Vercel, cargando las variables del `.env`.
