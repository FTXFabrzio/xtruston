import { Injectable, Inject } from '@nestjs/common';
import { ILeadRepository } from '../../../domain/repositories/lead.repository.interface';
import { Lead } from '../../../domain/entities/lead.entity';

@Injectable()
export class RegisterLeadUseCase {
  constructor(
    @Inject('ILeadRepository')
    private readonly leadRepository: ILeadRepository,
  ) {}

  async execute(dto: any): Promise<void> {
    const lead = new Lead(
      '',
      dto.buildingName,
      dto.units,
      dto.address,
      dto.district,
      dto.contactName,
      dto.email,
      dto.phoneNumber,
      new Date(),
    );
    await this.leadRepository.save(lead);
  }
}
