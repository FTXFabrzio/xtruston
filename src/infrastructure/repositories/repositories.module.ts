import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '../database/database.module';
import { GoogleSheetsModule } from '../modules/google-sheets/google-sheets.module';
import { GoogleDriveModule } from '../modules/google-drive/google-drive.module';
import { ClaimDocument, ClaimSchema } from '../database/schemas/claim.schema';
import {
  ProviderDocument,
  ProviderSchema,
} from '../database/schemas/provider.schema';
import {
  CandidateDocument,
  CandidateSchema,
} from '../database/schemas/candidate.schema';
import { LeadDocument, LeadSchema } from '../database/schemas/lead.schema';
import {
  ResidentRequestDocument,
  ResidentRequestSchema,
} from '../database/schemas/resident-request.schema';
import {
  ConversationSession,
  ConversationSessionSchema,
} from '../database/schemas/conversation-session.schema';

import { GoogleSheetsResidentRepository } from './google-sheets-resident.repository';
import { MongoClaimRepository } from './mongo-claim.repository';
import { MongoProviderRepository } from './mongo-provider.repository';
import { MongoCandidateRepository } from './mongo-candidate.repository';
import { GoogleSheetsBuildingRepository } from './google-sheets-building.repository';
import { GoogleDriveDocumentRepository } from './google-drive-document.repository';
import { MongoLeadRepository } from './mongo-lead.repository';
import { MongoResidentRequestRepository } from './mongo-resident-request.repository';
import { GoogleSheetsVacancyRepository } from './google-sheets-vacancy.repository';
import { ConversationSessionRepository } from './conversation-session.repository';

@Module({
  imports: [
    DatabaseModule,
    GoogleSheetsModule,
    GoogleDriveModule,
    MongooseModule.forFeature([
      { name: ClaimDocument.name, schema: ClaimSchema },
      { name: ProviderDocument.name, schema: ProviderSchema },
      { name: CandidateDocument.name, schema: CandidateSchema },
      { name: LeadDocument.name, schema: LeadSchema },
      { name: ResidentRequestDocument.name, schema: ResidentRequestSchema },
      { name: ConversationSession.name, schema: ConversationSessionSchema },
    ]),
  ],
  providers: [
    {
      provide: 'IResidentRepository',
      useClass: GoogleSheetsResidentRepository,
    },
    { provide: 'IClaimRepository', useClass: MongoClaimRepository },
    { provide: 'IProviderRepository', useClass: MongoProviderRepository },
    { provide: 'ICandidateRepository', useClass: MongoCandidateRepository },
    {
      provide: 'IBuildingRepository',
      useClass: GoogleSheetsBuildingRepository,
    },
    { provide: 'IDocumentRepository', useClass: GoogleDriveDocumentRepository },
    { provide: 'ILeadRepository', useClass: MongoLeadRepository },
    {
      provide: 'IResidentRequestRepository',
      useClass: MongoResidentRequestRepository,
    },
    { provide: 'IVacancyRepository', useClass: GoogleSheetsVacancyRepository },
    ConversationSessionRepository,
  ],
  exports: [
    'IResidentRepository',
    'IClaimRepository',
    'IProviderRepository',
    'ICandidateRepository',
    'IBuildingRepository',
    'IDocumentRepository',
    'ILeadRepository',
    'IResidentRequestRepository',
    'IVacancyRepository',
    ConversationSessionRepository,
  ],
})
export class RepositoriesModule { }
