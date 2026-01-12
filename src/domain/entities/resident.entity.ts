export class Resident {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly lastName: string,
    public readonly departmentName: string,
    public readonly subunitNumber: string,
    public readonly subunitCode: string,
    public readonly primaryPhone: string,
    public readonly secondaryPhone: string,
    public readonly personalEmail: string,
    public readonly relation: string,
    public readonly buildingCode: string,
    public readonly documentType: string,
    public readonly documentNumber: string,
    public readonly startDate: string,
    public readonly status:
      | 'EN REVISION'
      | 'ACTIVO'
      | 'ANULADO'
      | 'RECHAZADO',
  ) { }
}
