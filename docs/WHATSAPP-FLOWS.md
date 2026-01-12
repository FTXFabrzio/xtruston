# 📱 Implementación de WhatsApp Flows - Guía Futura

## ¿Qué son los WhatsApp Flows?

Los WhatsApp Flows son formularios interactivos nativos de WhatsApp que se abren como un modal dentro de la app. Permiten:

✅ Validaciones automáticas (email, teléfono, números)
✅ Campos obligatorios y opcionales
✅ Listas desplegables (dropdowns)
✅ Múltiples pantallas/pasos
✅ Mejor experiencia de usuario

---

## 🎯 Estado Actual vs Futuro

### ✅ Implementado Ahora (Paso a Paso)

Actualmente, el bot funciona con **mensajes paso a paso**:

```
Bot: ¿Nombre de tu empresa?
Usuario: Servicios SAC
Bot: ¿RUC?
Usuario: 20123456789
Bot: ¿Persona de contacto?
...
```

**Ventajas:**
- Funciona de inmediato
- No requiere configuración externa
- Fácil de debuggear

**Desventajas:**
- Varios mensajes de ida y vuelta
- El usuario puede equivocarse y responder mal
- No hay validaciones en tiempo real

---

### 🚀 Con WhatsApp Flows (Futuro)

Con Flows, se vería así:

```
Bot: Para registrarte como proveedor, completa este formulario 📝
[Botón: Completar Formulario]

→ Se abre un modal con todos los campos
→ El usuario los llena todos de una vez
→ Submit → Datos llegan a tu servidor
```

**Ventajas:**
- Todo en un solo paso
- Validaciones en tiempo real
- Lista de especialidades (dropdown)
- Mejor UX profesional

---

## 🛠️ Cómo Implementar WhatsApp Flows

### Paso 1: Crear el Flow JSON en Meta

1. Ve a **Meta Developer Console**
2. **WhatsApp Business API** > **Flows**
3. Crea un nuevo Flow:
   - Nombre: "Registro de Proveedor"
   - Tipo: "Custom"

### Paso 2: Definir el Schema del Flow

```json
{
  "version": "6.0",
  "screens": [
    {
      "id": "PROVIDER_FORM",
      "title": "Registro de Proveedor",
      "data": {},
      "layout": {
        "type": "SingleColumnLayout",
        "children": [
          {
            "type": "Form",
            "name": "provider_form",
            "children": [
              {
                "type": "TextInput",
                "name": "company_name",
                "label": "Nombre de la Empresa",
                "required": true,
                "input-type": "text"
              },
              {
                "type": "TextInput",
                "name": "ruc",
                "label": "Número de RUC",
                "required": true,
                "input-type": "number",
                "helper-text": "11 dígitos",
                "min-chars": 11,
                "max-chars": 11
              },
              {
                "type": "TextInput",
                "name": "contact_person",
                "label": "Persona de Contacto",
                "required": true,
                "input-type": "text"
              },
              {
                "type": "TextInput",
                "name": "address",
                "label": "Dirección",
                "required": true,
                "input-type": "text"
              },
              {
                "type": "Dropdown",
                "name": "specialty",
                "label": "Especialidad",
                "required": true,
                "data-source": [
                  {"id": "electricidad", "title": "Electricidad"},
                  {"id": "plomeria", "title": "Plomería"},
                  {"id": "carpinteria", "title": "Carpintería"},
                  {"id": "limpieza", "title": "Limpieza"},
                  {"id": "pintura", "title": "Pintura"},
                  {"id": "otro", "title": "Otro"}
                ]
              },
              {
                "type": "Footer",
                "label": "Enviar",
                "on-click-action": {
                  "name": "complete",
                  "payload": {}
                }
              }
            ]
          }
        ]
      }
    }
  ]
}
```

### Paso 3: Obtener el Flow ID

Una vez que crees el Flow en Meta, te darán un **Flow ID** como:

```
1234567890123456
```

Guárdalo en tu `.env`:

```env
WHATSAPP_FLOW_PROVIDER_ID=1234567890123456
```

---

### Paso 4: Modificar el Código para Enviar el Flow

En `whatsapp-response.helper.ts`, agrega un método para enviar Flows:

```typescript
static flow(to: string, bodyText: string, flowId: string, flowAction: string = 'navigate', screenId?: string) {
    return {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'interactive',
        interactive: {
            type: 'flow',
            body: { text: bodyText },
            action: {
                name: 'flow',
                parameters: {
                    flow_message_version: '3',
                    flow_token: `flow_${Date.now()}`,
                    flow_id: flowId,
                    flow_cta: 'Completar Formulario',
                    flow_action: flowAction,
                    ...(screenId && { screen: screenId })
                }
            }
        }
    };
}
```

### Paso 5: Actualizar el Handler de Proveedores

En `non-resident-flow.handler.ts`, reemplaza la lógica paso a paso:

```typescript
if (input === 'PROV_MANT') {
    const flowId = this.configService.get<string>('WHATSAPP_FLOW_PROVIDER_ID');
    session.data.provider.type = 'mantenimiento';
    await this.sessionRepo.update(session);
    
    return WhatsappResponseHelper.flow(
        from,
        '📝 Por favor, completa el siguiente formulario para registrarte como proveedor de mantenimiento:',
        flowId,
        'navigate',
        'PROVIDER_FORM'
    );
}
```

### Paso 6: Crear un Endpoint para Recibir el Flow

Los datos del Flow llegan a un endpoint diferente. Crea un nuevo controller:

```typescript
@Post('webhook/flows')
async receiveFlowData(@Body() payload: any) {
    const flowData = payload.flow_data;
    
    // flowData contendrá:
    // {
    //   company_name: "Servicios SAC",
    //   ruc: "20123456789",
    //   contact_person: "Carlos",
    //   address: "Av Lima 123",
    //   specialty: "plomeria"
    // }
    
    await this.providerRepo.save({
        phoneNumber: payload.from,
        type: 'mantenimiento',
        ...flowData,
        status: 'PENDIENTE'
    });
    
    return { success: true };
}
```

---

## 📋 Checklist de Implementación

- [ ] Crear el Flow en Meta Developer Console
- [ ] Obtener el Flow ID
- [ ] Agregar el Flow ID al `.env`
- [ ] Implementar método `flow()` en `whatsapp-response.helper.ts`
- [ ] Crear endpoint `POST /webhook/flows`
- [ ] Actualizar handlers para usar `flow()` en vez de paso a paso
- [ ] Probar desde WhatsApp real

---

## 🔗 Referencias

- [WhatsApp Flows Documentation](https://developers.facebook.com/docs/whatsapp/flows)
- [Flow JSON Schema](https://developers.facebook.com/docs/whatsapp/flows/reference/flowsjson)
- [WhatsApp Business Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)

---

## 💡 Conclusión

Por ahora, el sistema funciona perfectamente con mensajes paso a paso. Cuando quieras implementar WhatsApp Flows:

1. Sigue esta guía
2. Configura el Flow en Meta
3. Actualiza el código según los ejemplos

**Ventaja:** Podrás mantener ambas versiones activas y elegir cuál usar según el caso de uso.
