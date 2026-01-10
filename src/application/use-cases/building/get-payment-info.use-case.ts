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
        return building.paymentMethods;
    }
}
