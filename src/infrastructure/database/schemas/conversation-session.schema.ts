import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConversationSessionDocument = ConversationSession & Document;

@Schema({ timestamps: true })
export class ConversationSession {
    @Prop({ required: true, unique: true, index: true })
    userId: string; // phoneNumber

    @Prop({ type: String, default: null })
    currentFlow: string | null; // 'PAYMENT_INFO', 'RECEIPTS', 'CLAIM', etc.

    @Prop({ default: 0 })
    currentStep: number; // Paso actual dentro del flujo

    @Prop({ type: Object, default: {} })
    data: Record<string, any>; // Datos temporales del flujo

    @Prop({ required: true })
    lastActivity: Date;

    @Prop({ required: true })
    expiresAt: Date; // Auto-eliminar sesiones viejas
}

export const ConversationSessionSchema = SchemaFactory.createForClass(ConversationSession);

// Índice TTL para auto-eliminar sesiones expiradas
ConversationSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
