import {NextRequest, NextResponse} from 'next/server';
import {
  runInvoiceVisionAudit,
  runPolicySearchGrounding,
} from '@/lib/server/gemini';
import {aiRouteRateLimiter} from '@/lib/server/rate-limit';
import {
  aiRequestSchema,
  estimateBase64Bytes,
  MAX_IMAGE_BYTES,
  sanitizeText,
} from '@/lib/server/schemas';

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return req.headers.get('x-real-ip') || 'local';
}

export async function POST(req: NextRequest) {
  const limit = aiRouteRateLimiter(getClientIp(req));
  if (!limit.allowed) {
    return NextResponse.json(
      {error: 'Rate limit exceeded. Please retry shortly.'},
      {
        status: 429,
        headers: {'Retry-After': String(limit.retryAfterSeconds)},
      },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({error: 'Invalid JSON request body.'}, {status: 400});
  }

  const parsed = aiRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {error: 'Request validation failed.', details: parsed.error.flatten().fieldErrors},
      {status: 400},
    );
  }

  const data = parsed.data;
  try {
    if (data.mode === 'audit_invoice') {
      if (data.imageBase64 && estimateBase64Bytes(data.imageBase64) > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          {error: 'Uploaded invoice image exceeds the 4 MB maximum size limit.'},
          {status: 413},
        );
      }
      const result = await runInvoiceVisionAudit({
        regime: data.regime,
        language: data.language,
        sampleId: data.sampleId ? sanitizeText(data.sampleId, 64) : undefined,
        imageBase64: data.imageBase64,
        imageMimeType: data.imageMimeType,
        invoiceTextContext: data.invoiceTextContext
          ? sanitizeText(data.invoiceTextContext, 3500)
          : undefined,
      });
      return NextResponse.json(result, {status: 200});
    }

    const grounded = await runPolicySearchGrounding({
      regime: data.regime,
      language: data.language,
      focusQuery: data.focusQuery ? sanitizeText(data.focusQuery, 200) : undefined,
    });
    return NextResponse.json(grounded, {status: 200});
  } catch (error) {
    if (data.mode === 'policy_grounding') {
      const {buildVerifiedPolicyRegistryPack} = await import('@/lib/server/fallbacks');
      return NextResponse.json(
        buildVerifiedPolicyRegistryPack(data.regime, data.language),
        {status: 200},
      );
    }
    const {status, message} = mapUpstreamError(error);
    return NextResponse.json({error: message}, {status});
  }
}

function mapUpstreamError(error: unknown): {status: number; message: string} {
  const raw = error instanceof Error ? error.message : '';
  if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      message:
        'Live Vision quota reached for the current key. Continue with deterministic statutory checks below.',
    };
  }
  if (raw.includes('503') || raw.includes('UNAVAILABLE')) {
    return {
      status: 503,
      message:
        'Gemini model is temporarily experiencing high demand. Deterministic statutory checks remain active.',
    };
  }
  if (raw.includes('403') || raw.includes('API_KEY_INVALID')) {
    return {
      status: 403,
      message:
        'Gemini API key was rejected. Verify GEMINI_API_KEY in Settings > Secrets.',
    };
  }
  return {
    status: 502,
    message: `AI service error: ${sanitizeText(raw || 'Upstream request failed.', 160)}`,
  };
}
