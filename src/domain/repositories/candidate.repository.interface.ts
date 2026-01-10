import { Candidate } from '../entities/candidate.entity';

export interface ICandidateRepository {
    save(candidate: Candidate): Promise<void>;
}
