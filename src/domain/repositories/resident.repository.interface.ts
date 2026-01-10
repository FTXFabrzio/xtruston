import { Resident } from '../entities/resident.entity';

export interface IResidentRepository {
    findByPhoneNumber(phoneNumber: string): Promise<Resident | null>;
    save(resident: Resident): Promise<void>;
    update(resident: Resident): Promise<void>;
}
