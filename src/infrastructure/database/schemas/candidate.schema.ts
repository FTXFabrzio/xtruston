import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'candidates', timestamps: true })
export class CandidateDocument extends Document {
  @Prop({ required: true })
  fullName: string;

  @Prop()
  documentNumber: string;

  @Prop()
  district: string;

  @Prop()
  email: string;

  @Prop()
  message: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ default: 'POSTULADO' })
  status: string;

  @Prop({ default: Date.now })
  appliedAt: Date;
}

export const CandidateSchema = SchemaFactory.createForClass(CandidateDocument);
