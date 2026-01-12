export type IncomingMessageKind = 'text' | 'list_reply' | 'button_reply';

export interface IncomingMessageDto {
  channel: 'whatsapp';
  from: string;
  timestamp: number;

  kind: IncomingMessageKind;

  text?: string; // kind=text
  actionId?: string; // kind=list_reply | button_reply
  actionTitle?: string; // opcional (logs)
}
