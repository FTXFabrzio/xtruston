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
    const range = this.config.get<string>('GSHEETS_RANGE_RESIDENTS') ?? 'RESIDENTE!A:Z';
    const rows = await this.sheetsService.getRows(range);

    if (!rows || rows.length === 0) {
      this.logger.warn(`No rows found in range ${range}`);
      return null;
    }

    this.logger.log(`Read ${rows.length} rows from ${range}`);

    // Find the actual header row (the one that contains "NOMBRE")
    let headerIdx = rows.findIndex(row => row.some(cell => cell && cell.toString().toUpperCase().trim() === 'NOMBRE'));

    if (headerIdx === -1) {
      this.logger.warn(`Could not find header row with 'NOMBRE' in sheets.`);
      // Fallback to first row if not found, to maintain some logic
      headerIdx = 0;
    }

    const headerRow = rows[headerIdx];
    const dataRows = rows.slice(headerIdx + 1);

    const headers = headerRow.map((h) => (h || '').toUpperCase().trim());

    // User provided fields mapping
    const COL_NOMBRE = headers.indexOf('NOMBRE');
    const COL_APELLIDO = headers.indexOf('APELLIDO');
    const COL_DEP_NAME = headers.indexOf('NOMBRE_EDIFICIO');
    const COL_SUBUNIT_NRO = headers.indexOf('NRO_SUBUNIDAD');
    const COL_SUBUNIT_COD = headers.indexOf('CODIGO_SUBUNIDAD');
    const COL_CELULAR_PRI = headers.indexOf('CELULAR_PRINCIPAL');
    const COL_CELULAR_SEC = headers.indexOf('CELULAR_SECUNDARIO');
    const COL_CORREO = headers.indexOf('CORREO_PERSONAL');
    const COL_RELACION = headers.indexOf('RELACION');
    const COL_BUILD_COD = headers.indexOf('CODIGO_EDIFICIO');
    const COL_DOC_TYPE = headers.indexOf('TIPO_DOCUMENTO');
    const COL_DOC_NRO = headers.indexOf('NRO_DOCUMENTO');
    const COL_FECHA_INC = headers.indexOf('FECHA_INICIO');
    const COL_ESTADO = headers.indexOf('ESTADO');

    if (COL_CELULAR_PRI === -1) {
      this.logger.warn(`CELULAR_PRINCIPAL header not found in sheets.`);
      return null;
    }

    const normalizedTarget = this.normalizePhone(phoneNumber);

    for (const row of dataRows) {
      const phonePri = row[COL_CELULAR_PRI] || '';
      const phoneSec = COL_CELULAR_SEC !== -1 ? row[COL_CELULAR_SEC] || '' : '';

      const normPri = this.normalizePhone(phonePri);
      const normSec = this.normalizePhone(phoneSec);

      if (normPri === normalizedTarget || normSec === normalizedTarget) {
        return this.mapRowToResident(row, headers);
      }
    }

    return null;
  }

  async findByBuildingAndSubunit(buildingName: string, subunitNumber: string): Promise<Resident | null> {
    const range = this.config.get<string>('GSHEETS_RANGE_RESIDENTS') ?? 'RESIDENTE!A:Z';
    const rows = await this.sheetsService.getRows(range);

    if (!rows || rows.length === 0) return null;

    let headerIdx = rows.findIndex(row => row.some(cell => cell && cell.toString().toUpperCase().trim() === 'NOMBRE'));
    if (headerIdx === -1) headerIdx = 0;

    const headers = rows[headerIdx].map((h) => (h || '').toUpperCase().trim());
    const COL_BUILD_NAME = headers.indexOf('NOMBRE_EDIFICIO');
    const COL_SUBUNIT_NRO = headers.indexOf('NRO_SUBUNIDAD');

    if (COL_BUILD_NAME === -1 || COL_SUBUNIT_NRO === -1) return null;

    const dataRows = rows.slice(headerIdx + 1);

    for (const row of dataRows) {
      const bName = (row[COL_BUILD_NAME] || '').toUpperCase().trim();
      const sNro = (row[COL_SUBUNIT_NRO] || '').toUpperCase().trim();

      if (bName.includes(buildingName.toUpperCase()) && sNro === subunitNumber.toUpperCase()) {
        // Found matching row, return resident-like object or just enough data
        // Reuse mapping logic (this should be refactored into a builder)
        return this.mapRowToResident(row, headers);
      }
    }

    return null;
  }

  async findBySubunitCode(subunitCode: string): Promise<Resident | null> {
    const range = this.config.get<string>('GSHEETS_RANGE_RESIDENTS') ?? 'RESIDENTE!A:Z';
    const rows = await this.sheetsService.getRows(range);

    if (!rows || rows.length === 0) return null;

    let headerIdx = rows.findIndex(row => row.some(cell => cell && cell.toString().toUpperCase().trim() === 'NOMBRE'));
    if (headerIdx === -1) headerIdx = 0;

    const headers = rows[headerIdx].map((h) => (h || '').toUpperCase().trim());
    const COL_SUBUNIT_COD = headers.indexOf('CODIGO_SUBUNIDAD');

    if (COL_SUBUNIT_COD === -1) return null;

    const dataRows = rows.slice(headerIdx + 1);

    for (const row of dataRows) {
      if ((row[COL_SUBUNIT_COD] || '').toString().trim().toUpperCase() === subunitCode.toUpperCase()) {
        return this.mapRowToResident(row, headers);
      }
    }

    return null;
  }

  private mapRowToResident(row: any[], headers: string[]): Resident {
    const COL_NOMBRE = headers.indexOf('NOMBRE');
    const COL_APELLIDO = headers.indexOf('APELLIDO');
    const COL_DEP_NAME = headers.indexOf('NOMBRE_EDIFICIO');
    const COL_SUBUNIT_NRO = headers.indexOf('NRO_SUBUNIDAD');
    const COL_SUBUNIT_COD = headers.indexOf('CODIGO_SUBUNIDAD');
    const COL_CELULAR_PRI = headers.indexOf('CELULAR_PRINCIPAL');
    const COL_CELULAR_SEC = headers.indexOf('CELULAR_SECUNDARIO');
    const COL_CORREO = headers.indexOf('CORREO_PERSONAL');
    const COL_RELACION = headers.indexOf('RELACION');
    const COL_BUILD_COD = headers.indexOf('CODIGO_EDIFICIO');
    const COL_DOC_TYPE = headers.indexOf('TIPO_DOCUMENTO');
    const COL_DOC_NRO = headers.indexOf('NRO_DOCUMENTO');
    const COL_FECHA_INC = headers.indexOf('FECHA_INICIO');
    const COL_ESTADO = headers.indexOf('ESTADO');

    const statusRaw = COL_ESTADO !== -1 ? (row[COL_ESTADO] || '').toUpperCase() : '';
    let status: any = 'EN REVISION';
    if (statusRaw.includes('ACTIVO')) status = 'ACTIVO';
    else if (statusRaw.includes('ANULADO') || statusRaw.includes('RECHAZADO')) status = 'ANULADO';

    return new Resident(
      this.normalizePhone(row[COL_CELULAR_PRI] || ''),
      row[COL_NOMBRE] || '',
      row[COL_APELLIDO] || '',
      row[COL_DEP_NAME] || '',
      row[COL_SUBUNIT_NRO] || '',
      row[COL_SUBUNIT_COD] || '',
      row[COL_CELULAR_PRI] || '',
      row[COL_CELULAR_SEC] || '',
      row[COL_CORREO] || '',
      row[COL_RELACION] || '',
      row[COL_BUILD_COD] || '',
      row[COL_DOC_TYPE] || '',
      row[COL_DOC_NRO] || '',
      row[COL_FECHA_INC] || '',
      status,
    );
  }

  async save(resident: Resident): Promise<void> {
    const range = this.config.get<string>('GSHEETS_RANGE_RESIDENTS') ?? 'RESIDENTE!A:Z';
    const values = [
      resident.name,
      resident.lastName,
      resident.departmentName,
      resident.subunitNumber,
      resident.subunitCode,
      resident.primaryPhone,
      resident.secondaryPhone,
      resident.personalEmail,
      resident.relation,
      resident.buildingCode,
      resident.documentType,
      resident.documentNumber,
      resident.startDate,
      resident.status
    ];
    await this.sheetsService.appendRow(range, values);
  }

  async update(resident: Resident): Promise<void> {
    const range = this.config.get<string>('GSHEETS_RANGE_RESIDENTS') ?? 'RESIDENTE!A:Z';
    const rows = await this.sheetsService.getRows(range);

    if (!rows || rows.length === 0) return;

    let headerIdx = rows.findIndex(row => row.some(cell => cell && cell.toString().toUpperCase().trim() === 'NOMBRE'));
    if (headerIdx === -1) headerIdx = 0;

    const headers = rows[headerIdx].map((h) => (h || '').toUpperCase().trim());
    const COL_CELULAR_PRI = headers.indexOf('CELULAR_PRINCIPAL');
    const normTarget = this.normalizePhone(resident.primaryPhone);

    const rowIndex = rows.findIndex((row, idx) => {
      if (idx <= headerIdx) return false;
      return this.normalizePhone(row[COL_CELULAR_PRI] || '') === normTarget;
    });

    if (rowIndex === -1) {
      this.logger.warn(`Could not find resident with phone ${resident.primaryPhone} to update.`);
      return;
    }

    // Map fields to row values
    // This is tricky because appendRow is easier than update specific cells.
    // For now, I'll assume standard layout or use a whole row update if service supports it.
    this.logger.log(`Updating resident at row ${rowIndex + 1}`);

    // Construct the updated row values
    const updatedValues = [...rows[rowIndex]];
    const COL_NOMBRE = headers.indexOf('NOMBRE');
    const COL_APELLIDO = headers.indexOf('APELLIDO');
    const COL_CORREO = headers.indexOf('CORREO_PERSONAL');
    const COL_DOC_TYPE = headers.indexOf('TIPO_DOCUMENTO');
    const COL_DOC_NRO = headers.indexOf('NRO_DOCUMENTO');
    const COL_ESTADO = headers.indexOf('ESTADO');

    if (COL_NOMBRE !== -1) updatedValues[COL_NOMBRE] = resident.name;
    if (COL_APELLIDO !== -1) updatedValues[COL_APELLIDO] = resident.lastName;
    if (COL_CORREO !== -1) updatedValues[COL_CORREO] = resident.personalEmail;
    if (COL_DOC_TYPE !== -1) updatedValues[COL_DOC_TYPE] = resident.documentType;
    if (COL_DOC_NRO !== -1) updatedValues[COL_DOC_NRO] = resident.documentNumber;
    if (COL_ESTADO !== -1) updatedValues[COL_ESTADO] = resident.status;

    // The range for a single row should be RESIDENTE!A{row}:Z{row}
    const sheetName = range.split('!')[0];
    const updateRange = `${sheetName}!A${rowIndex + 1}`; // V4 API can take start cell

    await this.sheetsService.updateRow(updateRange, updatedValues);
  }

  private normalizePhone(phone: string): string {
    if (!phone) return '';
    const cleaned = phone.toString().replace(/\D/g, '');
    // Para Perú, si tiene 11 dígitos y empieza con 51, o si simplemente queremos los últimos 9
    return cleaned.length >= 9 ? cleaned.slice(-9) : cleaned;
  }
}
