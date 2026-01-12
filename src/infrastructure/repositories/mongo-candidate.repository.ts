import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICandidateRepository } from 'src/domain/repositories/candidate.repository.interface';
import { Candidate } from 'src/domain/entities/candidate.entity';
import { CandidateDocument } from '../database/schemas/candidate.schema';

@Injectable()
export class MongoCandidateRepository implements ICandidateRepository {
  constructor(
    @InjectModel(CandidateDocument.name)
    private candidateModel: Model<CandidateDocument>,
  ) {}

  async save(candidate: Candidate): Promise<void> {
    const doc = new this.candidateModel({
      fullName: candidate.fullName,
      documentNumber: candidate.documentNumber,
      district: candidate.district,
      email: candidate.email,
      message: candidate.message,
      phoneNumber: candidate.phoneNumber,
      status: candidate.status,
    });
    await doc.save();
  }
}
