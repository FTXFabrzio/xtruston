import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable()
export class GoogleDriveService {
  private readonly logger = new Logger(GoogleDriveService.name);
  private drive: any;

  constructor(private configService: ConfigService) {
    this.initialize();
  }

  private async initialize() {
    const credentialsJson = this.configService.get<string>(
      'GSHEETS_CREDENTIALS_JSON',
    ); // Reuse credentials? Assuming same service account

    if (!credentialsJson) {
      this.logger.error('Missing credentials for Google Drive');
      return;
    }

    try {
      const credentials = JSON.parse(credentialsJson);
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      });

      const client = await auth.getClient();
      this.drive = google.drive({ version: 'v3', auth: client as any });
      this.logger.log('Google Drive Service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Google Drive Service', error);
    }
  }

  async searchFiles(query: string): Promise<any[]> {
    if (!this.drive) await this.initialize();

    try {
      this.logger.log(`Searching Drive files with query: ${query}`);
      const res = await this.drive.files.list({
        q: query,
        fields: 'files(id, name, webViewLink, webContentLink, mimeType, parents)',
      });
      return res.data.files || [];
    } catch (error) {
      this.logger.error(
        `Error searching drive files with query: ${query}`,
        error,
      );
      return [];
    }
  }
}
