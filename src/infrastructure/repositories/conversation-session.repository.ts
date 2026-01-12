import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    ConversationSession,
    ConversationSessionDocument,
} from '../database/schemas/conversation-session.schema';

@Injectable()
export class ConversationSessionRepository {
    private readonly logger = new Logger(ConversationSessionRepository.name);

    constructor(
        @InjectModel(ConversationSession.name)
        private sessionModel: Model<ConversationSessionDocument>,
    ) { }

    async findByUserId(userId: string): Promise<ConversationSession | null> {
        return this.sessionModel.findOne({ userId }).exec();
    }

    async createOrUpdate(
        userId: string,
        updates: Partial<ConversationSession>,
    ): Promise<ConversationSession> {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutos

        return this.sessionModel
            .findOneAndUpdate(
                { userId },
                {
                    $set: {
                        ...updates,
                        lastActivity: now,
                        expiresAt,
                    },
                },
                { upsert: true, new: true },
            )
            .exec();
    }

    async update(session: any): Promise<void> {
        this.logger.log(`💾 Updating session for ${session.userId}: Flow=${session.currentFlow}, Step=${session.currentStep}`);
        // Usamos updateOne con $set para asegurar persistencia atómica
        await this.sessionModel.updateOne(
            { userId: session.userId },
            {
                $set: {
                    currentFlow: session.currentFlow,
                    currentStep: session.currentStep,
                    data: session.data,
                    lastActivity: new Date()
                }
            }
        ).exec();
    }

    async clearSession(userId: string): Promise<void> {
        await this.sessionModel.deleteOne({ userId }).exec();
    }

    async deleteExpired(): Promise<void> {
        const now = new Date();
        await this.sessionModel.deleteMany({ expiresAt: { $lt: now } }).exec();
    }
}
