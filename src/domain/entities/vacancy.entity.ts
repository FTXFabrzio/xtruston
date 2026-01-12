export class Vacancy {
    constructor(
        public readonly id: string,
        public readonly position: string,
        public readonly status: string,
        public readonly description?: string,
    ) { }
}
