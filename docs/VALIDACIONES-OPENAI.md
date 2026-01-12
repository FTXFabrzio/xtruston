# 🤖 Validaciones con OpenAI - Virgy Bot

## ✅ Implementado

El sistema ahora usa **OpenAI (gpt-4o-mini)** para validar inteligentemente los datos que ingresan los usuarios en el flujo de registro de proveedores.

---

## 📋 Reglas de Validación

### 1. Nombre de Empresa

**Permitido:**
- Letras (incluyendo á, é, í, ó, ú, ñ)
- Números
- Espacios
- Puntos (.)
- Comas (,)

**NO permitido:**
- Símbolos: @, #, $, %, &, *, (, ), [, ], {, }, <, >, /, \, |, etc.

**Longitud:**
- Mínimo: 3 caracteres
- Máximo: 100 caracteres

**Ejemplos:**
- ✅ "Servicios El Plomero SAC"
- ✅ "Empresa 123 S.A.C."
- ✅ "El Buen Carpintero"
- ❌ "Empresa #1" (símbolo # no permitido)
- ❌ "AB" (muy corto)

---

### 2. RUC (Número de Identificación Tributaria)

**Reglas:**
- Exactamente 11 dígitos
- Solo números
- Debe empezar con: 10, 15, 17 o 20

**Ejemplos:**
- ✅ "20123456789"
- ✅ "10987654321"
- ❌ "123456789" (solo 9 dígitos)
- ❌ "30123456789" (empieza con 30)
- ❌ "2012345678A" (contiene letra)

---

### 3. Persona de Contacto

**Permitido:**
- Letras (incluyendo á, é, í, ó, ú, ñ)
- Espacios
- Puntos (.)
- Apóstrofes (')

**NO permitido:**
- Números
- Símbolos especiales

**Longitud:**
- Mínimo: 2 caracteres
- Máximo: 100 caracteres

**Ejemplos:**
- ✅ "Carlos Mendez"
- ✅ "María José López"
- ✅ "O'Connor"
- ❌ "Juan123" (contiene números)
- ❌ "J" (muy corto)

---

### 4. Dirección y Especialidad

**Sin restricciones especiales** - Se aceptan todos los caracteres.

---

## 🧪 Cómo Probar las Validaciones

### Caso 1: Nombre de Empresa Inválido

```bash
node debug-webhook.js Hola
node debug-webhook.js "Soy Proveedor" NR_PROVIDER
node debug-webhook.js "Mantenimiento" PROV_MANT
node debug-webhook.js "Empresa #1"
```

**Respuesta esperada:**
```
⚠️ No uses símbolos como # en el nombre

Por favor, envíame el nombre de la empresa nuevamente:
```

---

### Caso 2: RUC Inválido (muy corto)

```bash
node debug-webhook.js Hola
node debug-webhook.js "Soy Proveedor" NR_PROVIDER
node debug-webhook.js "Mantenimiento" PROV_MANT
node debug-webhook.js "Servicios SAC"
node debug-webhook.js "123456789"
```

**Respuesta esperada:**
```
⚠️ El RUC debe tener exactamente 11 dígitos. Tú enviaste 9 dígitos. Por favor, verifica e inténtalo de nuevo.
```

---

### Caso 3: RUC Inválido (empieza mal)

```bash
node debug-webhook.js "30123456789"
```

**Respuesta esperada:**
```
⚠️ El RUC debe empezar con 10, 15, 17 o 20. Por favor, verifica el número e inténtalo de nuevo.
```

---

### Caso 4: Persona de Contacto Inválida

```bash
node debug-webhook.js Hola
node debug-webhook.js "Soy Proveedor" NR_PROVIDER
node debug-webhook.js "Mantenimiento" PROV_MANT
node debug-webhook.js "Servicios SAC"
node debug-webhook.js "20123456789"
node debug-webhook.js "Juan123"
```

**Respuesta esperada:**
```
⚠️ Los nombres no deben contener números

Por favor, envíame el nombre de la persona de contacto nuevamente:
```

---

### Caso 5: Todo Válido

```bash
node debug-webhook.js Hola
node debug-webhook.js "Soy Proveedor" NR_PROVIDER
node debug-webhook.js "Mantenimiento" PROV_MANT
node debug-webhook.js "Servicios El Plomero SAC"
node debug-webhook.js "20123456789"
node debug-webhook.js "Carlos Mendez"
node debug-webhook.js "Av Lima 123, Miraflores"
node debug-webhook.js "Plomeria y Gasfiteria"
```

**Respuesta esperada:**
```
✅ ¡Gracias!
Tu solicitud ha sido registrada correctamente 📝

👨‍💼 Un asesor de nuestro equipo la atenderá a la brevedad y se contactará contigo apenas esté disponible 📞
```

---

## ⚙️ Configuración

### Variables de Entorno

Asegúrate de tener configuradas en tu `.env`:

```env
OPENAI_API=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
```

---

## 🔧 Fallback sin OpenAI

Si no tienes configurada la API de OpenAI o hay un error, el sistema usa **validaciones básicas**:

- **Nombre/Persona**: Solo letras, números, espacios, puntos y comas
- **RUC**: Solo la validación de 11 dígitos

El sistema **nunca fallará** por falta de OpenAI, simplemente será menos inteligente en el feedback.

---

## 📊 Ventajas de Usar OpenAI

1. ✅ **Feedback más natural**: En vez de "caracteres no permitidos", dice "No uses símbolos como # en el nombre"
2. ✅ **Contexto peruano**: Valida RUC según reglas de Perú (empieza con 10, 15, 17, 20)
3. ✅ **Flexible**: Detecta patrones inusuales sin regex complicados
4. ✅ **Mejora con el tiempo**: Puedes ajustar los prompts sin cambiar código

---

## 🚀 Próximos Pasos

Puedes extender este sistema para validar otros campos:

### Ejemplo: Validar Email

```typescript
async validateEmail(email: string): Promise<ValidationResult> {
    const response = await this.openai.chat.completions.create({
        model: this.config.get<string>('OPENAI_MODEL'),
        messages: [
            {
                role: 'system',
                content: `Valida si el email es válido.
Responde "VALID" o "INVALID: razón"`
            },
            { role: 'user', content: `Valida: ${email}` }
        ]
    });
    // ... procesar respuesta
}
```

### Ejemplo: Validar Teléfono Peruano

```typescript
async validatePeruvianPhone(phone: string): Promise<ValidationResult> {
    // Teléfono móvil: empieza con 9, 9 dígitos
    // Teléfono fijo: 7 dígitos
    // ...
}
```

---

## 💰 Costos

**gpt-4o-mini** es muy económico:

- **Input**: ~$0.15 por 1M tokens
- **Output**: ~$0.60 por 1M tokens

Para validaciones:
- Cada validación usa ~100-200 tokens
- 1000 validaciones ≈ $0.02 USD

**Tip**: Usa caché si validas el mismo dato varias veces.

---

## 🎯 Conclusión

El sistema ahora tiene validaciones inteligentes que:
- Mejoran la experiencia del usuario
- Previenen errores de datos
- Dan feedback claro y amigable
- Funcionan con o sin OpenAI

¡Prueba ingresando datos inválidos para ver las validaciones en acción! 🚀
