import { Injectable, Logger } from '@nestjs/common';
import { ValidateResidentUseCase } from '../resident/validate-resident.use-case';

@Injectable()
export class HandleIncomingMessageUseCase {
  private readonly logger = new Logger(HandleIncomingMessageUseCase.name);

  constructor(
    private readonly validateResident: ValidateResidentUseCase,
  ) { }

  async execute(message: any): Promise<any> {
    const { from, body } = message; // Simplified message structure
    this.logger.log(`Processing message from ${from}: ${body}`);

    // 1. Validate Resident
    const resident = await this.validateResident.execute(from);

    if (!resident) {
      // Non-resident flow
      this.logger.log(`User ${from} not found in resident list.`);
      return { type: 'NON_RESIDENT_MENU' };
    }

    this.logger.log(`User ${from} identified as resident: ${resident.name} (${resident.status})`);

    // 2. Check Status
    if (resident.status === 'EN REVISION') {
      return {
        type: 'TEXT',
        content: `¡Hola! 🕒 Aún estamos esperando la confirmación de tu administrador para activar tu cuenta. Te avisaré por aquí apenas esté listo. ¡Gracias por tu paciencia! ✨`
      };
    }

    if (resident.status === 'ANULADO' || resident.status === 'RECHAZADO') {
      return {
        type: 'TEXT',
        content: `Lo siento, luego de consultar con el administrador hemos anulado tu solicitud. Por favor, comunícate con él para más detalles. ✋`
      };
    }

    if (resident.status === 'APROBADO') {
      // 3. Show Resident Menu (7 options)
      return {
        type: 'RESIDENT_MENU',
        residentName: resident.name,
        building: resident.buildingCode, // Should lookup building details
        unit: resident.departmentUnit
      };
    }

    return { type: 'UNKNOWN_STATE' };
  }
}
