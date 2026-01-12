import { Injectable, Inject } from '@nestjs/common';
import { IResidentRequestRepository } from '../../../domain/repositories/resident-request.repository.interface';
import { IResidentRepository } from '../../../domain/repositories/resident.repository.interface';
import { ResidentRequest } from '../../../domain/entities/resident-request.entity';

@Injectable()
export class RegisterNewResidentRequestUseCase {
  constructor(
    @Inject('IResidentRequestRepository')
    private readonly residentRequestRepository: IResidentRequestRepository,
    @Inject('IResidentRepository')
    private readonly residentRepository: IResidentRepository,
  ) {}

  async execute(dto: {
    phoneNumber: string;
    unit: string;
    buildingCode: string;
    name: string;
  }): Promise<void> {
    // Ideally we check if phone matches the unit in Excel (Phase 1 validation) but here we assume user inputs data and we store request.
    const request = new ResidentRequest(
      '',
      dto.phoneNumber,
      dto.buildingCode,
      dto.unit,
      dto.name,
      'PENDING',
      new Date(),
    );
    await this.residentRequestRepository.save(request);
  }
}
