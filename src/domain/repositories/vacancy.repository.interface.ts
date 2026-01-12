import { Vacancy } from '../entities/vacancy.entity';

export interface IVacancyRepository {
    findAllActive(): Promise<Vacancy[]>;
}
