import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ILeadRepository } from 'src/domain/repositories/lead.repository.interface';
import { Lead } from 'src/domain/entities/lead.entity';
import { LeadDocument } from '../database/schemas/lead.schema';

@Injectable()
export class MongoLeadRepository implements ILeadRepository {
    constructor(
        @InjectModel(LeadDocument.name) private leadModel: Model<LeadDocument>,
    ) { }

    async save(lead: Lead): Promise<void> {
        const doc = new this.leadModel({
            buildingName: lead.buildingName,
            units: lead.units,
            address: lead.address,
            district: lead.district,
            contactName: lead.contactName,
            email: lead.email,
            phoneNumber: lead.phoneNumber,
        });
        await doc.save();
    }
}
