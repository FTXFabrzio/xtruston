import { Injectable, Logger } from '@nestjs/common';
import { ValidateResidentUseCase } from '../resident/validate-resident.use-case';
import { ManageConversationContextUseCase } from '../conversation/manage-context.use-case';
import { ResidentFlowHandler } from './handlers/resident-flow.handler';
import { NonResidentFlowHandler } from './handlers/non-resident-flow.handler';
import { WhatsappResponseHelper } from '../../utils/whatsapp-response.helper';

@Injectable()
export class HandleIncomingMessageUseCase {
  private readonly logger = new Logger(HandleIncomingMessageUseCase.name);

  constructor(
    private readonly validateResident: ValidateResidentUseCase,
    private readonly manageContext: ManageConversationContextUseCase,
    private readonly residentHandler: ResidentFlowHandler,
    private readonly nonResidentHandler: NonResidentFlowHandler,
  ) { }

  async execute(message: any): Promise<any> {
    const from = message.from;
    const text = (message.text || message.actionTitle || '').trim();
    this.logger.log(`Processing message from ${from}: ${text}`);

    try {
      // 1. Get or create session
      const session = await this.manageContext.getOrCreateSession(from);

      // 2. Validate Resident
      const resident = await this.validateResident.execute(from);

      if (!resident) {
        // Non-resident flow
        this.logger.log(`User ${from} mapping to NonResidentFlowHandler`);
        return this.nonResidentHandler.handle(message, session);
      }

      this.logger.log(
        `User ${from} identified as resident: ${resident.name} (${resident.status})`,
      );

      // 3. Check Status
      if (resident.status === 'EN REVISION') {
        return WhatsappResponseHelper.text(
          from,
          `¡Hola ${resident.name}! 🕒 Aún estamos esperando la confirmación de tu administrador para activar tu cuenta. Te avisaré por aquí apenas esté listo. ¡Gracias por tu paciencia! ✨`
        );
      }

      if (resident.status === 'ANULADO' || resident.status === 'RECHAZADO') {
        return WhatsappResponseHelper.text(
          from,
          `Lo siento ${resident.name}, luego de consultar con el administrador hemos anulado o rechazado tu solicitud. Por favor, comunícate con él para más detalles. ✋`
        );
      }

      if (resident.status === 'ACTIVO') {
        return this.residentHandler.handle(message, resident, session);
      }

      return WhatsappResponseHelper.text(from, 'Lo siento, hubo un error al procesar tu mensaje.');
    } catch (error) {
      this.logger.error(`Error processing message from ${from}:`, error.stack);
      // Return a friendly error message to the user
      return WhatsappResponseHelper.text(
        from,
        '⚠️ Lo siento, estamos experimentando problemas técnicos. Por favor, intenta nuevamente en unos minutos.'
      );
    }
  }
}
