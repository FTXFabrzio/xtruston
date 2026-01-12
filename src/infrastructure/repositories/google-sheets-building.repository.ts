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
    const range = this.config.get<string>('GSHEETS_RANGE_BUILDINGS') ?? 'EDIFICIO!A:Z';
    const rows = await this.sheetsService.getRows(range);

    if (!rows || rows.length === 0) return null;

    const [headerRow, ...dataRows] = rows;
    const headers = headerRow.map((h) => h.toUpperCase().trim());

    // Mapping based on user provided fields
    const COL_FF = headers.indexOf('FF');
    const COL_TIPO_UNIDAD = headers.indexOf('TIPO_UNIDAD');
    const COL_CODIGO = headers.indexOf('CODIGO');
    const COL_JADMIN = headers.indexOf('JADMIN');
    const COL_COMUNIDADES = headers.indexOf('COMUNIDADES');
    const COL_DIRECCION = headers.indexOf('DIRECCION');
    const COL_CELULAR_PRES = headers.indexOf('CELULAR_PRES');
    const COL_MOVIL_RECEPCION = headers.indexOf('MOVIL_RECEPCION');
    const COL_REGLAMENTO = headers.indexOf('REGLAMENTO_INTERNO');
    const COL_KASHIO = headers.indexOf('KASHIO');
    const COL_CUENTA = headers.indexOf('CUENTA');
    const COL_CCI = headers.indexOf('CCI');
    const COL_NOMBRE_CUENTA = headers.indexOf('NOMBRE_CUENTA');
    const COL_NOMBRE_BANCA = headers.indexOf('NOMBRE_BANCA_MOVIL');
    const COL_AGENTE = headers.indexOf('AGENTE');
    const COL_MORAS = headers.indexOf('MORAS');
    const COL_BCO = headers.indexOf('BCO');
    const COL_DOMICILIO_FISCAL = headers.indexOf('DOMICILIO_FISCAL');
    const COL_RAZON_SOCIAL = headers.indexOf('RAZON_SOCIAL');
    const COL_RUC = headers.indexOf('RUC');

    if (COL_CODIGO === -1) {
      this.logger.warn('Building CODIGO header not found in EDIFICIO sheet');
      return null;
    }

    const target = code.trim().toUpperCase();

    for (const row of dataRows) {
      if ((row[COL_CODIGO] || '').trim().toUpperCase() === target) {
        return new Building(
          row[COL_CODIGO], // ID
          row[COL_FF] || '',
          row[COL_TIPO_UNIDAD] || '',
          row[COL_CODIGO] || '',
          row[COL_JADMIN] || '',
          row[COL_COMUNIDADES] || '',
          row[COL_DIRECCION] || '',
          row[COL_CELULAR_PRES] || '',
          row[COL_MOVIL_RECEPCION] || '',
          row[COL_REGLAMENTO] || '',
          row[COL_KASHIO] || '',
          row[COL_CUENTA] || '',
          row[COL_CCI] || '',
          row[COL_NOMBRE_CUENTA] || '',
          row[COL_NOMBRE_BANCA] || '',
          row[COL_AGENTE] || '',
          row[COL_MORAS] || '',
          row[COL_BCO] || '',
          row[COL_DOMICILIO_FISCAL] || '',
          row[COL_RAZON_SOCIAL] || '',
          row[COL_RUC] || '',
        );
      }
    }
    return null;
  }
}
