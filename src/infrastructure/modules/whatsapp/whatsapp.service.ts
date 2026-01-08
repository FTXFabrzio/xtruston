import { Injectable } from '@nestjs/common';
import { WhatsappWebhookDto } from './dto/whatsapp-webhook.dto';
import { WhatsappMapper } from './whatsapp.mapper';
import { HandleIncomingMessageUseCase } from 'src/application/use-cases/messages/handle-incoming-message.use-case';

@Injectable()

export class WhatsappService {
  constructor(private readonly handleIncoming: HandleIncomingMessageUseCase) {}

  async handleIncomingMessage(payload: WhatsappWebhookDto) {
    const incoming = WhatsappMapper.toIncomingMessage(payload);
    if (!incoming) return { status: 'ignored', reason: 'invalid_message' };

    const result = await this.handleIncoming.execute(incoming);

    return {
      status: 'received',
      normalized: incoming,
      result,
    };
  }
}
