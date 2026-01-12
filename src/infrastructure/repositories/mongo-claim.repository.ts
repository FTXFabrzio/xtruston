import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IClaimRepository } from 'src/domain/repositories/claim.repository.interface';
import { Claim } from 'src/domain/entities/claim.entity';
import { ClaimDocument } from '../database/schemas/claim.schema';

@Injectable()
export class MongoClaimRepository implements IClaimRepository {
  constructor(
    @InjectModel(ClaimDocument.name) private claimModel: Model<ClaimDocument>,
  ) {}

  async save(claim: Claim): Promise<void> {
    const createdClaim = new this.claimModel({
      ticketNumber: claim.ticketNumber,
      residentPhone: claim.residentPhone,
      residentName: claim.residentName,
      unit: claim.unit,
      description: claim.description,
      status: claim.status,
    });
    await createdClaim.save();
  }

  async findById(id: string): Promise<Claim | null> {
    const doc = await this.claimModel.findById(id).exec();
    if (!doc) return null;
    return new Claim(
      doc._id.toString(),
      doc.ticketNumber,
      doc.residentPhone,
      doc.residentName,
      doc.unit,
      doc.description,
      doc.status as any,
      (doc as any).createdAt,
    );
  }

  async findAllByResidentPhone(phone: string): Promise<Claim[]> {
    const docs = await this.claimModel.find({ residentPhone: phone }).exec();
    return docs.map(
      (doc) =>
        new Claim(
          doc._id.toString(),
          doc.ticketNumber,
          doc.residentPhone,
          doc.residentName,
          doc.unit,
          doc.description,
          doc.status as any,
          (doc as any).createdAt,
        ),
    );
  }
}
