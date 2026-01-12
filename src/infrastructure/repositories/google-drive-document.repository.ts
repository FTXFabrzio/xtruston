import { Injectable, Logger } from '@nestjs/common';
import { IDocumentRepository } from 'src/domain/repositories/document.repository.interface';
import { GoogleDriveService } from '../modules/google-drive/google-drive.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleDriveDocumentRepository implements IDocumentRepository {
  private readonly logger = new Logger(GoogleDriveDocumentRepository.name);
  private readonly rootFolderId: string;

  constructor(
    private readonly driveService: GoogleDriveService,
    private readonly config: ConfigService,
  ) {
    this.rootFolderId = this.config.get<string>('GOOGLE_DRIVE_ROOT_FOLDER_ID') || '1OMcx-S4HueHxRx9Kg-vZp4draXwjnUbi';
  }

  async findReceipt(
    buildingCode: string,
    unit: string,
    monthYear: string,
  ): Promise<string | null> {
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

  async findEconomicReport(
    buildingCode: string,
    monthYear?: string,
  ): Promise<string | null> {
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

  async findFilesByBuilding(buildingCode: string): Promise<any[]> {
    this.logger.log(`Finding files for building: ${buildingCode}`);

    // 1. Find the folder for the building
    const folderQuery = `'${this.rootFolderId}' in parents and name = '${buildingCode}' and mimeType = 'application/vnd.google-apps.folder'`;
    const folders = await this.driveService.searchFiles(folderQuery);

    if (folders.length === 0) {
      this.logger.warn(`No folder found for building code: ${buildingCode}`);
      return [];
    }

    const folderId = folders[0].id;

    // 2. List files in that folder
    const filesQuery = `'${folderId}' in parents and trashed = false`;
    const files = await this.driveService.searchFiles(filesQuery);

    return files;
  }
}
