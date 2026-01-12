import { Injectable, Inject } from '@nestjs/common';
import { IResidentRepository } from '../../../domain/repositories/resident.repository.interface';
import { Resident } from '../../../domain/entities/resident.entity';

@Injectable()
export class UpdateResidentProfileUseCase {
  constructor(
    @Inject('IResidentRepository')
    private readonly residentRepository: IResidentRepository,
  ) { }

  async execute(
    phoneNumber: string,
    updates: Partial<Resident>,
  ): Promise<boolean> {
    const resident =
      await this.residentRepository.findByPhoneNumber(phoneNumber);
    if (!resident) return false;

    // Create updated resident object. Since entities are immutable-ish in this design, create new instance.
    const updatedResident = new Resident(
      resident.id,
      updates.name ?? resident.name,
      updates.lastName ?? resident.lastName,
      updates.departmentName ?? resident.departmentName,
      updates.subunitNumber ?? resident.subunitNumber,
      updates.subunitCode ?? resident.subunitCode,
      updates.primaryPhone ?? resident.primaryPhone,
      updates.secondaryPhone ?? resident.secondaryPhone,
      updates.personalEmail ?? resident.personalEmail,
      updates.relation ?? resident.relation,
      resident.buildingCode,
      updates.documentType ?? resident.documentType,
      updates.documentNumber ?? resident.documentNumber,
      updates.startDate ?? resident.startDate,
      resident.status,
    );

    await this.residentRepository.update(updatedResident);
    return true;
  }
}
