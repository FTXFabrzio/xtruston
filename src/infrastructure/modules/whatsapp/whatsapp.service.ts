import { Injectable, Logger } from '@nestjs/common';
import { WhatsappWebhookDto } from './dto/whatsapp-webhook.dto';
import { WhatsappMapper } from './whatsapp.mapper';
import { HandleIncomingMessageUseCase } from 'src/application/use-cases/messages/handle-incoming-message.use-case';
import { WhatsappClient } from './whatsapp.client';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    private readonly handleIncoming: HandleIncomingMessageUseCase,
    private readonly whatsappClient: WhatsappClient,
  ) { }

  async handleIncomingMessage(payload: WhatsappWebhookDto) {
    try {
      this.logger.log('📩 Received webhook payload');

      const incoming = WhatsappMapper.toIncomingMessage(payload);
      if (!incoming) return { status: 'ignored' };

      // PROCESO EN SEGUNDO PLANO
      this.processIncomingMessage(incoming).catch(err => {
        this.logger.error('💥 Background process error:', err.message);
      });

      // Respondemos de inmediato
      const messages = payload.entry?.[0]?.changes?.[0]?.value?.messages;
      return {
        status: 'received',
        messageId: messages && messages.length > 0 ? messages[0].id : 'no-id'
      };
    } catch (error: any) {
      this.logger.error('💥 Error in webhook handler:', error.message);
      return { status: 'error' };
    }
  }

  private async processIncomingMessage(incoming: any) {
    this.logger.log(`📱 Processing message from ${incoming.from}: ${incoming.text || incoming.actionId}`);

    const result = await this.handleIncoming.execute(incoming);

    if (result) {
      const results = Array.isArray(result) ? result : [result];
      for (const msg of results) {
        if (msg.to && msg.to.length === 9) msg.to = `51${msg.to}`;
        await this.whatsappClient.sendMessage(msg);
      }
      this.logger.log('✅ Response sent to WhatsApp');
    }
  }
}
