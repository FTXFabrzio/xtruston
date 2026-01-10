export interface IDocumentRepository {
    findReceipt(buildingCode: string, unit: string, monthYear: string): Promise<string | null>; // Returns link or path
    findEconomicReport(buildingCode: string, monthYear?: string): Promise<string | null>;
    findRules(buildingCode: string): Promise<string | null>;
}
