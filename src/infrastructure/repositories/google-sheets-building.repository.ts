import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IBuildingRepository } from 'src/domain/repositories/building.repository.interface';
import { Building } from 'src/domain/entities/building.entity';
import { GoogleSheetsService } from '../modules/google-sheets/google-sheets.service';

@Injectable()
export class GoogleSheetsBuildingRepository implements IBuildingRepository {
    private readonly logger = new Logger(GoogleSheetsBuildingRepository.name);

    constructor(
        private readonly sheetsService: GoogleSheetsService,
        private readonly config: ConfigService,
    ) { }

    async findByCode(code: string): Promise<Building | null> {
        const range = 'Edificios!A:Z'; // Convention: sheet name Edificios
        const rows = await this.sheetsService.getRows(range);

        if (!rows || rows.length === 0) return null;

        const [headerRow, ...dataRows] = rows;

        const codeIdx = headerRow.findIndex(h => h.toLowerCase().trim() === 'codigo');
        const nameIdx = headerRow.findIndex(h => h.toLowerCase().trim() === 'nombre');
        const payIdx = headerRow.findIndex(h => h.toLowerCase().trim() === 'medios_pago');
        const driveIdx = headerRow.findIndex(h => h.toLowerCase().trim() === 'drive_id');

        if (codeIdx === -1) {
            this.logger.warn('Building code header not found');
            return null;
        }

        const target = code.trim().toLowerCase();

        for (const row of dataRows) {
            if (row[codeIdx]?.trim().toLowerCase() === target) {
                const name = nameIdx !== -1 ? row[nameIdx] : 'Unknown';
                const paymentMethods = payIdx !== -1 ? (row[payIdx] || '').split(',').map(s => s.trim()) : [];
                const driveId = driveIdx !== -1 ? row[driveIdx] : '';

                return new Building(
                    row[codeIdx], // ID = Code
                    name,
                    row[codeIdx],
                    'Address Placeholder',
                    paymentMethods,
                    driveId
                );
            }
        }
        return null;
    }
}
