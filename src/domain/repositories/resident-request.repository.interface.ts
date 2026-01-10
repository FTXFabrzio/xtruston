import { ResidentRequest } from '../entities/resident-request.entity';

export interface IResidentRequestRepository {
    save(request: ResidentRequest): Promise<void>;
    findByPhoneNumber(phoneNumber: string): Promise<ResidentRequest | null>;
}
