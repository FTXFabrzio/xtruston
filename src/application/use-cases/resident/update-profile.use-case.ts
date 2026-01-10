import { Injectable, Inject } from '@nestjs/common';
import { IResidentRepository } from '../../../domain/repositories/resident.repository.interface';
import { Resident } from '../../../domain/entities/resident.entity';

@Injectable()
export class UpdateResidentProfileUseCase {
    constructor(
        @Inject('IResidentRepository')
        private readonly residentRepository: IResidentRepository,
    ) { }

    async execute(phoneNumber: string, updates: Partial<Resident>): Promise<boolean> {
        const resident = await this.residentRepository.findByPhoneNumber(phoneNumber);
        if (!resident) return false;

        // Create updated resident object. Since entities are immutable-ish in this design, create new instance.
        const updatedResident = new Resident(
            resident.id,
            updates.name ?? resident.name,
            resident.phoneNumber, // Usually phone is key, but if updating phone... checking logic is needed.
            resident.departmentUnit,
            resident.buildingCode,
            resident.status,
            updates.email ?? resident.email,
            updates.documentNumber ?? resident.documentNumber
        );

        await this.residentRepository.update(updatedResident);
        return true;
    }
}
