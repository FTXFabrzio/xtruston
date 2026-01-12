import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'resident_requests', timestamps: true })
export class ResidentRequestDocument extends Document {
  @Prop({ required: true, unique: true }) // One active request per phone?
  phoneNumber: string;

  @Prop()
  buildingCode: string;

  @Prop()
  unit: string;

  @Prop()
  name: string;

  @Prop({ default: 'PENDING' })
  status: string;
}

export const ResidentRequestSchema = SchemaFactory.createForClass(
  ResidentRequestDocument,
);
