import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable()
export class GoogleSheetsService {
    private readonly logger = new Logger(GoogleSheetsService.name);
    private sheets: any;
    private spreadsheetId: string;

    constructor(private configService: ConfigService) {
        this.initialize();
    }

    private async initialize() {
        const credentialsJson = this.configService.get<string>('GSHEETS_CREDENTIALS_JSON');
        const spreadsheetId = this.configService.get<string>('GSHEETS_SPREADSHEET_ID');

        if (!credentialsJson || !spreadsheetId) {
            this.logger.error('Missing Google Sheets credentials or Spreadsheet ID');
            return;
        }

        this.spreadsheetId = spreadsheetId;

        try {
            const credentials = JSON.parse(credentialsJson);
            const auth = new google.auth.GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
            });

            const client = await auth.getClient();
            this.sheets = google.sheets({ version: 'v4', auth: client as any });
            this.logger.log('Google Sheets Service initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize Google Sheets Service', error);
        }
    }

    async getRows(range: string): Promise<string[][]> {
        if (!this.sheets) {
            // Retry init if failed previously or just throw
            this.logger.warn('Google Sheets not initialized, retrying...');
            await this.initialize();
            if (!this.sheets) throw new Error('Google Sheets not initialized');
        }

        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range,
            });
            return response.data.values || [];
        } catch (error) {
            this.logger.error(`Error reading rows from range ${range}`, error);
            throw error;
        }
    }
}
