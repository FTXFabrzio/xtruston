import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IResidentRequestRepository } from 'src/domain/repositories/resident-request.repository.interface';
import { ResidentRequest } from 'src/domain/entities/resident-request.entity';
import { ResidentRequestDocument } from '../database/schemas/resident-request.schema';

@Injectable()
export class MongoResidentRequestRepository implements IResidentRequestRepository {
  constructor(
    @InjectModel(ResidentRequestDocument.name)
    private requestModel: Model<ResidentRequestDocument>,
  ) {}

  async save(request: ResidentRequest): Promise<void> {
    const doc = new this.requestModel({
      phoneNumber: request.phoneNumber,
      buildingCode: request.buildingCode,
      unit: request.unit,
      name: request.name,
      status: request.status,
    });
    // Upsert logic might be better if re-requesting
    await this.requestModel
      .findOneAndUpdate({ phoneNumber: request.phoneNumber }, doc, {
        upsert: true,
        new: true,
      })
      .exec();
  }

  async findByPhoneNumber(
    phoneNumber: string,
  ): Promise<ResidentRequest | null> {
    const doc = await this.requestModel.findOne({ phoneNumber }).exec();
    if (!doc) return null;
    return new ResidentRequest(
      doc._id.toString(),
      doc.phoneNumber,
      doc.buildingCode,
      doc.unit,
      doc.name,
      doc.status as any,
      (doc as any).createdAt || new Date(),
    );
  }
}
