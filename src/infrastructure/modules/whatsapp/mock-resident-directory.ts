import { Injectable } from '@nestjs/common';
import { IResidentDirectory } from 'src/application/interfaces/resident-directory.interface';

@Injectable()
export class MockResidentDirectory implements IResidentDirectory {
  private readonly residentsByPhone = new Map([
    ['51936020823', { id: 'r1', name: 'Fabrizio', subunitCode: 'LIBER501' }],
  ]);

  private readonly residentsBySubunit = new Map([
    ['LIBER501', { id: 'r1', name: 'Fabrizio' }],
    ['TOWER101', { id: 'r2', name: 'María García' }],
  ]);

  async findByPhone(phone: string) {
    const resident = this.residentsByPhone.get(phone);
    if (!resident) return null;
    return { id: resident.id, name: resident.name };
  }

  async findBySubunitCode(code: string) {
    return this.residentsBySubunit.get(code.toUpperCase()) ?? null;
  }
}
