import type { ChatSessionDto } from '../dto/session/chat-session.dto';

export interface ISessionRepository {
  get(userId: string): Promise<ChatSessionDto | null>;
  save(session: ChatSessionDto): Promise<void>;
  delete(userId: string): Promise<void>;
}
