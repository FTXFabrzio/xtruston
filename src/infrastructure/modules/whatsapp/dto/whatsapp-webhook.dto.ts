export type WhatsappWebhookDto = {
  entry: Array<{
    changes: Array<{
      value: {
        messages?: Array<{
          id: string;
          from: string;
          timestamp: string;
          type: 'text' | 'interactive' | string;
          text?: {
            body: string;
          };
          interactive?: {
            type: 'list_reply' | 'button_reply';
            list_reply?: {
              id: string;
              title?: string;
            };
            button_reply?: {
              id: string;
              title?: string;
            };
          };
        }>;
      };
    }>;
  }>;
};
