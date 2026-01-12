export class WhatsappResponseHelper {
    static text(to: string, text: string) {
        return {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'text',
            text: { body: text },
        };
    }

    static buttons(to: string, bodyText: string, buttons: Array<{ id: string; title: string }>, headerText?: string, footerText?: string) {
        return {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'interactive',
            interactive: {
                type: 'button',
                ...(headerText && { header: { type: 'text', text: headerText } }),
                body: { text: bodyText },
                ...(footerText && { footer: { text: footerText } }),
                action: {
                    buttons: buttons.map((btn) => ({
                        type: 'reply',
                        reply: { id: btn.id, title: btn.title },
                    })),
                },
            },
        };
    }

    static list(
        to: string,
        bodyText: string,
        buttonText: string,
        sections: Array<{ title: string; rows: Array<{ id: string; title: string; description?: string }> }>,
        headerText?: string,
        footerText?: string,
    ) {
        return {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'interactive',
            interactive: {
                type: 'list',
                ...(headerText && { header: { type: 'text', text: headerText } }),
                body: { text: bodyText },
                ...(footerText && { footer: { text: footerText } }),
                action: {
                    button: buttonText,
                    sections,
                },
            },
        };
    }

    static document(to: string, url: string, filename: string, caption?: string) {
        return {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'document',
            document: {
                link: url,
                filename: filename,
                ...(caption && { caption }),
            },
        };
    }

    // Phase 2 Templates
    static residentGreeting(to: string, name: string, relation: string, subunit: string, building: string) {
        const bodyText = `👋 Hola, *${name}*,\n📍 *${relation}* del Departamento *${subunit}* – Edificio *${building}*\n\nBienvenido a Álamo Company 🏢\n\nSoy Virgy, tu asesor virtual 🤖\nEstoy aquí para ayudarte de forma rápida y clara.\n\n👇 Puedes continuar de dos maneras:\n* Selecciona una opción del menú de consultas\n* O escribe tu consulta con frases cortas\n(por ejemplo: “Quiero conocer mis pagos”)\n\n📲 Responde con el número de la opción que deseas consultar.`;

        return this.list(
            to,
            bodyText,
            'Ver Opciones',
            [
                {
                    title: 'Menú de Consultas',
                    rows: [
                        { id: '1', title: 'Pagos', description: 'Problemas con el pago de tus cuotas' },
                        { id: '2', title: 'Atención y Reclamos', description: 'Atención, reclamos o incidencias' },
                        { id: '3', title: 'Recibos Mant.', description: 'Recibos de mantenimiento' },
                        { id: '4', title: 'Informes Económicos', description: 'Ver reportes mensuales' },
                        { id: '5', title: 'Reglamento Interno', description: 'Normas del edificio' },
                        { id: '6', title: 'Normas Convivencia', description: 'Convivencia y áreas comunes' },
                        { id: '7', title: 'Actualizar Datos', description: 'Tus datos en el sistema' },
                    ],
                },
            ],
            'Menú Principal'
        );
    }

    static paymentInstructions(to: string) {
        const bodyText = `¡Hola! 👋\nPara pagar tus cuotas de mantenimiento, tu edificio cuenta con el sistema multibanca *Kashio*.\n\nPuedes pagar de forma rápida y segura desde:\n\n🏦 Bancos: BCP, BBVA, Interbank y BanBif\n📱 Apps: Yape\n🏪 Redes: Kasnet\n\n📝 *¿Cómo pagar?*\n\n1️⃣ Ingresa a la banca móvil o acércate a un agente\n2️⃣ Busca *KASHIO PERÚ* en Pago de Servicios\n3️⃣ Ingresa el código de tu departamento\n4️⃣ Selecciona las cuotas a pagar y listo ✅\n\n🔄 *No necesitas enviar comprobante*\nEl sistema se actualiza automáticamente si usas Kashio.\n\n❓ ¿Deseas recibir las instrucciones de pago?`;

        return this.buttons(
            to,
            bodyText,
            [
                { id: 'PAY_YES', title: '✅ Sí, las instrucciones' },
                { id: 'PAY_NO', title: '📞 No, contactar admin' },
            ],
            '💳 Información de Pago'
        );
    }

    static bankDetails(to: string, building: string, bank: string, name: string, bankName: string, account: string, cci: string, kashio: string, fees: string) {
        const text = `💰 *Instrucciones de pago – ${building}*\n\nAquí tienes los datos específicos para realizar tus pagos:\n\n🏦 Bancos autorizados: ${bank}\n👤 Nombre de la cuenta: ${name}\n📲 Nombre en banca móvil: ${bankName}\n💳 Número de cuenta: ${account}\n🔗 CCI: ${cci}\n\n🏢 Kashio habilitado: ${kashio}\n⏰ Mora vigente: ${fees}\n\n⚠️ *Importante*\nSi realizas el pago por ventanilla o agente (no digital), usa estos códigos:\n\n• 🟠 Kasnet: 220044\n• 🔵 BBVA: 11140\n• 🔴 Interbank: 0791501\n• 🔵 BCP: 15813`;
        return this.text(to, text);
    }

    static adminContact(to: string, building: string, admin: string, reception: string, president: string, address: string) {
        const text = `👨‍💼 *Contacto de administración – ${building}*\n\nSi necesitas ayuda personalizada, puedes comunicarte con:\n\n🧑‍💼 Administrador(a): ${admin}\n📞 Recepción: ${reception}\n📱 Presidencia: ${president}\n📍 Dirección: ${address}\n\n🚨 *Emergencias 24/7*\nEn caso de incidentes graves, llama al 986 301 418`;
        return this.text(to, text);
    }

    static nonResidentGreeting(to: string) {
        const bodyText = `Hola 👋\n\nSoy *VIRGY*, tu asistente virtual de Alamo Company.\n¿En qué puedo ayudarte hoy?`;
        return this.list(
            to,
            bodyText,
            'Ver Opciones',
            [
                {
                    title: 'Opciones de Virgy',
                    rows: [
                        { id: 'NR_ADMIN', title: 'Administración Edificio', description: 'Para tu condominio' },
                        { id: 'NR_RESIDENT', title: 'Soy Residente', description: 'Vincularte al sistema' },
                        { id: 'NR_PROVIDER', title: 'Soy Proveedor', description: 'Mantenimiento o insumos' },
                        { id: 'NR_WORK', title: 'Trabaja con nosotros', description: 'Vacantes disponibles' },
                    ],
                },
            ],
            '¡Bienvenido!'
        );
    }

    static claimMenu(to: string) {
        const bodyText = `🎫 *VIRGY · Atención y Reclamos*\n\nEstoy aquí para ayudarte a registrar o consultar una solicitud relacionada con tu unidad o el edificio 🏢\n\nAntes de continuar, dime qué deseas hacer:`;
        return this.list(
            to,
            bodyText,
            'Seleccionar Acción',
            [
                {
                    title: 'Opciones',
                    rows: [
                        { id: 'CLAIM_NEW', title: 'Registrar nuevo reclamo', description: 'Reportar una incidencia' },
                        { id: 'MENU_MAIN', title: 'Volver al menú principal', description: 'Ver todas las opciones' },
                    ],
                },
            ],
            'Atención y Reclamos'
        );
    }

    static claimSuccess(to: string, ticket: string, date: string) {
        const text = `✅ *Reclamo registrado con éxito*\n\nTu reclamo ha sido registrado correctamente 🙌\n\n🆔 Ticket N°: ${ticket}\n📅 Fecha: ${date}\n📌 Estado: Registrado\n\n👷 Nuestro equipo o el administrador del edificio lo revisará y se pondrá en contacto contigo.\n\n⏳ Tiempo estimado de respuesta:\n* 🔴 Urgente: dentro de 24 horas\n* 🟡 Normal: según la programación del edificio`;
        return this.list(
            to,
            text,
            '¿Qué deseas hacer?',
            [
                {
                    title: 'Opciones',
                    rows: [
                        { id: 'CLAIM_NEW', title: '➕ Registrar otro reclamo' },
                        { id: 'MENU_MAIN', title: '🔙 Volver al menú principal' },
                    ],
                },
            ]
        );
    }

    static receiptMenu(to: string) {
        const bodyText = `🧾 *VIRGY · Solicitud de Recibos*\n\nPuedo ayudarte a solicitar una copia o duplicado de tu recibo de mantenimiento 📄\n\nIndícame qué recibo necesitas:`;
        return this.list(
            to,
            bodyText,
            'Seleccionar Mes',
            [
                {
                    title: 'Opciones de Recibos',
                    rows: [
                        { id: 'REC_CURRENT', title: '🗓️ Recibo del mes actual' },
                        { id: 'REC_PREVIOUS', title: '⏪ Recibo de un mes anterior' },
                        { id: 'REC_SELECT', title: '📚 Seleccionar otro mes' },
                        { id: 'MENU_MAIN', title: '🔙 Volver al menú principal' },
                    ],
                },
            ],
            'Solicitud de Recibos'
        );
    }

    static vacancyList(to: string, vacancies: string[]) {
        const bodyText = `💼 *Trabaja con nosotros*\n\n¿Te gustaría formar parte del equipo de Álamo Company? 🙌✨\n\nActualmente contamos con las siguientes vacantes disponibles:\n\n${vacancies.map(v => `• ${v}`).join('\n')}\n\n❓ ¿Qué te gustaría hacer?`;
        return this.buttons(
            to,
            bodyText,
            [
                { id: 'WORK_APPLY', title: 'Postular a vacante' },
                { id: 'WORK_INFO', title: 'Conocer más' },
                { id: 'MENU_MAIN', title: 'Menú principal' },
            ],
            'Bolsa de Trabajo'
        );
    }
}
