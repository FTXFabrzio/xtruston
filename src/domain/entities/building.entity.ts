export class Building {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly code: string,
    public readonly address: string,
    public readonly paymentMethods: string[],
    public readonly driveFolderId: string, // For receipts/reports
  ) {}
}
