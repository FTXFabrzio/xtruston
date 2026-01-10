import { Injectable, Inject } from '@nestjs/common';
import { IDocumentRepository } from '../../../domain/repositories/document.repository.interface';

@Injectable()
export class GetBuildingDocumentsUseCase {
    constructor(
        @Inject('IDocumentRepository')
        private readonly documentRepository: IDocumentRepository,
    ) { }

    async execute(type: 'ECONOMIC_REPORT' | 'RULES' | 'COEXISTENCE', buildingCode: string, monthYear?: string): Promise<string | null> {
        switch (type) {
            case 'ECONOMIC_REPORT':
                return await this.documentRepository.findEconomicReport(buildingCode, monthYear);
            case 'RULES':
                return await this.documentRepository.findRules(buildingCode);
            case 'COEXISTENCE':
                // Assuming coexistence norms might be same as rules or different file
                return await this.documentRepository.findRules(buildingCode); // Placeholder
            default:
                return null;
        }
    }
}
