import { Injectable, Inject } from '@nestjs/common';
import { IResidentRepository } from '../../../domain/repositories/resident.repository.interface';
import { IResidentRequestRepository } from '../../../domain/repositories/resident-request.repository.interface';
import { Resident } from '../../../domain/entities/resident.entity';

@Injectable()
export class ValidateResidentUseCase {
  constructor(
    @Inject('IResidentRepository')
    private readonly residentRepository: IResidentRepository,
    @Inject('IResidentRequestRepository')
    private readonly residentRequestRepository: IResidentRequestRepository,
  ) { }

  async execute(phoneNumber: string): Promise<Resident | null> {
    // 1. Check Excel (Official List)
    const resident =
      await this.residentRepository.findByPhoneNumber(phoneNumber);
    if (resident) return resident;

    // 2. Check Pending Requests (Mongo)
    const request =
      await this.residentRequestRepository.findByPhoneNumber(phoneNumber);
    if (request && request.status === 'PENDING') {
      // Map to Resident with EN REVISION status
      return new Resident(
        request.id,
        request.name,
        '', // lastName
        '', // departmentName
        '', // subunitNumber
        request.unit, // subunitCode
        request.phoneNumber, // primaryPhone
        '', // secondaryPhone
        '', // personalEmail
        '', // relation
        request.buildingCode,
        '', // documentType
        '', // documentNumber
        '', // startDate
        'EN REVISION',
      );
    }

    return null;
  }
}
