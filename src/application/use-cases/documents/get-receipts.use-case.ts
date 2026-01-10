import { Injectable, Inject } from '@nestjs/common';
import { IDocumentRepository } from '../../../domain/repositories/document.repository.interface';

@Injectable()
export class GetResidentReceiptsUseCase {
    constructor(
        @Inject('IDocumentRepository')
        private readonly documentRepository: IDocumentRepository,
    ) { }

    async execute(buildingCode: string, unit: string, monthYear: string): Promise<string | null> {
        return await this.documentRepository.findReceipt(buildingCode, unit, monthYear);
    }
}
