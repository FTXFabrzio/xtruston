import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IVacancyRepository } from 'src/domain/repositories/vacancy.repository.interface';
import { Vacancy } from 'src/domain/entities/vacancy.entity';
import { GoogleSheetsService } from '../modules/google-sheets/google-sheets.service';

@Injectable()
export class GoogleSheetsVacancyRepository implements IVacancyRepository {
    private readonly logger = new Logger(GoogleSheetsVacancyRepository.name);

    constructor(
        private readonly sheetsService: GoogleSheetsService,
        private readonly config: ConfigService,
    ) { }

    async findAllActive(): Promise<Vacancy[]> {
        const range = this.config.get<string>('GSHEETS_RANGE_VACANCIES') ?? 'VACANTES!A:Z';
        const rows = await this.sheetsService.getRows(range);

        if (!rows || rows.length === 0) return [];

        const [headerRow, ...dataRows] = rows;
        const headers = headerRow.map((h) => (h || '').toUpperCase().trim());

        const COL_CARGO = headers.indexOf('CARGOS');
        const COL_ESTADO = headers.indexOf('ESTADO');

        if (COL_CARGO === -1 || COL_ESTADO === -1) {
            this.logger.warn('Required headers (CARGOS, ESTADO) not found in VACANTES sheet');
            return [];
        }

        const vacancies: Vacancy[] = [];

        for (const row of dataRows) {
            const status = (row[COL_ESTADO] || '').toUpperCase().trim();
            if (status === 'EN BUSCA') {
                vacancies.push(new Vacancy(
                    row[COL_CARGO] + Math.random().toString(), // Dummy ID
                    row[COL_CARGO] || '',
                    status
                ));
            }
        }

        return vacancies;
    }
}
