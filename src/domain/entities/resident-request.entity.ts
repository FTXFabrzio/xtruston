export class ResidentRequest {
    constructor(
        public readonly id: string,
        public readonly phoneNumber: string,
        public readonly buildingCode: string,
        public readonly unit: string,
        public readonly name: string, // Claimed name
        public readonly status: 'PENDING' | 'APPROVED' | 'REJECTED',
        public readonly requestedAt: Date,
    ) { }
}
