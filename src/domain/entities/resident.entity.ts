export class Resident {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly phoneNumber: string, // Value Object ideally, primitive for now
        public readonly departmentUnit: string, // e.g. "DEP-102"
        public readonly buildingCode: string,
        public readonly status: 'EN REVISION' | 'APROBADO' | 'ANULADO' | 'RECHAZADO',
        public readonly email?: string,
        public readonly documentNumber?: string,
    ) { }
}
