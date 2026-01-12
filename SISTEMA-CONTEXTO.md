# 🎯 Sistema de Contexto Implementado

## ✅ Lo que acabamos de hacer

### 1. **Sistema de Sesiones en MongoDB**
- **Schema**: `conversation-session.schema.ts` - Guarda el estado de cada conversación
- **Repositorio**: `conversation-session.repository.ts` - CRUD de sesiones
- **Caso de Uso**: `manage-context.use-case.ts` - Lógica de negocio para manejar sesiones

### 2. **Primer Flujo Completo: "Ver Información de Pago"**
Actualizado `handle-incoming-message.use-case.ts` para:
- Crear/recuperar sesión del usuario
- Detectar cuando el usuario escribe "1" (opción del menú)
- Ejecutar `GetBuildingPaymentInfoUseCase`
- Mostrar la información de pago
- Limpiar la sesión

---

## 🔄 Cómo Funciona el Flujo Completo

```
┌─────────────────────────────────────────────────────────┐
│ Mensaje 1: "Hola"                                       │
├─────────────────────────────────────────────────────────┤
│ 1. Valida residente (ACTIVO)                           │
│ 2. Crea sesión en MongoDB:                             │
│    { userId: "936020823", currentFlow: null }          │
│ 3. Responde:                                           │
│    "¡Hola Juan Pérez!                                  │
│     1️⃣ Ver info de pago                                │
│     2️⃣ Descargar recibos                               │
│     3️⃣ Registrar reclamo..."                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Mensaje 2: "1"                                          │
├─────────────────────────────────────────────────────────┤
│ 1. Recupera sesión (currentFlow = null)                │
│ 2. Detecta que está en menú principal                  │
│ 3. Interpreta "1" como "Ver info de pago"              │
│ 4. Ejecuta GetBuildingPaymentInfoUseCase               │
│ 5. Responde:                                           │
│    "💳 Información de Pago - EDIFICIO_001              │
│     Cuenta: 123456789                                  │
│     CCI: 002123..."                                    │
│ 6. Limpia la sesión                                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Mensaje 3: "Hola" (de nuevo)                           │
├─────────────────────────────────────────────────────────┤
│ 1. Crea nueva sesión                                   │
│ 2. Muestra menú principal otra vez                     │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Próximos Pasos

### Opción A: Probar el Flujo Actual
1. Reiniciar el servidor
2. Probar en Postman:
   - Mensaje 1: `"Hola"` → Debe mostrar menú
   - Mensaje 2: `"1"` → Debe mostrar info de pago

### Opción B: Implementar Más Flujos
Ahora que el sistema de contexto está listo, puedes implementar:
- **Opción 2**: Descargar recibos (multi-paso: pedir mes/año)
- **Opción 3**: Registrar reclamo (multi-paso: descripción, área, etc.)

---

## 🧪 Cómo Probar en Postman

### Test 1: Mostrar Menú
```json
{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "936020823",
          "timestamp": "1234567890",
          "type": "text",
          "text": { "body": "Hola" }
        }]
      }
    }]
  }]
}
```

**Respuesta esperada:**
```json
{
  "status": "received",
  "result": {
    "type": "RESIDENT_MENU",
    "residentName": "Juan Carlos Quispe Mamani",
    "building": "DIES201A",
    "unit": "201A"
  }
}
```

### Test 2: Ver Info de Pago
```json
{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "936020823",
          "timestamp": "1234567891",
          "type": "text",
          "text": { "body": "1" }
        }]
      }
    }]
  }]
}
```

**Respuesta esperada:**
```json
{
  "status": "received",
  "result": {
    "type": "TEXT",
    "content": "💳 Información de Pago - DIES201A\n\nCuenta: ...\nCCI: ..."
  }
}
```

---

## 🔧 Archivos Creados/Modificados

### Nuevos Archivos:
1. `src/infrastructure/database/schemas/conversation-session.schema.ts`
2. `src/infrastructure/repositories/conversation-session.repository.ts`
3. `src/application/use-cases/conversation/manage-context.use-case.ts`

### Archivos Modificados:
1. `src/infrastructure/repositories/repositories.module.ts`
2. `src/application/application.module.ts`
3. `src/application/use-cases/messages/handle-incoming-message.use-case.ts`

---

## 💡 Ventajas de Este Enfoque

✅ **Escalable**: Agregar nuevos flujos es solo copiar el patrón  
✅ **Mantenible**: Cada flujo está claramente separado  
✅ **Testeable**: Puedes probar cada flujo independientemente  
✅ **Robusto**: Las sesiones expiran automáticamente (30 min)  
✅ **Stateful**: El bot recuerda el contexto de cada usuario
