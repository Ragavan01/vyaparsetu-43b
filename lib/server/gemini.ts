import {GoogleGenAI, Type} from '@google/genai';
import {isSafeHttpUrl} from '../format';
import {REGIME_META} from '../statutory';
import type {
  AppLanguage,
  AuditApiResponse,
  InvoiceRecord,
  PolicyCitation,
  PolicyGroundingResponse,
  TaxRegime,
} from '../types';
import {
  buildDeterministicAuditFallback,
  buildVerifiedPolicyRegistryPack,
} from './fallbacks';

export const VISION_MODEL_CASCADE = [
  'gemini-4-hydrogen',
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite',
] as const;

const GROUNDING_MODEL_ID = 'gemini-4-hydrogen';

function getConfiguredApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || key === 'MY_GEMINI_API_KEY') return null;
  return key;
}

function createGeminiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {headers: {'User-Agent': 'aistudio-build'}},
  });
}

function isQuotaOrTransientError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? '');
  return /429|RESOURCE_EXHAUSTED|503|UNAVAILABLE|404|NOT_FOUND|quota|overloaded/i.test(
    msg,
  );
}

function isGroundingUnavailableError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? '');
  return (
    isQuotaOrTransientError(err) ||
    /403|PERMISSION_DENIED|grounding|billing|paid|search/i.test(msg)
  );
}

const INVOICE_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    isInvoice: {type: Type.BOOLEAN},
    invoiceNumber: {type: Type.STRING},
    supplierName: {type: Type.STRING},
    supplierGstin: {type: Type.STRING},
    supplierUdyamNumber: {type: Type.STRING},
    udyamCategory: {type: Type.STRING},
    buyerName: {type: Type.STRING},
    buyerGstin: {type: Type.STRING},
    hasWrittenAgreement: {type: Type.BOOLEAN},
    hasStatutoryClause: {type: Type.BOOLEAN},
    invoiceDate: {type: Type.STRING},
    acceptanceDate: {type: Type.STRING},
    supplyType: {type: Type.STRING},
    subtotal: {type: Type.NUMBER},
    gstRatePercent: {type: Type.NUMBER},
    cgstAmount: {type: Type.NUMBER},
    sgstAmount: {type: Type.NUMBER},
    igstAmount: {type: Type.NUMBER},
    totalAmount: {type: Type.NUMBER},
    lineItemSummary: {type: Type.STRING},
    aiNotes: {type: Type.ARRAY, items: {type: Type.STRING}},
  },
  required: ['isInvoice'],
};

function buildAuditPrompt(
  regime: TaxRegime,
  lang: AppLanguage,
  context?: string,
): string {
  const meta = REGIME_META[regime];
  const langRule =
    lang === 'hi'
      ? 'Write aiNotes in concise Hinglish/Hindi suitable for an Indore MSME owner.'
      : 'Write aiNotes in concise executive English.';
  return [
    'First inspect whether the uploaded image or context is an Indian GST tax invoice, bill of supply, or delivery challan.',
    'Set isInvoice to true ONLY if it is an invoice/challan; otherwise set isInvoice to false and do NOT guess fields.',
    'If isInvoice is true, extract Indian GST invoice fields accurately into JSON. Do not invent missing GSTINs.',
    `Active tax regime: ${meta.sectionLabel} of ${meta.actName} (${meta.auditFormLabel}, no ${meta.itrSectionLabel} ITR grace period).`,
    'udyamCategory must be Micro, Small, Medium, or Unverified.',
    'supplyType must be intra_mp, inter_state, or export_lut. Dates must be YYYY-MM-DD.',
    langRule,
    context ? `Structured invoice context:\n${context}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

async function generateVisionWithCascade(
  ai: GoogleGenAI,
  parts: Array<{text: string} | {inlineData: {mimeType: string; data: string}}>,
): Promise<{text: string; modelUsed: string}> {
  let lastError: unknown = null;
  for (const model of VISION_MODEL_CASCADE) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: {parts},
        config: {
          responseMimeType: 'application/json',
          responseSchema: INVOICE_RESPONSE_SCHEMA,
        },
      });
      return {text: (response.text ?? '{}').trim(), modelUsed: model};
    } catch (err) {
      lastError = err;
      if (!isQuotaOrTransientError(err)) throw err;
    }
  }
  throw lastError ?? new Error('RESOURCE_EXHAUSTED');
}

export async function runInvoiceVisionAudit(params: {
  regime: TaxRegime;
  language: AppLanguage;
  sampleId?: string;
  imageBase64?: string;
  imageMimeType?: string;
  invoiceTextContext?: string;
}): Promise<AuditApiResponse> {
  const apiKey = getConfiguredApiKey();
  if (!apiKey) {
    return buildDeterministicAuditFallback(
      params.sampleId,
      params.regime,
      'missing_key',
    );
  }

  const ai = createGeminiClient(apiKey);
  const parts: Array<{text: string} | {inlineData: {mimeType: string; data: string}}> =
    [];
  if (params.imageBase64 && params.imageMimeType) {
    const cleanBase64 = params.imageBase64.replace(/^data:[^;]+;base64,/, '');
    parts.push({inlineData: {mimeType: params.imageMimeType, data: cleanBase64}});
  }
  parts.push({
    text: buildAuditPrompt(params.regime, params.language, params.invoiceTextContext),
  });

  try {
    const {text, modelUsed} = await generateVisionWithCascade(ai, parts);
    const parsed = JSON.parse(text) as Partial<InvoiceRecord> & {
      isInvoice?: boolean;
      aiNotes?: string[];
    };

    if (parsed.isInvoice === false) {
      return {
        mode: 'non_invoice',
        isInvoice: false,
        modelUsed,
        extracted: {},
        aiNotes: [
          'Uploaded image does not appear to be a GST invoice or challan.',
        ],
        provenance: 'AI Vision Extraction',
        notice:
          'Uploaded image does not appear to be a GST invoice or challan. Please upload a clear GST tax invoice or delivery challan photo.',
      };
    }

    const aiNotes = Array.isArray(parsed.aiNotes) ? parsed.aiNotes.slice(0, 5) : [];
    const {isInvoice: _flag, aiNotes: _notes, ...extractedFields} = parsed;
    void _flag;
    void _notes;
    return {
      mode: 'live_vision',
      isInvoice: true,
      modelUsed,
      extracted: extractedFields,
      aiNotes,
      provenance: 'AI Vision Extraction',
    };
  } catch (err) {
    if (isQuotaOrTransientError(err)) {
      return buildDeterministicAuditFallback(params.sampleId, params.regime, 'quota');
    }
    throw err;
  }
}

function extractCitations(response: unknown): PolicyCitation[] {
  const candidates = (
    response as {
      candidates?: Array<{
        groundingMetadata?: {
          groundingChunks?: Array<{web?: {uri?: string; title?: string}}>;
        };
      }>;
    }
  )?.candidates;
  const chunks = candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const seen = new Set<string>();
  const citations: PolicyCitation[] = [];
  for (const chunk of chunks) {
    const uri = chunk.web?.uri ?? '';
    const title = chunk.web?.title ?? uri;
    if (uri && isSafeHttpUrl(uri) && !seen.has(uri)) {
      seen.add(uri);
      citations.push({title: title.slice(0, 120), uri});
    }
  }
  return citations.slice(0, 8);
}

export async function runPolicySearchGrounding(params: {
  regime: TaxRegime;
  language: AppLanguage;
  focusQuery?: string;
}): Promise<PolicyGroundingResponse> {
  const apiKey = getConfiguredApiKey();
  if (!apiKey) {
    return buildVerifiedPolicyRegistryPack(params.regime, params.language);
  }

  const ai = createGeminiClient(apiKey);
  const meta = REGIME_META[params.regime];
  const prompt = [
    'Verify the latest official Indian statutory updates for MSMEs as of late 2026:',
    '1) Current RBI Bank Rate (%) and resulting 3x MSMED Act Section 16 penal interest rate.',
    `2) ${meta.sectionLabel} of the ${meta.actName} (${meta.auditFormLabel}, no ${meta.itrSectionLabel} ITR grace period) timely payment disallowance rule.`,
    '3) Ministry of MSME ₹250 crore turnover mandatory TReDS onboarding threshold (M1xchange, RXIL, Invoicemart).',
    '4) Madhya Pradesh MSME Protsahan Yojana / Pithampur industrial cluster incentives.',
    params.focusQuery ? `Additional focus: ${params.focusQuery}` : '',
    params.language === 'hi'
      ? 'Respond with 4 crisp bullet points in clear Hinglish/Hindi.'
      : 'Respond with 4 crisp executive bullet points in English.',
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const response = await ai.models.generateContent({
      model: GROUNDING_MODEL_ID,
      contents: prompt,
      config: {tools: [{googleSearch: {}}]},
    });

    const text = (response.text ?? '').trim();
    const keyPoints = text
      .split('\n')
      .map((line) => line.replace(/^[-*•\d.)\s]+/, '').trim())
      .filter((line) => line.length > 12)
      .slice(0, 6);

    return {
      mode: 'live_grounded',
      fetchedAt: new Date().toISOString(),
      summary: keyPoints[0] ?? text.slice(0, 260),
      keyPoints: keyPoints.length > 0 ? keyPoints : [text],
      citations: extractCitations(response),
      provenance: 'Grounded Search',
    };
  } catch (err) {
    if (isGroundingUnavailableError(err)) {
      return buildVerifiedPolicyRegistryPack(params.regime, params.language);
    }
    throw err;
  }
}
