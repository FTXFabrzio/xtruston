import { Provider } from '../entities/provider.entity';

export interface IProviderRepository {
  save(provider: Provider): Promise<void>;
}
