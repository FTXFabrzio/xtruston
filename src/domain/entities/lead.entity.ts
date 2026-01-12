export class Lead {
  constructor(
    public readonly id: string,
    public readonly buildingName: string,
    public readonly units: number,
    public readonly address: string,
    public readonly district: string,
    public readonly contactName: string,
    public readonly email: string,
    public readonly phoneNumber: string,
    public readonly createdAt: Date,
  ) {}
}
