import { Injectable, Logger } from '@nestjs/common';
import { IDocumentRepository } from 'src/domain/repositories/document.repository.interface';
import { GoogleDriveService } from '../modules/google-drive/google-drive.service';

@Injectable()
export class GoogleDriveDocumentRepository implements IDocumentRepository {
    private readonly logger = new Logger(GoogleDriveDocumentRepository.name);

    constructor(private readonly driveService: GoogleDriveService) { }

    async findReceipt(buildingCode: string, unit: string, monthYear: string): Promise<string | null> {
        // Logic: Search for file named like "{monthYear}" inside folder "{BuildingCode}/{Unit}"
        // This requires recursive search or smart query.
        // Query: name contains '{monthYear}' and mimeType = 'application/pdf'
        // Simplified: Just search name for now.

        const query = `name contains '${monthYear}' and mimeType = 'application/pdf'`;
        const files = await this.driveService.searchFiles(query);

        if (files.length > 0) {
            // Return webViewLink of first match
            return files[0].webViewLink;
        }
        return null;
    }

    async findEconomicReport(buildingCode: string, monthYear?: string): Promise<string | null> {
        const query = `name contains 'informe_economico' and mimeType = 'application/pdf'`;
        const files = await this.driveService.searchFiles(query);
        if (files.length > 0) return files[0].webViewLink;
        return null;
    }

    async findRules(buildingCode: string): Promise<string | null> {
        const query = `name contains 'reglamento'`;
        const files = await this.driveService.searchFiles(query);
        if (files.length > 0) return files[0].webViewLink;
        return null;
    }
}
