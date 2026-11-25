import {z} from 'zod';

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export function sanitizeText(input: string, maxLen = 280): string {
  return input
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

export function estimateBase64Bytes(base64Data: string): number {
  const cleaned = base64Data.replace(/^data:[^;]+;base64,/, '').trim();
  return Math.floor((cleaned.length * 3) / 4);
}

const auditInvoiceSchema = z.object({
  mode: z.literal('audit_invoice'),
  regime: z.enum(['TY_2026_27', 'FY_2025_26']).default('TY_2026_27'),
  language: z.enum(['en', 'hi']).default('en'),
  sampleId: z.string().max(64).optional(),
  imageMimeType: z.enum(ALLOWED_IMAGE_MIMES).optional(),
  imageBase64: z
    .string()
    .max(5_800_000, 'Image exceeds 4 MB limit')
    .optional(),
  invoiceTextContext: z.string().max(4000).optional(),
});

const policyGroundingSchema = z.object({
  mode: z.literal('policy_grounding'),
  regime: z.enum(['TY_2026_27', 'FY_2025_26']).default('TY_2026_27'),
  language: z.enum(['en', 'hi']).default('en'),
  focusQuery: z.string().max(240).optional(),
});

export const aiRequestSchema = z.discriminatedUnion('mode', [
  auditInvoiceSchema,
  policyGroundingSchema,
]);

export type AiRequestPayload = z.infer<typeof aiRequestSchema>;
