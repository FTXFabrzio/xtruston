import { FlowStep } from './flow-step.enum';

export interface ChatSessionDto {
  userId: string; // phone number
  step: FlowStep;
  flow: 'registration' | 'resident';
  slots: Record<string, string>; // datos capturados del usuario
  resident?: {
    id: string;
    name: string;
  };
  lastActivity: number; // timestamp para TTL
}
