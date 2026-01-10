import { Claim } from '../entities/claim.entity';

export interface IClaimRepository {
    save(claim: Claim): Promise<void>;
    findById(id: string): Promise<Claim | null>;
    findAllByResidentPhone(phone: string): Promise<Claim[]>;
}
