import { Injectable, Inject } from '@nestjs/common';
import { IClaimRepository } from '../../../domain/repositories/claim.repository.interface';
import { Claim } from '../../../domain/entities/claim.entity';

@Injectable()
export class RegisterClaimUseCase {
    constructor(
        @Inject('IClaimRepository')
        private readonly claimRepository: IClaimRepository,
    ) { }

    async execute(dto: { residentPhone: string, residentName: string, unit: string, description: string }): Promise<Claim> {
        const ticketNumber = `TKT-${Date.now()}`;
        const claim = new Claim(
            '', // MongoDB generates ID
            ticketNumber,
            dto.residentPhone,
            dto.residentName,
            dto.unit,
            dto.description,
            'REGISTRADO',
            new Date()
        );

        await this.claimRepository.save(claim);
        return claim;
    }
}
