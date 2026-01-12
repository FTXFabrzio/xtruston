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
    const credentialsJson = this.configService.get<string>(
      'GSHEETS_CREDENTIALS_JSON',
    );
    const spreadsheetId = this.configService.get<string>(
      'GSHEETS_SPREADSHEET_ID',
    );

    if (!credentialsJson || !spreadsheetId) {
      this.logger.error('Missing Google Sheets credentials or Spreadsheet ID');
      return;
    }

    this.spreadsheetId = spreadsheetId;

    try {
      const credentials = JSON.parse(credentialsJson);
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const client = await auth.getClient();
      this.sheets = google.sheets({ version: 'v4', auth: client as any });
      this.logger.log('Google Sheets Service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Google Sheets Service', error);
    }
  }

  async getRows(range: string): Promise<string[][]> {
    if (!this.sheets) await this.initialize();

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

  async appendRow(range: string, values: any[]): Promise<void> {
    if (!this.sheets) await this.initialize();

    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [values],
        },
      });
      this.logger.log(`Appended row to range ${range}`);
    } catch (error) {
      this.logger.error(`Error appending row to range ${range}`, error);
      throw error;
    }
  }

  async updateRow(range: string, values: any[]): Promise<void> {
    if (!this.sheets) await this.initialize();

    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values: [values],
        },
      });
      this.logger.log(`Updated row at range ${range}`);
    } catch (error) {
      this.logger.error(`Error updating row at range ${range}`, error);
      throw error;
    }
  }
}
