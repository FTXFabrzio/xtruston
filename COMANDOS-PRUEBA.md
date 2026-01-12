# 🧪 Guía de Comandos de Prueba - Virgy WhatsApp Bot

Esta guía te permite probar todos los flujos del bot usando el script `debug-webhook.js` **sin necesidad de usar tu WhatsApp real**.

## 📋 Sintaxis General

```bash
node debug-webhook.js "Texto del mensaje" [ID_DEL_BOTON]
```

- **Texto del mensaje**: Lo que vería el usuario
- **ID_DEL_BOTON**: (Opcional) El ID interno del botón/lista que se presionó

---

## 🔄 Resetear Sesión

Antes de probar cualquier flujo, reinicia la sesión:

```bash
node debug-webhook.js Hola
```

O también:

```bash
node debug-webhook.js Menu
```

---

## 👤 FLUJO: NO RESIDENTES

### 1. Menú Principal (No Residente)
```bash
node debug-webhook.js Hola
```

**Opciones disponibles:**
- Administración Edificio → `NR_ADMIN`
- Soy Residente → `NR_RESIDENT`
- Soy Proveedor → `NR_PROVIDER`
- Trabaja con nosotros → `NR_WORK`

---

### 2. Opción: Administración Edificio
```bash
node debug-webhook.js "Administración Edificio" NR_ADMIN
```

**Resultado**: Mensaje de confirmación (desarrollo futuro).

---

### 3. Opción: Soy Residente

#### 3.1. Iniciar el flujo
```bash
node debug-webhook.js "Soy Residente" NR_RESIDENT
```

**Resultado**: Te pregunta si conoces tu código de departamento.

#### 3.2. Opción A: Sí, lo conozco
```bash
node debug-webhook.js "Sí, lo conozco" REG_KNOW_YES
```

**Resultado**: Te pide Nombre, Apellido y DNI.

#### 3.3. Enviar tus datos
```bash
node debug-webhook.js "Juan Carlos Diaz 12345678"
```

**Resultado**: Te pide el Código de Departamento (CODIGO_SUBUNIDAD).

#### 3.4. Enviar código de departamento
```bash
node debug-webhook.js "DEP001"

```

**Resultado**: Valida si existes en Google Sheets.

#### 3.5. Opción B: No lo conozco
```bash
node debug-webhook.js "No lo conozco" REG_KNOW_NO
```

**Resultado**: Te pide el nombre del edificio.

#### 3.6. Enviar nombre del edificio
```bash
node debug-webhook.js "DISEÑO Y ESTILO"
```

**Resultado**: Te pide el número de departamento.

#### 3.7. Enviar número de departamento
```bash
node debug-webhook.js "201A"
```

**Resultado**: Busca el departamento y te devuelve el código.

---

### 4. Opción: Soy Proveedor

#### 4.1. Iniciar el flujo
```bash
node debug-webhook.js "Soy Proveedor" NR_PROVIDER
```

**Opciones disponibles:**
- Mantenimiento → `PROV_MANT`
- Insumos → `PROV_INSUMOS`

#### 4.2. Opción A: Mantenimiento
```bash
node debug-webhook.js "Mantenimiento" PROV_MANT
```

**Resultado**: Te pide el nombre de la empresa.

#### 4.3. Enviar nombre de empresa
```bash
node debug-webhook.js "Servicios El Plomero SAC"
```

**Resultado**: Te pide el RUC (11 dígitos).

#### 4.4. Enviar RUC
```bash
node debug-webhook.js "20123456789"
```

**Resultado**: Te pide el nombre de la persona de contacto.

#### 4.5. Enviar persona de contacto
```bash
node debug-webhook.js "Carlos Mendez"
```

**Resultado**: Te pide la dirección de la empresa.

#### 4.6. Enviar dirección
```bash
node debug-webhook.js "Av Lima 123, Miraflores"
```

**Resultado**: Te pide la especialidad de mantenimiento.

#### 4.7. Enviar especialidad
```bash
node debug-webhook.js "Plomeria y Gasfiteria"
```

**Resultado**: Guarda en MongoDB y envía mensaje de confirmación.

---

#### 4.8. Opción B: Insumos
```bash
node debug-webhook.js "Insumos" PROV_INSUMOS
```

**Resultado**: Igual que mantenimiento, pero pregunta por tipo de insumos en el último paso.

**Ejemplo de especialidad de insumos**:
```bash
node debug-webhook.js "Productos de Limpieza y Oficina"
```

---

### 5. Opción: Trabaja con nosotros
```bash
node debug-webhook.js "Trabaja con nosotros" NR_WORK
```

**Resultado**: Muestra vacantes disponibles.

**Opciones disponibles:**
- Postular a vacante → `WORK_APPLY`
- Conocer más → `WORK_INFO`
- Menú principal → `MENU_MAIN`

---

## 🏠 FLUJO: RESIDENTES (Juan Carlos Diaz - DEP001)

### 1. Menú Principal (Residente)
```bash
node debug-webhook.js Hola
```

**Opciones disponibles (ID numérico):**
1. Pagos
2. Atención y Reclamos
3. Recibos Mant.
4. Informes Económicos
5. Reglamento Interno
6. Normas Convivencia
7. Actualizar Datos

---

### 2. Opción 1: Pagos

#### 2.1. Seleccionar Pagos
```bash
node debug-webhook.js "Pagos" 1
```

**Resultado**: Muestra instrucciones de pago con Kashio.

**Opciones disponibles:**
- Sí, las instrucciones → `PAY_YES`
- No, contactar admin → `PAY_NO`

#### 2.2. Opción A: Ver Instrucciones
```bash
node debug-webhook.js "Sí, las instrucciones" PAY_YES
```

**Resultado**: Detalla bancos, cuenta, CCI, y códigos Kashio.

#### 2.3. Opción B: Contactar Admin
```bash
node debug-webhook.js "No, contactar admin" PAY_NO
```

**Resultado**: Información de contacto del administrador.

---

### 3. Opción 2: Atención y Reclamos

#### 3.1. Seleccionar Reclamos
```bash
node debug-webhook.js "Atención y Reclamos" 2
```

**Resultado**: Pregunta qué deseas hacer.

**Opciones disponibles:**
- Registrar nuevo reclamo → `CLAIM_NEW`
- Volver al menú principal → `MENU_MAIN`

#### 3.2. Registrar nuevo reclamo
```bash
node debug-webhook.js "Registrar nuevo reclamo" CLAIM_NEW
```

**Resultado**: Te pide describir el reclamo.

#### 3.3. Enviar descripción del reclamo
```bash
node debug-webhook.js "Fuga de agua en el baño principal"
```

**Resultado**: Guarda el reclamo en MongoDB con un ticket (TK-XXXX).

---

### 4. Opción 3: Recibos de Mantenimiento

#### 4.1. Seleccionar Recibos
```bash
node debug-webhook.js "Recibos Mant." 3
```

**Resultado**: Muestra opciones de recibos.

**Opciones disponibles:**
- Recibo del mes actual → `REC_CURRENT`
- Recibo de un mes anterior → `REC_PREVIOUS`
- Seleccionar otro mes → `REC_SELECT`
- Volver al menú principal → `MENU_MAIN`

---

### 5. Opción 4: Informes Económicos
```bash
node debug-webhook.js "Informes Económicos" 4
```

**Resultado**: Busca el archivo en Google Drive y lo envía (si existe).

---

### 6. Opción 5: Reglamento Interno
```bash
node debug-webhook.js "Reglamento Interno" 5
```

**Resultado**: Busca el archivo en Google Drive y lo envía (si existe).

---

### 7. Opción 6: Normas de Convivencia
```bash
node debug-webhook.js "Normas Convivencia" 6
```

**Resultado**: Busca el archivo en Google Drive y lo envía (si existe).

---

### 8. Opción 7: Actualizar Datos
```bash
node debug-webhook.js "Actualizar Datos" 7
```

**Resultado**: Mensaje de "Próximamente con WhatsApp Flows".

---

## 🔁 Volver al Menú Principal en Cualquier Momento

Desde cualquier flujo, puedes regresar al menú escribiendo:

```bash
node debug-webhook.js Hola
```

O seleccionando el botón "Menú Principal" (si está disponible):

```bash
node debug-webhook.js "Menú principal" MENU_MAIN
```

---

## 📊 Ver Resultados

Después de cada comando, revisa:

1. **Terminal** (donde corre `npm run start:dev`):
   - Logs del servidor
   - Estado de sesión: `💾 Updating session for 979488967: Flow=X, Step=Y`

2. **MongoDB Compass**:
   - Colección `conversationsessions`
   - Verifica `currentFlow`, `currentStep`, y `data`

3. **Archivo** `debug-result.json`:
   - Respuesta completa del servidor
   - Payload enviado a WhatsApp

---

## 🎯 Ejemplos de Rutas Completas

### Ruta 1: Registro de No Residente (Conoce su código)
```bash
node debug-webhook.js Hola
node debug-webhook.js "Soy Residente" NR_RESIDENT
node debug-webhook.js "Sí, lo conozco" REG_KNOW_YES
node debug-webhook.js "Juan Perez 87654321"
node debug-webhook.js "DEP002"
```

### Ruta 2: Residente reporta un reclamo
```bash
node debug-webhook.js Hola
node debug-webhook.js "Atención y Reclamos" 2
node debug-webhook.js "Registrar nuevo reclamo" CLAIM_NEW
node debug-webhook.js "Ascensor no funciona desde ayer"
```

### Ruta 3: Residente consulta información de pagos
```bash
node debug-webhook.js Hola
node debug-webhook.js "Pagos" 1
node debug-webhook.js "Sí, las instrucciones" PAY_YES
```

---

## 🛠️ Tips para Depuración

1. **Sesión atascada**: Borra manualmente el documento en MongoDB o escribe `Hola`.
2. **Ver payload original**: Abre `test-webhook.json` para ver cómo se estructura el mensaje.
3. **Logs de sesión**: Busca en la terminal `💾 Updating session` para confirmar que se guardó.

---

## 🚀 Próximo paso: Probar con WhatsApp Real

Una vez que todos los flujos funcionen con el script, puedes probar desde tu WhatsApp:

1. Envía "Hola" desde tu celular
2. Deberías recibir el menú automáticamente
3. Ya no necesitarás correr el script manualmente

**Si no llegan mensajes desde WhatsApp**, revisa:
- URL de ngrok en Meta Developer Console
- Configuración del webhook en Facebook
- Logs de ngrok en `http://localhost:4040`
