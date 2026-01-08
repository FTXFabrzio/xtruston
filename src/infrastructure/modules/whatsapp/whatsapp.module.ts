import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';

import { HandleIncomingMessageUseCase } from 'src/application/use-cases/messages/handle-incoming-message.use-case';
import { AuthenticateResidentUseCase } from 'src/application/use-cases/resident/authenticate-resident.use-case';

import { RESIDENT_DIRECTORY, SESSION_REPOSITORY } from 'src/application/tokens';
import { MockResidentDirectory } from './mock-resident-directory';
import { InMemorySessionRepository } from './in-memory-session.repository';

@Module({
  controllers: [WhatsappController],
  providers: [
    WhatsappService,

    // Use cases
    HandleIncomingMessageUseCase,
    AuthenticateResidentUseCase,

    // Binding del puerto (interface) → implementación concreta
    {
      provide: RESIDENT_DIRECTORY,
      useClass: MockResidentDirectory,
    },
    {
      provide: SESSION_REPOSITORY,
      useClass: InMemorySessionRepository,
    },
  ],
})
export class WhatsappModule {}
