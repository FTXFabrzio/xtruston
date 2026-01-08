export interface IResidentDirectory {
  findByPhone(phone: string): Promise<{ id: string; name: string } | null>;
  findBySubunitCode(code: string): Promise<{ id: string; name: string } | null>;
}
