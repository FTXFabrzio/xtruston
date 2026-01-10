import { Injectable, Inject } from '@nestjs/common';
import { ICandidateRepository } from '../../../domain/repositories/candidate.repository.interface';
import { Candidate } from '../../../domain/entities/candidate.entity';

@Injectable()
export class RegisterJobApplicationUseCase {
    constructor(
        @Inject('ICandidateRepository')
        private readonly candidateRepository: ICandidateRepository,
    ) { }

    async execute(dto: any): Promise<void> {
        const candidate = new Candidate(
            '',
            dto.fullName,
            dto.documentNumber,
            dto.district,
            dto.email,
            dto.message,
            dto.phoneNumber,
            new Date(),
            'POSTULADO'
        );
        await this.candidateRepository.save(candidate);
    }
}
