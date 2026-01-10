import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IResidentRepository } from 'src/domain/repositories/resident.repository.interface';
import { Resident } from 'src/domain/entities/resident.entity';
import { GoogleSheetsService } from '../modules/google-sheets/google-sheets.service';

@Injectable()
export class GoogleSheetsResidentRepository implements IResidentRepository {
    private readonly logger = new Logger(GoogleSheetsResidentRepository.name);

    constructor(
        private readonly sheetsService: GoogleSheetsService,
        private readonly config: ConfigService,
    ) { }

    async findByPhoneNumber(phoneNumber: string): Promise<Resident | null> {
        const range = this.config.get<string>('GSHEETS_RANGE') ?? 'Sheet1!A:Z';
        const rows = await this.sheetsService.getRows(range);

        if (!rows || rows.length === 0) return null;

        const [headerRow, ...dataRows] = rows;

        // Configurable headers
        const phoneHeader = (this.config.get<string>('GSHEETS_PHONE_HEADER') ?? 'celular').toLowerCase().trim();
        const nameHeader = (this.config.get<string>('GSHEETS_NAME_HEADER') ?? 'nombre').toLowerCase().trim();
        const unitHeader = (this.config.get<string>('GSHEETS_UNIT_HEADER') ?? 'departamento').toLowerCase().trim();
        const buildHeader = (this.config.get<string>('GSHEETS_BUILDING_HEADER') ?? 'edificio').toLowerCase().trim();
        const statusHeader = (this.config.get<string>('GSHEETS_STATUS_HEADER') ?? 'estado').toLowerCase().trim();

        const headers = headerRow.map(h => h.toLowerCase().trim());
        const phoneIdx = headers.indexOf(phoneHeader);
        const nameIdx = headers.indexOf(nameHeader);
        const unitIdx = headers.indexOf(unitHeader); // Optional logic if needed
        const statusIdx = headers.indexOf(statusHeader);

        if (phoneIdx === -1) {
            this.logger.warn(`Phone header '${phoneHeader}' not found in sheets.`);
            return null;
        }

        const normalizedTarget = this.normalizePhone(phoneNumber);

        for (const row of dataRows) {
            const rowPhoneRaw = row[phoneIdx] || '';
            if (this.normalizePhone(rowPhoneRaw) === normalizedTarget || (rowPhoneRaw.includes('/') && rowPhoneRaw.split('/').some(p => this.normalizePhone(p) === normalizedTarget))) {
                // Found match
                const name = nameIdx !== -1 ? row[nameIdx] : 'Unknown';
                const unit = unitIdx !== -1 ? row[unitIdx] : 'Unknown';
                const statusRaw = statusIdx !== -1 ? row[statusIdx] : 'EN REVISION';

                let status: any = 'EN REVISION';
                if (statusRaw.toUpperCase().includes('APROBADO')) status = 'APROBADO';
                if (statusRaw.toUpperCase().includes('ANULADO')) status = 'ANULADO';

                // TODO: Building code logic might be implicit or in another column
                return new Resident(
                    rowPhoneRaw, // ID could be phone for now
                    name,
                    rowPhoneRaw,
                    unit,
                    'DEFAULT_BUILDING', // Placeholder
                    status
                );
            }
        }

        return null;
    }

    async save(resident: Resident): Promise<void> {
        // Implementation for writing back to sheets if needed
        // Or triggering an append
        this.logger.warn('save() not fully implemented for Google Sheets yet');
    }

    async update(resident: Resident): Promise<void> {
        // Implementation for update
        this.logger.warn('update() not fully implemented for Google Sheets yet');
    }

    private normalizePhone(phone: string): string {
        return phone.replace(/\D/g, '');
    }
}
