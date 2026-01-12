import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConversationSessionRepository } from 'src/infrastructure/repositories/conversation-session.repository';
import { WhatsappResponseHelper } from 'src/application/utils/whatsapp-response.helper';
import { IVacancyRepository } from 'src/domain/repositories/vacancy.repository.interface';
import { ICandidateRepository } from 'src/domain/repositories/candidate.repository.interface';
import { IResidentRepository } from 'src/domain/repositories/resident.repository.interface';
import { IProviderRepository } from 'src/domain/repositories/provider.repository.interface';
import { OpenAIValidationService } from 'src/application/services/openai-validation.service';

@Injectable()
export class NonResidentFlowHandler {
    private readonly logger = new Logger(NonResidentFlowHandler.name);

    constructor(
        private readonly sessionRepo: ConversationSessionRepository,
        @Inject('IVacancyRepository') private readonly vacancyRepo: IVacancyRepository,
        @Inject('ICandidateRepository') private readonly candidateRepo: ICandidateRepository,
        @Inject('IResidentRepository') private readonly residentRepo: IResidentRepository,
        @Inject('IProviderRepository') private readonly providerRepo: IProviderRepository,
        private readonly validationService: OpenAIValidationService,
    ) { }

    async handle(message: any, session: any): Promise<any> {
        const text = (message.text || '').trim().toUpperCase();
        const actionId = (message.actionId || '').trim().toUpperCase();
        const from = message.from;

        // Si el usuario escribe HOLA o MENU, reiniciamos su sesión
        if (text === 'HOLA' || text === 'MENU' || actionId === 'MENU_MAIN') {
            this.logger.log(`Resetting session for ${from}`);
            session.currentFlow = null;
            session.currentStep = 0;
            session.data = {}; // Limpiar datos temporales
            await this.sessionRepo.update(session);

            // Si fue un reinicio explícito con "HOLA", retornamos el saludo inicial directamente
            if (text === 'HOLA' || text === 'MENU') {
                return WhatsappResponseHelper.nonResidentGreeting(from);
            }
        }

        const input = actionId || text;

        if (!session.currentFlow) {
            return this.handleMainMenu(input, from, session);
        }

        switch (session.currentFlow) {
            case 'WORK':
                return this.handleWorkFlow(input, from, session);
            case 'REGISTRATION':
                return this.handleRegistrationFlow(input, from, session);
            case 'PROVIDER':
                return this.handleProviderFlow(input, from, session);
            default:
                session.currentFlow = null;
                await this.sessionRepo.update(session);
                return this.handleMainMenu(input, from, session);
        }
    }

    private async handleMainMenu(input: string, from: string, session: any): Promise<any> {
        if (input === 'NR_ADMIN') {
            return WhatsappResponseHelper.text(from, '✅ ¡Gracias!\nTu solicitud de administración ha sido registrada correctamente 📝\n\nUn asesor se contactará contigo a la brevedad. (WhatsApp Flow en desarrollo)');
        }

        if (input === 'NR_RESIDENT') {
            session.currentFlow = 'REGISTRATION';
            session.currentStep = 1;
            await this.sessionRepo.update(session);
            return WhatsappResponseHelper.buttons(from, '👋 ¡Hola! Soy Virgy\nPara comenzar, ¿conoces tu Código de Departamento? 🏢 (CODIGO_SUBUNIDAD)', [
                { id: 'REG_KNOW_YES', title: 'Sí, lo conozco' },
                { id: 'REG_KNOW_NO', title: 'No lo conozco' }
            ]);
        }

        if (input === 'NR_PROVIDER') {
            session.currentFlow = 'PROVIDER';
            session.currentStep = 1;
            await this.sessionRepo.update(session);
            return WhatsappResponseHelper.buttons(from, '🤝 ¿Eres proveedor?\nPor favor, selecciona una de las siguientes opciones:', [
                { id: 'PROV_MANT', title: '🔧 Mantenimiento' },
                { id: 'PROV_INSUMOS', title: '📦 Insumos' }
            ]);
        }

        if (input === 'NR_WORK' || input.includes('TRABAJAR')) {
            session.currentFlow = 'WORK';
            session.currentStep = 1;
            await this.sessionRepo.update(session);

            const vacancies = await this.vacancyRepo.findAllActive();
            return WhatsappResponseHelper.vacancyList(from, vacancies.map(v => v.position));
        }

        return WhatsappResponseHelper.nonResidentGreeting(from);
    }

    private async handleWorkFlow(input: string, from: string, session: any): Promise<any> {
        if (input === 'WORK_INFO') {
            return WhatsappResponseHelper.text(from, 'Álamo Company es una empresa líder en administración con más de 15 años de experiencia... 🔗 Más en: https://alamocompany.com/');
        }

        if (input === 'WORK_APPLY') {
            return WhatsappResponseHelper.buttons(from, '📝 *Proceso de postulación*\n\nPara postular, necesitaremos datos básicos y tu CV 📄\n\n❓ ¿Deseas continuar?', [
                { id: 'APPLY_YES', title: '✅ Sí, continuar' },
                { id: 'APPLY_NO', title: '🔙 No, volver' }
            ]);
        }

        if (input === 'MENU_MAIN') {
            session.currentFlow = null;
            await this.sessionRepo.update(session);
            return this.handleMainMenu('', from, session);
        }

        return this.handleMainMenu('', from, session);
    }

    private async handleRegistrationFlow(input: string, from: string, session: any): Promise<any> {
        if (session.currentStep === 1) {
            if (input === 'REG_KNOW_YES') {
                session.currentStep = 2; // Waiting for "Name, Last Name, DNI"
                await this.sessionRepo.update(session);
                return WhatsappResponseHelper.text(from, 'Perfecto. Por favor, envíame tu *Nombre, Apellido y DNI* (todo en un solo mensaje) para validarte.');
            }
            if (input === 'REG_KNOW_NO') {
                session.currentStep = 10; // "No lo conozco" path -> Ask building name
                await this.sessionRepo.update(session);
                return WhatsappResponseHelper.text(from, 'No te preocupes. ¿Cuál es el *Nombre de tu Edificio*?');
            }
        }

        // --- Path A: Knows Code ---
        if (session.currentStep === 2) {
            // Very simple parser for "Name, Last Name, DNI"
            const parts = input.split(/[, ]+/);
            if (parts.length < 3) {
                return WhatsappResponseHelper.text(from, 'Por favor, asegúrate de enviar Nombre, Apellido y DNI separados por espacios o comas.');
            }

            // In a real scenario, we might ask step by step or use a Flow.
            // For now, let's assume the user sends them.
            session.data.tempRegistration = { name: parts[0], lastName: parts[1], dni: parts[2] };
            session.currentStep = 3;
            await this.sessionRepo.update(session);
            return WhatsappResponseHelper.text(from, 'Ahora envíame tu *Código de Departamento* (CODIGO_SUBUNIDAD):');
        }

        if (session.currentStep === 3) {
            const subunitCode = input;
            const { name, lastName, dni } = session.data.tempRegistration;

            const existingResident = await this.residentRepo.findBySubunitCode(subunitCode);

            if (existingResident) {
                const nameMatches = (existingResident.name || '').toUpperCase().includes((name || '').toUpperCase());
                const dniMatches = existingResident.documentNumber === dni;

                if (nameMatches && dniMatches) {
                    session.currentFlow = null;
                    await this.sessionRepo.update(session);
                    return WhatsappResponseHelper.text(from, `✅ ¡Identidad verificada, *${existingResident.name}*!\n\nYa puedes usar el menú principal de residentes. Escribe "Hola" para comenzar.`);
                } else {
                    session.currentStep = 4;
                    await this.sessionRepo.update(session);
                    return WhatsappResponseHelper.buttons(from, 'Los datos no coinciden con nuestros registros para esa unidad.\n\n¿Deseas solicitar el registro de un nuevo residente para este departamento?', [
                        { id: 'REG_NEW_YES', title: 'Sí, registrarme' },
                        { id: 'REG_NEW_NO', title: 'No, intentar de nuevo' }
                    ]);
                }
            } else {
                session.currentFlow = null;
                await this.sessionRepo.update(session);
                return WhatsappResponseHelper.text(from, 'El código de unidad no existe. Por favor, verifica el código en tu recibo o contacta a administración.');
            }
        }

        if (session.currentStep === 4) {
            if (input === 'REG_NEW_YES') {
                session.currentFlow = null;
                await this.sessionRepo.update(session);
                return WhatsappResponseHelper.text(from, '✅ Tu solicitud de registro ha sido enviada al administrador.\n\nTe avisaremos por aquí cuando sea aprobada. (Proceso de registro con WhatsApp Flow en desarrollo)');
            }
        }

        // --- Path B: Doesn't Know Code ---
        if (session.currentStep === 10) {
            session.data.tempBuilding = input;
            session.currentStep = 11;
            await this.sessionRepo.update(session);
            return WhatsappResponseHelper.text(from, `Gracias. Ahora dime el *Número de tu Departamento o Unidad* en ${input}:`);
        }

        if (session.currentStep === 11) {
            const buildingName = session.data.tempBuilding;
            const unitNumber = input;

            const resident = await this.residentRepo.findByBuildingAndSubunit(buildingName, unitNumber);

            if (resident) {
                session.currentStep = 2; // Now validate identity
                session.data.tempRegistration = { subunitCode: resident.subunitCode };
                await this.sessionRepo.update(session);
                return WhatsappResponseHelper.text(from, `¡Encontrado! El código de tu unidad es *${resident.subunitCode}*.\n\nPara finalizar la vinculación, por favor envíame tu *Nombre, Apellido y DNI*:`);
            } else {
                session.currentFlow = null;
                await this.sessionRepo.update(session);
                return WhatsappResponseHelper.text(from, 'Lo siento, no encontré ese departamento en nuestros registros. Por favor, contacta a soporte: https://wa.me/51986301418');
            }
        }

        return this.handleMainMenu('', from, session);
    }

    private async handleProviderFlow(input: string, from: string, session: any): Promise<any> {
        if (!session.data.provider) {
            session.data.provider = {};
        }

        // Step 1: Seleccionar tipo de proveedor
        if (session.currentStep === 1) {
            if (input === 'PROV_MANT') {
                session.data.provider.type = 'mantenimiento';
                session.currentStep = 2;
                await this.sessionRepo.update(session);
                return WhatsappResponseHelper.text(from, '🏢 *Registro de Proveedor - Mantenimiento*\n\nPor favor, envíame el *Nombre de tu Empresa*:');
            }
            if (input === 'PROV_INSUMOS') {
                session.data.provider.type = 'insumos';
                session.currentStep = 2;
                await this.sessionRepo.update(session);
                return WhatsappResponseHelper.text(from, '🏢 *Registro de Proveedor - Insumos*\n\nPor favor, envíame el *Nombre de tu Empresa*:');
            }
        }

        // Step 2: Nombre de Empresa (con validación IA)
        if (session.currentStep === 2) {
            const validation = await this.validationService.validateCompanyName(input);
            if (!validation.isValid) {
                return WhatsappResponseHelper.text(from, `⚠️ ${validation.feedback}\n\nPor favor, envíame el nombre de la empresa nuevamente:`);
            }
            session.data.provider.companyName = input;
            session.currentStep = 3;
            await this.sessionRepo.update(session);
            return WhatsappResponseHelper.text(from, '📝 *Número de RUC*\n\nPor favor, envíame el RUC de tu empresa (11 dígitos):');
        }

        // Step 3: RUC (con validación IA)
        if (session.currentStep === 3) {
            const validation = await this.validationService.validateRUC(input);
            if (!validation.isValid) {
                return WhatsappResponseHelper.text(from, `⚠️ ${validation.feedback}`);
            }
            session.data.provider.ruc = input;
            session.currentStep = 4;
            await this.sessionRepo.update(session);
            return WhatsappResponseHelper.text(from, '👤 *Persona de Contacto*\n\nPor favor, envíame el nombre de la persona de contacto:');
        }

        // Step 4: Persona de Contacto (con validación IA)
        if (session.currentStep === 4) {
            const validation = await this.validationService.validatePersonName(input);
            if (!validation.isValid) {
                return WhatsappResponseHelper.text(from, `⚠️ ${validation.feedback}\n\nPor favor, envíame el nombre de la persona de contacto nuevamente:`);
            }
            session.data.provider.contactPerson = input;
            session.currentStep = 5;
            await this.sessionRepo.update(session);
            return WhatsappResponseHelper.text(from, '📍 *Dirección*\n\nPor favor, envíame la dirección de tu empresa:');
        }

        // Step 5: Dirección
        if (session.currentStep === 5) {
            session.data.provider.address = input;
            session.currentStep = 6;
            await this.sessionRepo.update(session);

            if (session.data.provider.type === 'mantenimiento') {
                return WhatsappResponseHelper.text(from, '🔧 *Especialidad de Mantenimiento*\n\nPor favor, envíame la especialidad (por ejemplo: Electricidad, Plomería, Carpintería, Limpieza, etc.):');
            } else {
                return WhatsappResponseHelper.text(from, '📦 *Tipo de Insumos*\n\nPor favor, envíame el tipo de insumos que provees (por ejemplo: Limpieza, Oficina, Ferretería, Electricidad, etc.):');
            }
        }

        // Step 6: Especialidad/Tipo de Insumos
        if (session.currentStep === 6) {
            session.data.provider.specialty = input;

            // Guardar en MongoDB
            const providerData = {
                phoneNumber: from,
                type: session.data.provider.type,
                companyName: session.data.provider.companyName,
                ruc: session.data.provider.ruc,
                contactPerson: session.data.provider.contactPerson,
                address: session.data.provider.address,
                specialty: session.data.provider.specialty,
                status: 'PENDIENTE'
            };

            await this.providerRepo.save(providerData as any);

            // Limpiar sesión
            session.currentFlow = null;
            session.currentStep = 0;
            session.data = {};
            await this.sessionRepo.update(session);

            return WhatsappResponseHelper.text(
                from,
                '✅ ¡Gracias!\nTu solicitud ha sido registrada correctamente 📝\n\n👨‍💼 Un asesor de nuestro equipo la atenderá a la brevedad y se contactará contigo apenas esté disponible 📞'
            );
        }

        return this.handleMainMenu('', from, session);
    }
}
