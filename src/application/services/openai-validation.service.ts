import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

interface ValidationResult {
    isValid: boolean;
    feedback?: string; // Si hay error, el mensaje para el usuario
}

@Injectable()
export class OpenAIValidationService {
    private readonly logger = new Logger(OpenAIValidationService.name);
    private openai: OpenAI;

    constructor(private readonly config: ConfigService) {
        const apiKey = this.config.get<string>('OPENAI_API');
        if (!apiKey) {
            this.logger.warn('OPENAI_API not configured. Validations will be basic.');
            return;
        }
        this.openai = new OpenAI({ apiKey });
    }

    /**
     * Valida el nombre de una empresa o persona
     * Regla: Solo letras, números, espacios, acentos, puntos y comas
     */
    async validateCompanyName(name: string): Promise<ValidationResult> {
        if (!this.openai) {
            return this.basicNameValidation(name);
        }

        try {
            const response = await this.openai.chat.completions.create({
                model: this.config.get<string>('OPENAI_MODEL', 'gpt-4o-mini'),
                messages: [
                    {
                        role: 'system',
                        content: `Eres un validador de datos para formularios empresariales en Perú.
Debes validar nombres de empresas con estas reglas:
- Permitidos: letras (incluyendo á, é, í, ó, ú, ñ), números, espacios, puntos, comas
- NO permitidos: símbolos como @, #, $, %, &, *, (, ), [, ], {, }, <, >, /, \\, |, etc.
- Mínimo 3 caracteres
- Máximo 100 caracteres

Responde SOLO con uno de estos formatos:
1. Si es válido: "VALID"
2. Si es inválido: "INVALID: [explicación breve y amigable del problema]"

Ejemplos:
- "Servicios SAC" → VALID
- "El Plomero S.A.C." → VALID
- "Empresa #1" → INVALID: No uses símbolos como # en el nombre
- "AB" → INVALID: El nombre debe tener al menos 3 caracteres`
                    },
                    {
                        role: 'user',
                        content: `Valida este nombre de empresa: "${name}"`
                    }
                ],
                temperature: 0.3,
                max_tokens: 100
            });

            const result = response.choices[0].message.content?.trim() || '';

            if (result.startsWith('VALID')) {
                return { isValid: true };
            } else if (result.startsWith('INVALID:')) {
                return {
                    isValid: false,
                    feedback: result.replace('INVALID:', '').trim()
                };
            }

            // Fallback si la respuesta no es clara
            return this.basicNameValidation(name);
        } catch (error) {
            this.logger.error('Error calling OpenAI for name validation', error);
            return this.basicNameValidation(name);
        }
    }

    /**
     * Valida un RUC peruano
     * Regla: Exactamente 11 dígitos numéricos
     */
    async validateRUC(ruc: string): Promise<ValidationResult> {
        // Validación básica (no requiere IA)
        const cleaned = ruc.trim().replace(/\D/g, '');

        if (cleaned.length !== 11) {
            return {
                isValid: false,
                feedback: `El RUC debe tener exactamente 11 dígitos. Tú enviaste ${cleaned.length} dígitos. Por favor, verifica e inténtalo de nuevo.`
            };
        }

        // RUC válido debe empezar con 10, 15, 17 o 20
        const firstTwo = cleaned.substring(0, 2);
        if (!['10', '15', '17', '20'].includes(firstTwo)) {
            return {
                isValid: false,
                feedback: 'El RUC debe empezar con 10, 15, 17 o 20. Por favor, verifica el número e inténtalo de nuevo.'
            };
        }

        return { isValid: true };
    }

    /**
     * Valida el nombre de una persona de contacto
     * Mismas reglas que validateCompanyName
     */
    async validatePersonName(name: string): Promise<ValidationResult> {
        if (!this.openai) {
            return this.basicNameValidation(name);
        }

        try {
            const response = await this.openai.chat.completions.create({
                model: this.config.get<string>('OPENAI_MODEL', 'gpt-4o-mini'),
                messages: [
                    {
                        role: 'system',
                        content: `Eres un validador de datos para formularios.
Debes validar nombres de personas con estas reglas:
- Permitidos: letras (incluyendo á, é, í, ó, ú, ñ), espacios, puntos, apóstrofes
- NO permitidos: números, símbolos como @, #, $, %, &, *, etc.
- Mínimo 2 caracteres
- Máximo 100 caracteres
- Debe parecer un nombre real de persona

Responde SOLO con uno de estos formatos:
1. Si es válido: "VALID"
2. Si es inválido: "INVALID: [explicación breve y amigable del problema]"

Ejemplos:
- "Carlos Mendez" → VALID
- "María José López" → VALID
- "Juan123" → INVALID: Los nombres no deben contener números
- "J" → INVALID: El nombre debe tener al menos 2 caracteres`
                    },
                    {
                        role: 'user',
                        content: `Valida este nombre de persona: "${name}"`
                    }
                ],
                temperature: 0.3,
                max_tokens: 100
            });

            const result = response.choices[0].message.content?.trim() || '';

            if (result.startsWith('VALID')) {
                return { isValid: true };
            } else if (result.startsWith('INVALID:')) {
                return {
                    isValid: false,
                    feedback: result.replace('INVALID:', '').trim()
                };
            }

            return this.basicNameValidation(name);
        } catch (error) {
            this.logger.error('Error calling OpenAI for person name validation', error);
            return this.basicNameValidation(name);
        }
    }

    /**
     * Validación básica sin IA (fallback)
     */
    private basicNameValidation(name: string): ValidationResult {
        const cleaned = name.trim();

        if (cleaned.length < 2) {
            return {
                isValid: false,
                feedback: 'El nombre debe tener al menos 2 caracteres.'
            };
        }

        if (cleaned.length > 100) {
            return {
                isValid: false,
                feedback: 'El nombre no puede tener más de 100 caracteres.'
            };
        }

        // Regex: solo letras, números, espacios, acentos, puntos, comas
        const validPattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,]+$/;
        if (!validPattern.test(cleaned)) {
            return {
                isValid: false,
                feedback: 'El nombre contiene caracteres no permitidos. Solo se aceptan letras, números, espacios, puntos y comas.'
            };
        }

        return { isValid: true };
    }
}
