import { Injectable } from '@nestjs/common';
import { ConversationSessionRepository } from '../../../infrastructure/repositories/conversation-session.repository';
import { ConversationSession } from '../../../infrastructure/database/schemas/conversation-session.schema';

@Injectable()
export class ManageConversationContextUseCase {
    constructor(
        private readonly sessionRepository: ConversationSessionRepository,
    ) { }

    async getOrCreateSession(userId: string): Promise<ConversationSession> {
        let session = await this.sessionRepository.findByUserId(userId);

        if (!session) {
            // Crear nueva sesión
            session = await this.sessionRepository.createOrUpdate(userId, {
                userId,
                currentFlow: null,
                currentStep: 0,
                data: {},
                lastActivity: new Date(),
                expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            });
        }

        return session;
    }

    async updateSession(
        userId: string,
        updates: Partial<ConversationSession>,
    ): Promise<ConversationSession> {
        return this.sessionRepository.createOrUpdate(userId, updates);
    }

    async setFlow(
        userId: string,
        flow: string,
        step: number = 0,
        data: Record<string, any> = {},
    ): Promise<ConversationSession> {
        return this.sessionRepository.createOrUpdate(userId, {
            currentFlow: flow,
            currentStep: step,
            data,
        });
    }

    async clearSession(userId: string): Promise<void> {
        await this.sessionRepository.clearSession(userId);
    }

    async isInFlow(userId: string): Promise<boolean> {
        const session = await this.sessionRepository.findByUserId(userId);
        return session?.currentFlow !== null && session?.currentFlow !== undefined;
    }
}
