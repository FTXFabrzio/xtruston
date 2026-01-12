import { Body, Controller, Get, Post, Query, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import type { WhatsappWebhookDto } from './dto/whatsapp-webhook.dto';
import { ConfigService } from '@nestjs/config';

/**
 * WhatsApp Webhook Controller
 * 
 * Environment-aware: Works in both development and production
 * - Development: Uses ngrok tunneling (no code changes needed)
 * - Production: Works directly with AWS endpoints
 * 
 * WhatsApp API will automatically bypass ngrok warning pages for webhook requests
 */
@Controller('webhook')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly configService: ConfigService,
  ) { }

  /**
   * Webhook verification endpoint (GET)
   * WhatsApp sends a GET request to verify the webhook URL
   * This endpoint is called when you configure the webhook in Meta Developer Console
   */
  @Get('whatsapp')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    const verifyToken = this.configService.get<string>('WHATSAPP_VERIFY_TOKEN');

    // Check if mode and token are correct
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('✅ Webhook verified successfully!');
      // Respond with the challenge token from the request
      return challenge;
    } else {
      console.log('❌ Webhook verification failed!');
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }

  /**
   * Webhook endpoint to receive messages (POST)
   */
  @Post('whatsapp')
  async receiveMessage(@Body() payload: WhatsappWebhookDto) {
    this.logger.log('🔔 POST request received at /webhook/whatsapp');
    return this.whatsappService.handleIncomingMessage(payload);
  }
}
