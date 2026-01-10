export class Candidate {
    constructor(
        public readonly id: string,
        public readonly fullName: string,
        public readonly documentNumber: string,
        public readonly district: string,
        public readonly email: string,
        public readonly message: string,
        public readonly phoneNumber: string,
        public readonly appliedAt: Date,
        public readonly status: 'POSTULADO' | 'REVISADO' | 'CONTACTADO',
    ) { }
}
