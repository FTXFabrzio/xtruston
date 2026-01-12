import { Building } from '../entities/building.entity';

export interface IBuildingRepository {
  findByCode(code: string): Promise<Building | null>;
  // Additional methods as needed, initially we might read from Excel just like Residents
}
