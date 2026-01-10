export class PhoneNumber {
    private readonly value: string;

    constructor(value: string) {
        if (!this.validate(value)) {
            throw new Error('Invalid phone number format');
        }
        this.value = this.clean(value);
    }

    get raw(): string {
        return this.value;
    }

    // Example validation logic (adapt to Peru format 9XXXXXXXX)
    private validate(value: string): boolean {
        const cleaned = this.clean(value);
        return /^\d{9,}$/.test(cleaned); // Basic check for now
    }

    private clean(value: string): string {
        return value.replace(/\D/g, ''); // Remove non-digits
    }

    equals(other: PhoneNumber): boolean {
        return this.value === other.value;
    }
}
