import { Injectable } from '@nestjs/common';
import type { ISessionRepository } from 'src/application/interfaces/session-repository.interface';
import type { ChatSessionDto } from 'src/application/dto/session/chat-session.dto';

@Injectable()
export class InMemorySessionRepository implements ISessionRepository {
  private readonly sessions = new Map<string, ChatSessionDto>();
  private readonly TTL_MS = 30 * 60 * 1000; // 30 minutos

  async get(userId: string): Promise<ChatSessionDto | null> {
    const session = this.sessions.get(userId);
    if (!session) return null;

    // Verificar si expiró
    const now = Date.now();
    if (now - session.lastActivity > this.TTL_MS) {
      this.sessions.delete(userId);
      return null;
    }

    return session;
  }

  async save(session: ChatSessionDto): Promise<void> {
    session.lastActivity = Date.now();
    this.sessions.set(session.userId, session);
  }

  async delete(userId: string): Promise<void> {
    this.sessions.delete(userId);
  }

  // Método opcional para limpiar sesiones expiradas periódicamente
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [userId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.TTL_MS) {
        this.sessions.delete(userId);
      }
    }
  }
}
