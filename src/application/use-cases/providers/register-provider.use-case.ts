import { Injectable, Inject } from '@nestjs/common';
import { IProviderRepository } from '../../../domain/repositories/provider.repository.interface';
import { Provider } from '../../../domain/entities/provider.entity';

@Injectable()
export class RegisterProviderUseCase {
  constructor(
    @Inject('IProviderRepository')
    private readonly providerRepository: IProviderRepository,
  ) {}

  async execute(dto: any): Promise<void> {
    const provider = new Provider(
      '',
      dto.companyName,
      dto.ruc,
      dto.contactName,
      dto.address,
      dto.type,
      dto.specialties,
      dto.phoneNumber,
      new Date(),
    );
    await this.providerRepository.save(provider);
  }
}
