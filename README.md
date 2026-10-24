# Automotores Laureano

Web pública y panel de administración de la concesionaria.

- **Web pública**: portada con destacados, catálogo con filtros, ficha de cada vehículo con WhatsApp y formulario de consulta o test drive, y página de contacto.
- **Panel** (`/admin`):
  - **Consultas**: bandeja de lo que llega por la web, más las que se cargan a mano. Tienen estado, vendedor asignado y notas.
  - **Clientes**: ficha con datos e historial de consultas y compras.
  - **Ventas**: registro de cada operación (precio final, forma de pago, usado recibido) y totales por mes.
  - **Stock**: alta, edición y baja de autos, estados, publicar u ocultar, y fotos.
  - **Usuarios**: roles de administrador y vendedor.

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

## Cómo funciona el circuito comercial

1. Un cliente deja una consulta o pide un test drive desde la web. Aparece en **Consultas** como *Nueva* y el menú muestra cuántas hay sin atender.
2. El vendedor la abre, responde por WhatsApp con un clic (el mensaje ya viene armado), la marca como *Contactada* y anota el seguimiento.
3. Con **Crear ficha de cliente**, la persona queda registrada. Si ya existía (mismo email, o mismo teléfono y nombre), se reutiliza su ficha.
4. **Registrar venta** marca el auto como *Vendido*, lo saca de la web y cierra las consultas abiertas de ese cliente por ese auto.
5. Si hubo un error, un administrador puede **anular la venta** y el auto vuelve a estar disponible.

Permisos: los vendedores ven y trabajan todo, pero solo un administrador puede eliminar consultas o clientes, anular ventas y gestionar usuarios.

## Notas

- Lo que se muestra en la web pública queda en caché y se actualiza solo cada vez que se modifica el stock desde el panel.
- Los autos **vendidos** o **no publicados** no aparecen en la web.
- El formulario público tiene protección básica contra spam: un campo trampa y un máximo de 5 consultas cada 10 minutos por conexión.
- Los teléfonos se guardan solo con números. Los links de WhatsApp agregan el 549 automáticamente a los celulares argentinos.
- Las fotos se guardan en la carpeta `uploads/`, y la base de datos en `prisma/dev.db`. Ninguna de las dos se sube a git.

## Para publicarla (más adelante)

1. Base de datos: pasar a PostgreSQL (por ejemplo Neon, que tiene plan gratis). Hay que cambiar `provider` en el esquema y usar `@prisma/adapter-pg`.
2. Fotos: guardarlas en Vercel Blob o Cloudinary. Solo cambia `src/lib/storage.ts`.
3. Deploy en Vercel, cargando las variables del `.env`.
