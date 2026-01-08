import { Injectable, Inject } from '@nestjs/common';
import { RESIDENT_DIRECTORY } from 'src/application/tokens';
import type { IResidentDirectory } from 'src/application/interfaces/resident-directory.interface';

@Injectable()
export class AuthenticateResidentUseCase {
  constructor(
    @Inject(RESIDENT_DIRECTORY)
    private readonly directory: IResidentDirectory,
  ) {}

  async execute(phone: string) {
    const resident = await this.directory.findByPhone(phone);
    return {
      isAuthenticated: Boolean(resident),
      resident,
    };
  }
}
