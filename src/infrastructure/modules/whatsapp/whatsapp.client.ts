import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WhatsappClient {
    private readonly logger = new Logger(WhatsappClient.name);
    private readonly baseUrl: string;
    private readonly accessToken: string;

    constructor(private readonly config: ConfigService) {
        const version = this.config.get<string>('WHATSAPP_VERSION', 'v21.0');
        const phoneNumberId = this.config.get<string>('WHATSAPP_PHONE_NUMBER_ID', '');
        this.accessToken = this.config.get<string>('WHATSAPP_ACCESS_TOKEN', '');

        this.baseUrl = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;
    }

    async sendMessage(payload: any): Promise<void> {
        const tokenDisplay = this.accessToken ? `${this.accessToken.substring(0, 5)}...` : 'MISSING';
        this.logger.log(`WhatsApp Client: Sending to ${this.baseUrl} with token: ${tokenDisplay}`);
        if (!this.accessToken || this.baseUrl.includes('undefined')) {
            this.logger.warn('WhatsApp credentials not fully configured. Skipping delivery.');
            this.logger.debug(`Payload would have been: ${JSON.stringify(payload)}`);
            return;
        }

        try {
            this.logger.log(`Sending WhatsApp message to ${payload.to}...`);
            const response = await axios.post(this.baseUrl, payload, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            this.logger.log(`WhatsApp message sent successfully: ${response.data.messages[0].id}`);
        } catch (error) {
            this.logger.error(
                `Failed to send WhatsApp message: ${error.response?.data?.error?.message || error.message}`,
                error.stack,
            );
            throw error;
        }
    }
}
