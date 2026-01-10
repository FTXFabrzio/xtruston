import { Module } from '@nestjs/common';
import { RepositoriesModule } from '../infrastructure/repositories/repositories.module';
import { ValidateResidentUseCase } from './use-cases/resident/validate-resident.use-case';
import { HandleIncomingMessageUseCase } from './use-cases/messages/handle-incoming-message.use-case';
import { GetBuildingPaymentInfoUseCase } from './use-cases/building/get-payment-info.use-case';
import { GetResidentReceiptsUseCase } from './use-cases/documents/get-receipts.use-case';
import { RegisterClaimUseCase } from './use-cases/claims/register-claim.use-case';
import { GetBuildingDocumentsUseCase } from './use-cases/documents/get-building-documents.use-case';
import { UpdateResidentProfileUseCase } from './use-cases/resident/update-profile.use-case';
import { RegisterLeadUseCase } from './use-cases/leads/register-lead.use-case';
import { RegisterNewResidentRequestUseCase } from './use-cases/resident/register-new-resident-request.use-case';
import { RegisterProviderUseCase } from './use-cases/providers/register-provider.use-case';
import { RegisterJobApplicationUseCase } from './use-cases/recruiting/register-job-application.use-case';

@Module({
    imports: [RepositoriesModule],
    providers: [
        ValidateResidentUseCase,
        HandleIncomingMessageUseCase,
        GetBuildingPaymentInfoUseCase,
        GetResidentReceiptsUseCase,
        RegisterClaimUseCase,
        GetBuildingDocumentsUseCase,
        UpdateResidentProfileUseCase,
        RegisterLeadUseCase,
        RegisterNewResidentRequestUseCase,
        RegisterProviderUseCase,
        RegisterJobApplicationUseCase,
    ],
    exports: [
        ValidateResidentUseCase,
        HandleIncomingMessageUseCase,
        GetBuildingPaymentInfoUseCase,
        GetResidentReceiptsUseCase,
        RegisterClaimUseCase,
        GetBuildingDocumentsUseCase,
        UpdateResidentProfileUseCase,
        RegisterLeadUseCase,
        RegisterNewResidentRequestUseCase,
        RegisterProviderUseCase,
        RegisterJobApplicationUseCase,
    ],
})
export class ApplicationModule { }
