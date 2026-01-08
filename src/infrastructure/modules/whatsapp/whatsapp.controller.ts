import { Body, Controller, Post } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import type { WhatsappWebhookDto } from './dto/whatsapp-webhook.dto';

@Controller('webhook')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('whatsapp')
  async receiveMessage(@Body() payload: WhatsappWebhookDto) {
    return this.whatsappService.handleIncomingMessage(payload);
  }
}
