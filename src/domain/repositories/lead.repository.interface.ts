import { Lead } from '../entities/lead.entity';

export interface ILeadRepository {
  save(lead: Lead): Promise<void>;
}
