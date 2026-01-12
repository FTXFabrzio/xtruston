import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'reclamos', timestamps: true })
export class ClaimDocument extends Document {
  @Prop({ unique: true })
  ticketNumber: string;

  @Prop({ required: true })
  residentPhone: string;

  @Prop()
  residentName: string;

  @Prop()
  unit: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: 'REGISTRADO' })
  status: string;
}

export const ClaimSchema = SchemaFactory.createForClass(ClaimDocument);
