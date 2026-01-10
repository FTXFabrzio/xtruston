export class Provider {
    constructor(
        public readonly id: string,
        public readonly companyName: string,
        public readonly ruc: string,
        public readonly contactName: string,
        public readonly address: string,
        public readonly type: 'MANTENIMIENTO' | 'INSUMOS',
        public readonly specialties: string[], // List of specialties or products
        public readonly phoneNumber: string,
        public readonly createdAt: Date,
    ) { }
}
