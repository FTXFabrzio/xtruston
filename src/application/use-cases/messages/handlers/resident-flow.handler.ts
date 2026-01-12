import { Injectable, Logger, Inject } from '@nestjs/common';
import { Resident } from 'src/domain/entities/resident.entity';
import { ConversationSessionRepository } from 'src/infrastructure/repositories/conversation-session.repository';
import { WhatsappResponseHelper } from 'src/application/utils/whatsapp-response.helper';
import { IBuildingRepository } from 'src/domain/repositories/building.repository.interface';
import { IDocumentRepository } from 'src/domain/repositories/document.repository.interface';
import { IClaimRepository } from 'src/domain/repositories/claim.repository.interface';

@Injectable()
export class ResidentFlowHandler {
    private readonly logger = new Logger(ResidentFlowHandler.name);

    constructor(
        private readonly sessionRepo: ConversationSessionRepository,
        @Inject('IBuildingRepository') private readonly buildingRepo: IBuildingRepository,
        @Inject('IDocumentRepository') private readonly documentRepo: IDocumentRepository,
        @Inject('IClaimRepository') private readonly claimRepo: IClaimRepository,
    ) { }

    async handle(message: any, resident: Resident, session: any): Promise<any> {
        const text = (message.text || '').trim().toUpperCase();
        const actionId = (message.actionId || '').trim().toUpperCase();
        const from = message.from;

        const input = actionId || text;

        // Reset if "HOLA" or "MENU"
        if (input === 'HOLA' || input === 'MENU' || input === 'SALIR') {
            session.currentFlow = null;
            session.currentStep = 0;
            session.data = {};
            await this.sessionRepo.update(session);

            if (input === 'HOLA' || input === 'MENU') {
                return this.handleMainMenu('', from, resident, session);
            }
        }

        if (!session.currentFlow) {
            return this.handleMainMenu(input, from, resident, session);
        }

        switch (session.currentFlow) {
            case 'PAYMENT_INFO':
                return this.handlePaymentFlow(input, from, resident, session);
            case 'CLAIM':
                return this.handleClaimFlow(input, from, resident, session);
            case 'RECEIPTS':
                return this.handleReceiptsFlow(input, from, resident, session);
            // Other flows...
            default:
                session.currentFlow = null;
                await this.sessionRepo.update(session);
                return this.handleMainMenu(input, from, resident, session);
        }
    }

    private async handleMainMenu(input: string, from: string, resident: Resident, session: any): Promise<any> {
        if (input === '1' || input.includes('PAGO')) {
            session.currentFlow = 'PAYMENT_INFO';
            session.currentStep = 1;
            await this.sessionRepo.update(session);
            return WhatsappResponseHelper.paymentInstructions(from);
        }

        if (input === '2' || input.includes('RECLAMO')) {
            session.currentFlow = 'CLAIM';
            session.currentStep = 1;
            await this.sessionRepo.update(session);
            return WhatsappResponseHelper.claimMenu(from);
        }

        if (input === '3' || input.includes('RECIBO')) {
            session.currentFlow = 'RECEIPTS';
            session.currentStep = 1;
            await this.sessionRepo.update(session);
            return WhatsappResponseHelper.receiptMenu(from);
        }

        if (input === '4' || input.includes('INFORME')) {
            return this.handleBuildingFile(from, resident.buildingCode, 'informe_economico', 'informe económico');
        }

        if (input === '5' || input.includes('REGLAMENTO')) {
            return this.handleBuildingFile(from, resident.buildingCode, 'reglamento_interno', 'reglamento interno');
        }

        if (input === '6' || input.includes('NORMA') || input.includes('CONVIVENCIA')) {
            return this.handleBuildingFile(from, resident.buildingCode, 'normas_generales', 'normas generales');
        }

        if (input === '7' || input.includes('ACTUALIZAR') || input.includes('DATOS')) {
            // Option 7: Profile
            // TODO: Display profile and buttons
            return WhatsappResponseHelper.text(from, 'Próximamente: Actualización de datos con WhatsApp Flows.');
        }

        // Default greeting / Menu
        return WhatsappResponseHelper.residentGreeting(
            from,
            resident.name,
            resident.relation || 'Residente',
            resident.subunitNumber || 'S/N',
            resident.departmentName || 'Edificio'
        );
    }

    private async handlePaymentFlow(text: string, from: string, resident: Resident, session: any): Promise<any> {
        if (text === 'PAY_YES' || text.includes('SI') || text.includes('INSTRUCCIONES')) {
            const building = await this.buildingRepo.findByCode(resident.buildingCode);
            if (!building) return WhatsappResponseHelper.text(from, 'No encontré información del edificio.');

            return WhatsappResponseHelper.bankDetails(
                from,
                building.communities,
                building.bank,
                building.accountName,
                building.mobileBankingName,
                building.account,
                building.cci,
                building.kashio,
                building.lateFees
            );
        }

        if (text === 'PAY_NO' || text.includes('NO') || text.includes('ADMINISTRADOR')) {
            const building = await this.buildingRepo.findByCode(resident.buildingCode);
            if (!building) return WhatsappResponseHelper.text(from, 'No encontré información del edificio.');

            return WhatsappResponseHelper.adminContact(
                from,
                building.communities,
                building.jAdmin,
                building.receptionMobile,
                building.presPhone,
                building.address
            );
        }

        return WhatsappResponseHelper.paymentInstructions(from);
    }

    private async handleClaimFlow(text: string, from: string, resident: Resident, session: any): Promise<any> {
        if (session.currentStep === 1) {
            if (text === 'CLAIM_NEW') {
                session.currentStep = 2;
                await this.sessionRepo.update(session);
                return WhatsappResponseHelper.text(from, '✍️ *Describe tu reclamo*\n\nPor favor, escribe brevemente el problema que deseas reportar 🚨\nIncluye solo la información necesaria.\n\n📌 Ejemplos:\n* 🚿 Fuga de agua en el baño del departamento\n* 🔊 Ruido constante en el piso superior durante la noche');
            }
            if (text === 'MENU_MAIN') {
                session.currentFlow = null;
                await this.sessionRepo.update(session);
                return this.handleMainMenu('', from, resident, session);
            }
        }

        if (session.currentStep === 2) {
            // Save claim to Mongo
            const ticket = `TK-${Math.floor(1000 + Math.random() * 9000)}`;
            const date = new Date().toLocaleDateString('es-PE');

            await this.claimRepo.save({
                ticketNumber: ticket,
                residentPhone: from,
                residentName: resident.name,
                unit: resident.subunitCode || resident.subunitNumber,
                description: text,
                status: 'REGISTRADO'
            } as any);

            session.currentStep = 1; // Return to selection menu if they want another
            await this.sessionRepo.update(session);

            return WhatsappResponseHelper.claimSuccess(from, ticket, date);
        }

        return WhatsappResponseHelper.claimMenu(from);
    }

    private async handleReceiptsFlow(text: string, from: string, resident: Resident, session: any): Promise<any> {
        // Simplified for now: just map mes/año logic
        const now = new Date();
        let targetMonthYear = '';

        if (text === 'REC_CURRENT') {
            targetMonthYear = `${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear()}`;
        } else if (text === 'REC_PREVIOUS') {
            const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            targetMonthYear = `${(prev.getMonth() + 1).toString().padStart(2, '0')}${prev.getFullYear()}`;
        } else if (text === 'REC_SELECT' || session.currentStep === 2) {
            if (session.currentStep === 1) {
                session.currentStep = 2;
                await this.sessionRepo.update(session);
                return WhatsappResponseHelper.text(from, 'Escribe el mes y año que deseas (ej: Agosto 2025)');
            }
            // Simple regex to extract month/year or just use string
            targetMonthYear = '082025'; // Placeholder for NLP logic
        }

        if (targetMonthYear) {
            // Search in Drive
            // Logic similar to handle-incoming-message.use-case
            return WhatsappResponseHelper.text(from, `Buscando recibo ${targetMonthYear}...`);
        }

        return WhatsappResponseHelper.receiptMenu(from);
    }

    private async handleBuildingFile(from: string, buildingCode: string, fileNamePart: string, humanName: string): Promise<any> {
        const files = await this.documentRepo.findFilesByBuilding(buildingCode);
        const file = files.find(f => f.name.toLowerCase().includes(fileNamePart));

        if (file) {
            return [
                WhatsappResponseHelper.text(from, `📄 *${humanName.toUpperCase()}* – Edificio ${buildingCode}\n\nAquí puedes revisar el documento solicitado.`),
                WhatsappResponseHelper.document(from, file.webContentLink || file.webViewLink, file.name)
            ];
        } else {
            const building = await this.buildingRepo.findByCode(buildingCode);
            if (!building) return WhatsappResponseHelper.text(from, `No encontré el ${humanName}.`);

            return [
                WhatsappResponseHelper.text(from, `Solicitud de ${humanName}\n\nNo está disponible automáticamente. Coordina con el administrador:`),
                WhatsappResponseHelper.adminContact(from, building.communities, building.jAdmin, building.receptionMobile, building.presPhone, building.address)
            ];
        }
    }
}
