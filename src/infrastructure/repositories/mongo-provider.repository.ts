import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IProviderRepository } from 'src/domain/repositories/provider.repository.interface';
import { Provider } from 'src/domain/entities/provider.entity';
import { ProviderDocument } from '../database/schemas/provider.schema';

@Injectable()
export class MongoProviderRepository implements IProviderRepository {
    constructor(
        @InjectModel(ProviderDocument.name) private providerModel: Model<ProviderDocument>,
    ) { }

    async save(provider: Provider): Promise<void> {
        const doc = new this.providerModel({
            companyName: provider.companyName,
            ruc: provider.ruc,
            contactName: provider.contactName,
            address: provider.address,
            type: provider.type,
            specialties: provider.specialties,
            phoneNumber: provider.phoneNumber,
        });
        await doc.save();
    }
}
