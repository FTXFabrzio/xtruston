# 📚 Documentación Completa - Sistema Virgy

## 🎯 Índice
1. [Flujo General del Sistema](#flujo-general)
2. [Arquitectura del Proyecto](#arquitectura)
3. [Cómo Funciona un Mensaje de WhatsApp](#mensaje-whatsapp)
4. [Configuración de Google Sheets](#google-sheets)
5. [Cómo Cambiar Textos](#cambiar-textos)
6. [Cómo Agregar Funciones a Flujos](#agregar-funciones)
7. [Variables de Entorno](#variables-entorno)

---

## 🔄 Flujo General del Sistema {#flujo-general}

### Paso a Paso: Desde que llega un mensaje hasta la respuesta

```
1. WhatsApp envía mensaje → POST /webhook/whatsapp
2. WhatsappController recibe el mensaje
3. WhatsappService procesa y transforma el mensaje
4. HandleIncomingMessageUseCase valida al usuario
5. ValidateResidentUseCase busca en Google Sheets
6. Si no encuentra, busca en MongoDB (solicitudes pendientes)
7. Según el estado del residente, devuelve una respuesta
8. WhatsappService envía la respuesta de vuelta
```

### Diagrama Visual

```
┌─────────────┐
│  WhatsApp   │
│   Mensaje   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│  WhatsappController             │
│  POST /webhook/whatsapp         │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  WhatsappService                │
│  handleIncomingMessage()        │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  HandleIncomingMessageUseCase   │
│  execute(message)               │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  ValidateResidentUseCase        │
│  execute(phoneNumber)           │
└──────┬──────────────────────────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ Google       │  │  MongoDB     │
│ Sheets       │  │  (Requests)  │
│ (Oficiales)  │  │  (Pendientes)│
└──────┬───────┘  └──────┬───────┘
       │                 │
       └────────┬────────┘
                │
                ▼
       ┌────────────────┐
       │ Resident       │
       │ encontrado?    │
       └────┬───────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌────────┐    ┌──────────┐
│  SÍ    │    │   NO     │
│        │    │          │
│ Estado?│    │ Menu No  │
└───┬────┘    │ Residente│
    │         └──────────┘
    │
    ├─ EN REVISION → Mensaje de espera
    ├─ ANULADO/RECHAZADO → Mensaje de rechazo
    └─ APROBADO → Menú de residente
```

---

## 🏗️ Arquitectura del Proyecto {#arquitectura}

El proyecto sigue **Clean Architecture** con 3 capas principales:

```
src/
├── domain/                    # Capa de Dominio (Reglas de negocio)
│   ├── entities/             # Entidades del negocio
│   │   ├── resident.entity.ts
│   │   ├── building.entity.ts
│   │   ├── claim.entity.ts
│   │   └── ...
│   └── repositories/         # Interfaces de repositorios
│       ├── resident.repository.interface.ts
│       └── ...
│
├── application/              # Capa de Aplicación (Casos de uso)
│   └── use-cases/
│       ├── messages/
│       │   └── handle-incoming-message.use-case.ts
│       ├── resident/
│       │   └── validate-resident.use-case.ts
│       ├── building/
│       ├── documents/
│       └── ...
│
└── infrastructure/           # Capa de Infraestructura (Implementaciones)
    ├── modules/
    │   ├── whatsapp/        # Módulo de WhatsApp
    │   ├── google-sheets/   # Módulo de Google Sheets
    │   └── google-drive/    # Módulo de Google Drive
    └── repositories/        # Implementaciones de repositorios
        ├── google-sheets-resident.repository.ts
        ├── mongo-claim.repository.ts
        └── ...
```

### ¿Qué hace cada capa?

- **Domain**: Define las reglas de negocio puras (entidades, interfaces)
- **Application**: Orquesta la lógica de negocio (casos de uso)
- **Infrastructure**: Implementa detalles técnicos (bases de datos, APIs externas)

---

## 📱 Cómo Funciona un Mensaje de WhatsApp {#mensaje-whatsapp}

### 1. Entrada del Mensaje

**Archivo**: `src/infrastructure/modules/whatsapp/whatsapp.controller.ts`

```typescript
@Post('whatsapp')
async receiveMessage(@Body() payload: WhatsappWebhookDto) {
  return this.whatsappService.handleIncomingMessage(payload);
}
```

**¿Qué hace?**
- Recibe el webhook de WhatsApp en `POST /webhook/whatsapp`
- El payload contiene: número de teléfono, mensaje, timestamp, etc.

---

### 2. Procesamiento del Mensaje

**Archivo**: `src/infrastructure/modules/whatsapp/whatsapp.service.ts`

```typescript
async handleIncomingMessage(payload: WhatsappWebhookDto) {
  // Transforma el payload de WhatsApp a formato interno
  const message = this.mapper.toInternalMessage(payload);
  
  // Llama al caso de uso
  return this.handleIncomingMessageUseCase.execute(message);
}
```

---

### 3. Validación del Residente

**Archivo**: `src/application/use-cases/messages/handle-incoming-message.use-case.ts`

```typescript
async execute(message: any): Promise<any> {
  const { from, body } = message;
  
  // 1. Valida si es residente
  const resident = await this.validateResident.execute(from);
  
  if (!resident) {
    return { type: 'NON_RESIDENT_MENU' };
  }
  
  // 2. Verifica el estado
  if (resident.status === 'EN REVISION') {
    return {
      type: 'TEXT',
      content: '¡Hola! 🕒 Aún estamos esperando...'
    };
  }
  
  if (resident.status === 'APROBADO') {
    return {
      type: 'RESIDENT_MENU',
      residentName: resident.name,
      building: resident.buildingCode,
      unit: resident.departmentUnit
    };
  }
}
```

---

### 4. Búsqueda en Google Sheets

**Archivo**: `src/application/use-cases/resident/validate-resident.use-case.ts`

```typescript
async execute(phoneNumber: string): Promise<Resident | null> {
  // 1. Busca en Google Sheets (lista oficial)
  const resident = await this.residentRepository.findByPhoneNumber(phoneNumber);
  if (resident) return resident;
  
  // 2. Busca en MongoDB (solicitudes pendientes)
  const request = await this.residentRequestRepository.findByPhoneNumber(phoneNumber);
  if (request && request.status === 'PENDING') {
    return new Resident(
      request.id,
      request.name,
      request.phoneNumber,
      request.unit,
      request.buildingCode,
      'EN REVISION'
    );
  }
  
  return null;
}
```

---

### 5. Implementación de Google Sheets

**Archivo**: `src/infrastructure/repositories/google-sheets-resident.repository.ts`

```typescript
async findByPhoneNumber(phoneNumber: string): Promise<Resident | null> {
  // 1. Lee el rango configurado
  const range = this.config.get<string>('GSHEETS_RANGE') ?? 'Sheet1!A:Z';
  const rows = await this.sheetsService.getRows(range);
  
  // 2. Obtiene los headers configurables
  const phoneHeader = this.config.get('GSHEETS_PHONE_HEADER') ?? 'celular';
  const nameHeader = this.config.get('GSHEETS_NAME_HEADER') ?? 'nombre';
  
  // 3. Busca el teléfono normalizado
  const normalizedTarget = this.normalizePhone(phoneNumber);
  
  for (const row of dataRows) {
    if (this.normalizePhone(row[phoneIdx]) === normalizedTarget) {
      return new Resident(
        row[phoneIdx],
        row[nameIdx],
        row[phoneIdx],
        row[unitIdx],
        'DEFAULT_BUILDING',
        status
      );
    }
  }
  
  return null;
}
```

---

## 📊 Configuración de Google Sheets {#google-sheets}

### ¿Dónde cambiar el Spreadsheet ID?

**Archivo**: `.env`

```env
# ID del documento de Google Sheets
GSHEETS_SPREADSHEET_ID=1ABC123XYZ456...

# Rango de lectura (hoja y columnas)
GSHEETS_RANGE=Sheet1!A:Z
```

### ¿Cómo obtener el Spreadsheet ID?

1. Abre tu Google Sheet
2. Mira la URL: `https://docs.google.com/spreadsheets/d/1ABC123XYZ456.../edit`
3. El ID es: `1ABC123XYZ456...`

---

### ¿Cómo cambiar a otra hoja dentro del mismo documento?

**Opción 1**: Cambiar el rango en `.env`

```env
# Antes
GSHEETS_RANGE=Sheet1!A:Z

# Después (usar hoja "Residentes2024")
GSHEETS_RANGE=Residentes2024!A:Z
```

**Opción 2**: Cambiar solo las columnas

```env
# Leer solo columnas A hasta F
GSHEETS_RANGE=Sheet1!A:F

# Leer desde la fila 2 (saltar header)
GSHEETS_RANGE=Sheet1!A2:Z
```

---

### ¿Cómo configurar los nombres de las columnas?

Si tu hoja tiene diferentes nombres de columnas, configúralos en `.env`:

```env
# Nombres de las columnas en tu Google Sheet
GSHEETS_PHONE_HEADER=celular        # Columna del teléfono
GSHEETS_NAME_HEADER=nombre          # Columna del nombre
GSHEETS_UNIT_HEADER=departamento    # Columna del departamento
GSHEETS_BUILDING_HEADER=edificio    # Columna del edificio
GSHEETS_STATUS_HEADER=estado        # Columna del estado
```

**Ejemplo**: Si tu hoja tiene columnas en inglés:

```env
GSHEETS_PHONE_HEADER=phone
GSHEETS_NAME_HEADER=full_name
GSHEETS_UNIT_HEADER=apartment
GSHEETS_STATUS_HEADER=status
```

---

### ¿Cómo configurar las credenciales de Google?

**Opción 1**: JSON completo (recomendado)

```env
GSHEETS_CREDENTIALS_JSON={"type":"service_account","project_id":"...","private_key":"..."}
```

**Opción 2**: Archivo de credenciales

```env
GSHEETS_KEY_FILE=C:\\ruta\\a\\service-account.json
```

**Opción 3**: Email y clave separados

```env
GSHEETS_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GSHEETS_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

---

## ✏️ Cómo Cambiar Textos {#cambiar-textos}

### Mensajes de Estado del Residente

**Archivo**: `src/application/use-cases/messages/handle-incoming-message.use-case.ts`

```typescript
// Mensaje para estado "EN REVISION"
if (resident.status === 'EN REVISION') {
  return {
    type: 'TEXT',
    content: `¡Hola! 🕒 Aún estamos esperando la confirmación de tu administrador para activar tu cuenta. Te avisaré por aquí apenas esté listo. ¡Gracias por tu paciencia! ✨`
  };
}

// Mensaje para estado "ANULADO" o "RECHAZADO"
if (resident.status === 'ANULADO' || resident.status === 'RECHAZADO') {
  return {
    type: 'TEXT',
    content: `Lo siento, luego de consultar con el administrador hemos anulado tu solicitud. Por favor, comunícate con él para más detalles. ✋`
  };
}
```

**Para cambiar estos textos:**
1. Abre el archivo mencionado
2. Busca la sección correspondiente
3. Modifica el texto dentro de `content: "..."`
4. Guarda el archivo
5. Reinicia el servidor

---

### Ejemplo: Cambiar mensaje de "EN REVISION"

**Antes:**
```typescript
content: `¡Hola! 🕒 Aún estamos esperando la confirmación...`
```

**Después:**
```typescript
content: `Hola ${resident.name}, tu solicitud está siendo revisada. Te notificaremos pronto.`
```

---

## 🔧 Cómo Agregar Funciones a Flujos {#agregar-funciones}

### Caso 1: Agregar una nueva opción al menú de residente

**Archivo**: `src/application/use-cases/messages/handle-incoming-message.use-case.ts`

**Paso 1**: Agregar la lógica en el caso de uso

```typescript
async execute(message: any): Promise<any> {
  const { from, body } = message;
  const resident = await this.validateResident.execute(from);
  
  if (!resident) {
    return { type: 'NON_RESIDENT_MENU' };
  }
  
  if (resident.status === 'APROBADO') {
    // Detectar qué opción eligió el usuario
    if (body === '1') {
      return { type: 'PAYMENT_INFO' };
    }
    
    if (body === '2') {
      return { type: 'DOCUMENTS' };
    }
    
    // ✨ NUEVA OPCIÓN: Ver estado de cuenta
    if (body === '3') {
      return await this.getAccountStatus(resident);
    }
    
    // Menú principal
    return {
      type: 'RESIDENT_MENU',
      residentName: resident.name,
      building: resident.buildingCode,
      unit: resident.departmentUnit
    };
  }
}

// ✨ NUEVA FUNCIÓN
private async getAccountStatus(resident: Resident) {
  // Aquí puedes consultar otra fuente de datos
  const balance = await this.getBalance(resident.id);
  
  return {
    type: 'TEXT',
    content: `Tu saldo actual es: $${balance}`
  };
}
```

---

### Caso 2: Crear un nuevo caso de uso

**Paso 1**: Crear el archivo del caso de uso

**Archivo**: `src/application/use-cases/resident/get-account-balance.use-case.ts`

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { IResidentRepository } from '../../../domain/repositories/resident.repository.interface';

@Injectable()
export class GetAccountBalanceUseCase {
  constructor(
    @Inject('IResidentRepository')
    private readonly residentRepository: IResidentRepository,
  ) {}

  async execute(residentId: string): Promise<number> {
    // Lógica para obtener el balance
    // Puede ser desde Google Sheets, MongoDB, API externa, etc.
    const resident = await this.residentRepository.findById(residentId);
    
    // Por ahora retornamos un valor de ejemplo
    return 1500.00;
  }
}
```

**Paso 2**: Registrar el caso de uso en el módulo

**Archivo**: `src/application/application.module.ts`

```typescript
import { GetAccountBalanceUseCase } from './use-cases/resident/get-account-balance.use-case';

@Module({
  imports: [RepositoriesModule],
  providers: [
    HandleIncomingMessageUseCase,
    ValidateResidentUseCase,
    GetAccountBalanceUseCase,  // ✨ Agregar aquí
  ],
  exports: [
    HandleIncomingMessageUseCase,
    ValidateResidentUseCase,
    GetAccountBalanceUseCase,  // ✨ Agregar aquí
  ],
})
export class ApplicationModule {}
```

**Paso 3**: Inyectar en el caso de uso principal

**Archivo**: `src/application/use-cases/messages/handle-incoming-message.use-case.ts`

```typescript
import { GetAccountBalanceUseCase } from '../resident/get-account-balance.use-case';

@Injectable()
export class HandleIncomingMessageUseCase {
  constructor(
    private readonly validateResident: ValidateResidentUseCase,
    private readonly getAccountBalance: GetAccountBalanceUseCase,  // ✨ Inyectar
  ) {}

  async execute(message: any): Promise<any> {
    // ... código existente ...
    
    if (body === '3') {
      const balance = await this.getAccountBalance.execute(resident.id);
      return {
        type: 'TEXT',
        content: `Tu saldo es: $${balance}`
      };
    }
  }
}
```

---

### Caso 3: Agregar validación personalizada

**Archivo**: `src/application/use-cases/messages/handle-incoming-message.use-case.ts`

```typescript
async execute(message: any): Promise<any> {
  const { from, body } = message;
  
  // ✨ VALIDACIÓN PERSONALIZADA: Solo permitir horario de oficina
  const now = new Date();
  const hour = now.getHours();
  
  if (hour < 8 || hour > 18) {
    return {
      type: 'TEXT',
      content: 'Nuestro horario de atención es de 8:00 AM a 6:00 PM. Por favor, intenta más tarde.'
    };
  }
  
  // Continúa con el flujo normal
  const resident = await this.validateResident.execute(from);
  // ...
}
```

---

## 🔐 Variables de Entorno {#variables-entorno}

### Archivo `.env` - Configuración Completa

```env
#===========================================
# SERVIDOR
#===========================================
PORT=3000
NODE_ENV=development

#===========================================
# BASE DE DATOS - MONGODB
#===========================================
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/virgy

#===========================================
# AUTENTICACIÓN (si se usa JWT)
#===========================================
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=1d

#===========================================
# GOOGLE SHEETS - RESIDENTES
#===========================================
# ID del documento de Google Sheets
GSHEETS_SPREADSHEET_ID=1ABC123XYZ456...

# Rango de lectura (hoja y columnas)
GSHEETS_RANGE=Sheet1!A:Z

# Nombres de las columnas en tu hoja
GSHEETS_PHONE_HEADER=celular
GSHEETS_NAME_HEADER=nombre
GSHEETS_UNIT_HEADER=departamento
GSHEETS_BUILDING_HEADER=edificio
GSHEETS_STATUS_HEADER=estado

# Tiempo de caché (en milisegundos)
GSHEETS_CACHE_TTL_MS=30000

# Credenciales de Google (elige UNA opción)
# Opción 1: JSON completo
GSHEETS_CREDENTIALS_JSON={"type":"service_account","project_id":"..."}

# Opción 2: Archivo de credenciales
# GSHEETS_KEY_FILE=C:\\ruta\\a\\service-account.json

# Opción 3: Email y clave separados
# GSHEETS_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
# GSHEETS_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n

#===========================================
# GOOGLE DRIVE - DOCUMENTOS
#===========================================
GDRIVE_FOLDER_ID=1XYZ789...
GDRIVE_CREDENTIALS_JSON={"type":"service_account",...}

#===========================================
# WHATSAPP (si usas API de WhatsApp Business)
#===========================================
WHATSAPP_API_TOKEN=tu_token_de_whatsapp
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_VERIFY_TOKEN=tu_token_de_verificacion
```

---

## 🚀 Comandos Útiles

### Desarrollo
```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo (con hot-reload)
npm run start:dev

# Compilar el proyecto
npm run build

# Iniciar en producción
npm run start:prod
```

### Testing
```bash
# Ejecutar tests
npm run test

# Tests con cobertura
npm run test:cov
```

---

## 📝 Checklist de Personalización

### ✅ Configuración Inicial
- [ ] Copiar `.env.example` a `.env`
- [ ] Configurar `MONGO_URI` con tu base de datos
- [ ] Configurar `GSHEETS_SPREADSHEET_ID` con tu hoja
- [ ] Configurar `GSHEETS_CREDENTIALS_JSON` con tus credenciales
- [ ] Verificar nombres de columnas en `GSHEETS_*_HEADER`

### ✅ Personalización de Textos
- [ ] Modificar mensajes en `handle-incoming-message.use-case.ts`
- [ ] Ajustar textos de error y validación
- [ ] Personalizar nombres de opciones del menú

### ✅ Agregar Funcionalidades
- [ ] Crear nuevos casos de uso en `src/application/use-cases/`
- [ ] Registrar casos de uso en `application.module.ts`
- [ ] Actualizar lógica en `handle-incoming-message.use-case.ts`

---

## 🆘 Troubleshooting

### Error: "Cannot find module"
**Solución**: Verifica que las rutas de importación sean correctas y que el archivo exista.

### Error: "MONGO_URI is undefined"
**Solución**: Asegúrate de que el archivo `.env` existe y tiene la variable `MONGO_URI`.

### Error: "Google Sheets not initialized"
**Solución**: Verifica que `GSHEETS_CREDENTIALS_JSON` y `GSHEETS_SPREADSHEET_ID` estén configurados correctamente.

### Los cambios no se reflejan
**Solución**: Reinicia el servidor con `Ctrl+C` y luego `npm run start:dev`.

---

## 📞 Contacto y Soporte

Si tienes dudas o necesitas ayuda:
1. Revisa esta documentación
2. Verifica los logs del servidor
3. Consulta el código fuente con comentarios

---

**Última actualización**: 2026-01-09
**Versión**: 1.0.0
