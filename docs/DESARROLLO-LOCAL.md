# Configuración de Entorno de Desarrollo

Este documento describe la configuración específica para el entorno de desarrollo local.
**IMPORTANTE**: Estas configuraciones NO se usan en producción (AWS).

## 🔧 Ngrok para Testing Local

### ¿Por qué usar ngrok?
WhatsApp Cloud API necesita un webhook público (HTTPS) para enviar mensajes. En desarrollo local, usamos ngrok para exponer nuestro servidor local al internet.

### Setup de ngrok

1. **Instalar ngrok**: https://ngrok.com/download
2. **Autenticar ngrok** (necesario para evitar página de advertencia):
   ```bash
   ngrok config add-authtoken TU_TOKEN_AQUI
   ```
3. **Iniciar túnel**:
   ```bash
   ngrok http 3000
   ```
4. **Copiar la URL generada** (ej: `https://xxxxx.ngrok-free.dev`)

### Configurar en .env

Actualiza las siguientes variables en tu archivo `.env`:

```env
# SOLO PARA DESARROLLO - NO usar en producción
WHATSAPP_WEBHOOK_URL=https://xxxxx.ngrok-free.dev/webhook/whatsapp
BASE_URL=https://xxxxx.ngrok-free.dev
```

### Configurar en Meta Developer Console

1. Ve a: https://developers.facebook.com/apps/
2. Selecciona tu app → WhatsApp → Configuration
3. En "Webhooks":
   - **URL de devolución de llamada**: Tu URL de ngrok + `/webhook/whatsapp`
   - **Token de verificación**: El valor de `WHATSAPP_VERIFY_TOKEN` de tu `.env`
4. Suscríbete a los eventos:
   - ✅ `messages`

## 🌐 Configuración de Producción (AWS)

Cuando despliegues a AWS, simplemente:

1. **Cambia las variables de entorno**:
   ```env
   # PRODUCCIÓN
   WHATSAPP_WEBHOOK_URL=https://tu-dominio-aws.com/webhook/whatsapp
   BASE_URL=https://tu-dominio-aws.com
   ```

2. **NO necesitas cambiar código** - El mismo código funciona en ambos entornos.

3. **Actualiza el webhook en Meta** con tu nueva URL de AWS.

## ⚠️ Notas Importantes

- **ngrok SOLO para desarrollo** - Las URLs de ngrok cambian cada vez que reinicias (a menos que uses plan pago)
- **WhatsApp bypass automático** - La API de WhatsApp automáticamente bypasea la página de advertencia de ngrok
- **No commitear .env** - Nunca subas tu archivo `.env` al repositorio

## 🔐 Variables de Entorno Requeridas

```env
# Server
PORT=3000
NODE_ENV=development  # Cambiar a 'production' en AWS

# WhatsApp Cloud API
WHATSAPP_VERSION=v24.0
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=tu_business_account_id
WHATSAPP_ACCESS_TOKEN=tu_access_token
WHATSAPP_VERIFY_TOKEN=tu_verify_token_secreto

# Webhook (cambia según entorno)
WHATSAPP_WEBHOOK_URL=https://xxxxx.ngrok-free.dev/webhook/whatsapp  # dev
# WHATSAPP_WEBHOOK_URL=https://api.tudominio.com/webhook/whatsapp   # prod
BASE_URL=https://xxxxx.ngrok-free.dev                               # dev
# BASE_URL=https://api.tudominio.com                                # prod
```

## 🚀 Comandos Útiles

```bash
# Iniciar app en desarrollo
npm run start:dev

# Iniciar ngrok
ngrok http 3000

# Ver logs de ngrok
# Abre http://localhost:4040 en tu navegador

# Matar procesos en puerto 3000 (Windows)
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
```
