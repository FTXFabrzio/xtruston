import type { WhatsappWebhookDto } from './dto/whatsapp-webhook.dto';
import type { IncomingMessageDto } from 'src/application/dto/messages/incoming-message.dto';

export class WhatsappMapper {
  static toIncomingMessage(payload: WhatsappWebhookDto): IncomingMessageDto | null {
    const msg = payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!msg) return null;

    const timestamp = Number(msg.timestamp);

    // Caso 1: Mensaje de texto
    if (msg.type === 'text') {
      const text = msg.text?.body?.trim();
      if (!text) return null;

      return {
        channel: 'whatsapp',
        from: msg.from,
        timestamp,
        kind: 'text',
        text,
      };
    }

    // Caso 2: Mensaje interactive (list_reply o button_reply)
    if (msg.type === 'interactive' && msg.interactive) {
      const interactiveType = msg.interactive.type;

      if (interactiveType === 'list_reply' && msg.interactive.list_reply) {
        return {
          channel: 'whatsapp',
          from: msg.from,
          timestamp,
          kind: 'list_reply',
          actionId: msg.interactive.list_reply.id,
          actionTitle: msg.interactive.list_reply.title,
        };
      }

      if (interactiveType === 'button_reply' && msg.interactive.button_reply) {
        return {
          channel: 'whatsapp',
          from: msg.from,
          timestamp,
          kind: 'button_reply',
          actionId: msg.interactive.button_reply.id,
          actionTitle: msg.interactive.button_reply.title,
        };
      }
    }

    // Tipo no soportado
    return null;
  }
}
