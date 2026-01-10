export class Claim {
    constructor(
        public readonly id: string,
        public readonly ticketNumber: string,
        public readonly residentPhone: string,
        public readonly residentName: string,
        public readonly unit: string,
        public readonly description: string,
        public readonly status: 'REGISTRADO' | 'EN PROGRESO' | 'CERRADO',
        public readonly createdAt: Date,
    ) { }
}
