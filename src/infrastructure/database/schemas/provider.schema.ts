import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'providers', timestamps: true })
export class ProviderDocument extends Document {
    @Prop({ required: true })
    companyName: string;

    @Prop()
    ruc: string;

    @Prop()
    contactName: string;

    @Prop()
    address: string;

    @Prop({ required: true })
    type: string; // MANTENIMIENTO | INSUMOS

    @Prop([String])
    specialties: string[];

    @Prop()
    phoneNumber: string;
}

export const ProviderSchema = SchemaFactory.createForClass(ProviderDocument);
