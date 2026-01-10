import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'leads', timestamps: true })
export class LeadDocument extends Document {
    @Prop()
    buildingName: string;

    @Prop()
    units: number;

    @Prop()
    address: string;

    @Prop()
    district: string;

    @Prop()
    contactName: string;

    @Prop()
    email: string;

    @Prop()
    phoneNumber: string;
}

export const LeadSchema = SchemaFactory.createForClass(LeadDocument);
