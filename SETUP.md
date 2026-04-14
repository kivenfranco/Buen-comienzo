# Configuración del proyecto

## 1. Archivos necesarios en /public

Coloca estos archivos en la carpeta `/public`:

- `logo.png` → Logo de Buen Comienzo
- `CARTA_DE_AUTORIZACION.docx` → Carta de autorización para terceros

---

## 2. Configurar Google Sheets API

### Paso 1: Habilitar la API

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo o selecciona uno existente
3. Ve a **APIs & Services → Library**
4. Busca **Google Sheets API** y habilítala

### Paso 2: Crear Service Account

1. Ve a **APIs & Services → Credentials**
2. Click **Create Credentials → Service Account**
3. Dale un nombre descriptivo (ej: `buen-comienzo-sheets`)
4. Selecciona rol: **Editor** (o crea uno personalizado con permisos de lectura/escritura)
5. Click **Done**
6. En la lista de Service Accounts, click en el que creaste
7. Ve a la pestaña **Keys → Add Key → Create New Key → JSON**
8. Descarga el archivo JSON (guárdalo de forma segura, NO subir al repositorio)

### Paso 3: Compartir el Google Sheet

1. Abre el archivo JSON descargado y copia el valor de `client_email`
   (tiene formato: `nombre@proyecto.iam.gserviceaccount.com`)
2. Abre el Google Sheet
3. Click **Compartir** (arriba a la derecha)
4. Pega el email del Service Account
5. Dale permisos de **Editor**
6. Click **Enviar**

### Paso 4: Configurar variables de entorno

Copia `.env.local.example` a `.env.local` y llena los valores:

```bash
cp .env.local.example .env.local
```

Del archivo JSON del Service Account extrae:
- `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` → `GOOGLE_PRIVATE_KEY`

El `GOOGLE_SPREADSHEET_ID` ya está configurado: `17MlwQuAgBGFWJQBpSd7yAZZ3DHghc3uMIqNSTUU2Zf0`

El `GOOGLE_SHEET_NAME` es el nombre de la pestaña (ej: `Sheet1`, `Hoja1`, etc.)

---

## 3. Estructura de columnas esperada en el Google Sheet

| Columna | Descripción |
|---------|-------------|
| `identificacion_participante` | Número de documento (búsqueda principal) |
| `primer_nombre_participante` | Primer nombre |
| `segundo_nombre_participante` | Segundo nombre |
| `primer_apellido_participante` | Primer apellido |
| `segundo_apellido_participante` | Segundo apellido |
| `nombre_sede` | Nombre de la sede de entrega |
| `TIPO PAQUETE` | Tipo de paquete asignado |
| `HORA DE CITACION` | Hora de la cita |
| `confirmacion_asistencia` | Se crea automáticamente → valor: `CONFIRMÓ` |
| `fecha_confirmacion` | Se crea automáticamente → fecha/hora de consulta |

---

## 4. Instalar dependencias y correr en local

```bash
npm install
npm run dev
```

Abre: http://localhost:3000

---

## 5. Desplegar en Vercel

```bash
npx vercel login
npx vercel --prod
```

O conecta el repositorio desde [vercel.com](https://vercel.com) y agrega las variables de entorno en:
**Project Settings → Environment Variables**

Variables necesarias en Vercel:
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SPREADSHEET_ID`
- `GOOGLE_SHEET_NAME`

---

## 6. Preparación futura (WhatsApp / Twilio)

La estructura está lista para extender con:
- Columna `telefono` en el Sheet para envío de mensajes
- API Route `/app/api/whatsapp/route.ts`
- Integración con Twilio o Meta Business API
