import { Injectable, Inject } from '@nestjs/common';
import { IBuildingRepository } from '../../../domain/repositories/building.repository.interface';

@Injectable()
export class GetBuildingPaymentInfoUseCase {
  constructor(
    @Inject('IBuildingRepository')
    private readonly buildingRepository: IBuildingRepository,
  ) { }

  async execute(buildingCode: string): Promise<string[]> {
    const building = await this.buildingRepository.findByCode(buildingCode);
    if (!building) return [];

    // Return payment information from the new structure
    const paymentInfo: string[] = [];
    if (building.account) paymentInfo.push(`Cuenta: ${building.account}`);
    if (building.cci) paymentInfo.push(`CCI: ${building.cci}`);
    if (building.bank) paymentInfo.push(`Banco: ${building.bank}`);
    if (building.accountName) paymentInfo.push(`Titular: ${building.accountName}`);

    return paymentInfo;
  }
}
