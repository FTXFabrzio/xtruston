import { Injectable, Inject } from '@nestjs/common';
import type { IncomingMessageDto } from 'src/application/dto/messages/incoming-message.dto';
import type { ISessionRepository } from 'src/application/interfaces/session-repository.interface';
import type { IResidentDirectory } from 'src/application/interfaces/resident-directory.interface';
import { SESSION_REPOSITORY, RESIDENT_DIRECTORY } from 'src/application/tokens';
import { FlowStep } from 'src/application/dto/session/flow-step.enum';
import type { ChatSessionDto } from 'src/application/dto/session/chat-session.dto';

@Injectable()
export class HandleIncomingMessageUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepo: ISessionRepository,
    @Inject(RESIDENT_DIRECTORY)
    private readonly residentDirectory: IResidentDirectory,
  ) {}

  async execute(message: IncomingMessageDto) {
    // Obtener o crear sesión
    let session = await this.sessionRepo.get(message.from);

    if (!session) {
      session = {
        userId: message.from,
        step: FlowStep.ENTRY,
        flow: 'registration',
        slots: {},
        lastActivity: Date.now(),
      };
    }

    // Procesar según el step actual
    const response = await this.processStep(session, message);

    // Guardar sesión actualizada
    await this.sessionRepo.save(session);

    return {
      reply: response,
      from: message.from,
      channel: message.channel,
    };
  }

  private async processStep(session: ChatSessionDto, message: IncomingMessageDto): Promise<string> {
    switch (session.step) {
      case FlowStep.ENTRY:
        return this.handleEntry(session, message);

      case FlowStep.NON_RESIDENT_MENU:
        return this.handleNonResidentMenu(session, message);

      case FlowStep.ASK_SUBUNIT_CODE:
        return this.handleAskSubunitCode(session, message);

      case FlowStep.ASK_BUILDING_CODE:
        return this.handleAskBuildingCode(session, message);

      case FlowStep.ASK_DEPARTMENT_NUMBER:
        return this.handleAskDepartmentNumber(session, message);

      case FlowStep.ADMIN_ASK_FIRST_NAME:
        return this.handleAdminAskFirstName(session, message);

      case FlowStep.ADMIN_ASK_LAST_NAME:
        return this.handleAdminAskLastName(session, message);

      case FlowStep.ADMIN_ASK_EMAIL:
        return this.handleAdminAskEmail(session, message);

      case FlowStep.ADMIN_ASK_DOC_TYPE:
        return this.handleAdminAskDocType(session, message);

      case FlowStep.ADMIN_ASK_DOC_NUMBER:
        return this.handleAdminAskDocNumber(session, message);

      case FlowStep.RESIDENT_MENU:
        return this.handleResidentMenu(session, message);

      case FlowStep.DONE:
        return 'Gracias. Te contactará el administrador pronto.';

      default:
        session.step = FlowStep.ENTRY;
        return 'Hubo un error. Empecemos de nuevo.';
    }
  }

  // A) ENTRY - Buscar por teléfono
  private async handleEntry(session: ChatSessionDto, message: IncomingMessageDto): Promise<string> {
    const resident = await this.residentDirectory.findByPhone(message.from);

    if (resident) {
      session.resident = resident;
      session.flow = 'resident';
      session.step = FlowStep.RESIDENT_MENU;
      return `Hola ${resident.name}. MENÚ:\n1) Pagos\n2) Ticket\n3) Recibos`;
    }

    session.step = FlowStep.NON_RESIDENT_MENU;
    return '¡Hola! No encontré tu número.\n\n1) Soy residente\n2) Soy visitante\n3) Otro';
  }

  // B) NON_RESIDENT_MENU
  private handleNonResidentMenu(session: ChatSessionDto, message: IncomingMessageDto): string {
    const text = message.text?.toLowerCase() || '';
    const actionId = message.actionId || '';

    const isResident =
      actionId === 'menu_resident_start' ||
      text.includes('residente') ||
      text === '1';

    if (isResident) {
      session.step = FlowStep.ASK_SUBUNIT_CODE;
      return 'Perfecto. Pásame tu código de departamento (ej: LIBER501) o escribe "no recuerdo".';
    }

    return 'Por ahora solo atiendo residentes. Escribe "residente" si lo eres.';
  }

  // C) ASK_SUBUNIT_CODE
  private async handleAskSubunitCode(session: ChatSessionDto, message: IncomingMessageDto): Promise<string> {
    const code = message.text?.trim().toUpperCase() || '';

    if (code === 'NO RECUERDO' || code === 'NO') {
      session.step = FlowStep.ASK_BUILDING_CODE;
      return '¿Cuál es tu código de edificio? (ej: TOWER, LIBER)';
    }

    // Intentar buscar por código
    const resident = await this.residentDirectory.findBySubunitCode(code);

    if (resident) {
      session.resident = resident;
      session.flow = 'resident';
      session.step = FlowStep.RESIDENT_MENU;
      return `¡Perfecto ${resident.name}! Ya te identifiqué.\n\nMENÚ:\n1) Pagos\n2) Ticket\n3) Recibos`;
    }

    // No encontrado, preguntar por edificio
    session.step = FlowStep.ASK_BUILDING_CODE;
    session.slots.attempted_subunit = code;
    return 'No encontré ese código. ¿Cuál es tu código de edificio? (ej: TOWER, LIBER) o "no recuerdo"';
  }

  // D) ASK_BUILDING_CODE
  private handleAskBuildingCode(session: ChatSessionDto, message: IncomingMessageDto): string {
    const building = message.text?.trim().toUpperCase() || '';

    if (building === 'NO RECUERDO' || building === 'NO') {
      session.step = FlowStep.ADMIN_ASK_FIRST_NAME;
      return 'No te preocupes. Voy a pedirte algunos datos para que el administrador te contacte.\n\n¿Cuál es tu nombre?';
    }

    session.slots.building_code = building;
    session.step = FlowStep.ASK_DEPARTMENT_NUMBER;
    return '¿Cuál es tu número de departamento? (ej: 501, 102)';
  }

  // E) ASK_DEPARTMENT_NUMBER
  private async handleAskDepartmentNumber(session: ChatSessionDto, message: IncomingMessageDto): Promise<string> {
    const deptNumber = message.text?.trim() || '';

    if (deptNumber === 'NO RECUERDO' || deptNumber === 'NO') {
      session.step = FlowStep.ADMIN_ASK_FIRST_NAME;
      return 'Entendido. Te voy a pedir algunos datos.\n\n¿Cuál es tu nombre?';
    }

    // Construir código completo
    const buildingCode = session.slots.building_code || '';
    const fullCode = buildingCode + deptNumber;

    const resident = await this.residentDirectory.findBySubunitCode(fullCode);

    if (resident) {
      session.resident = resident;
      session.flow = 'resident';
      session.step = FlowStep.RESIDENT_MENU;
      return `¡Listo ${resident.name}! Te identifiqué.\n\nMENÚ:\n1) Pagos\n2) Ticket\n3) Recibos`;
    }

    // No encontrado → ir a admin
    session.slots.department_number = deptNumber;
    session.step = FlowStep.ADMIN_ASK_FIRST_NAME;
    return 'No encontré ese departamento. Voy a pedirte algunos datos para que el administrador te ayude.\n\n¿Cuál es tu nombre?';
  }

  // F) Admin capture flow
  private handleAdminAskFirstName(session: ChatSessionDto, message: IncomingMessageDto): string {
    session.slots.first_name = message.text?.trim() || '';
    session.step = FlowStep.ADMIN_ASK_LAST_NAME;
    return '¿Cuál es tu apellido?';
  }

  private handleAdminAskLastName(session: ChatSessionDto, message: IncomingMessageDto): string {
    session.slots.last_name = message.text?.trim() || '';
    session.step = FlowStep.ADMIN_ASK_EMAIL;
    return '¿Cuál es tu email?';
  }

  private handleAdminAskEmail(session: ChatSessionDto, message: IncomingMessageDto): string {
    session.slots.email = message.text?.trim() || '';
    session.step = FlowStep.ADMIN_ASK_DOC_TYPE;
    return '¿Tipo de documento? (DNI, CE, Pasaporte)';
  }

  private handleAdminAskDocType(session: ChatSessionDto, message: IncomingMessageDto): string {
    session.slots.doc_type = message.text?.trim() || '';
    session.step = FlowStep.ADMIN_ASK_DOC_NUMBER;
    return '¿Número de documento?';
  }

  private handleAdminAskDocNumber(session: ChatSessionDto, message: IncomingMessageDto): string {
    session.slots.doc_number = message.text?.trim() || '';
    session.step = FlowStep.DONE;

    // Aquí podrías guardar en BD o enviar notificación al admin
    const summary = `
✅ Datos capturados:
- Nombre: ${session.slots.first_name} ${session.slots.last_name}
- Email: ${session.slots.email}
- Doc: ${session.slots.doc_type} ${session.slots.doc_number}
- Teléfono: ${session.userId}

El administrador te contactará pronto. ¡Gracias!
    `.trim();

    return summary;
  }

  // G) RESIDENT_MENU
  private handleResidentMenu(session: ChatSessionDto, message: IncomingMessageDto): string {
    const text = message.text?.toLowerCase() || '';
    const actionId = message.actionId || '';

    if (text === '1' || actionId === 'menu_payments') {
      return 'Aquí están tus pagos pendientes... (próximamente)';
    }

    if (text === '2' || actionId === 'menu_ticket') {
      return 'Creando ticket de soporte... (próximamente)';
    }

    if (text === '3' || actionId === 'menu_receipts') {
      return 'Aquí están tus recibos... (próximamente)';
    }

    return `Hola ${session.resident?.name}.\n\nMENÚ:\n1) Pagos\n2) Ticket\n3) Recibos\n\nEscribe el número de opción.`;
  }
}
