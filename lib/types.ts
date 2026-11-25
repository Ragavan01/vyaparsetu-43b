export type TaxRegime = 'TY_2026_27' | 'FY_2025_26';

export type AppLanguage = 'en' | 'hi';

export type WorkspaceId = 'audit' | 'ledger' | 'treds' | 'pulse';

export type UdyamCategory = 'Micro' | 'Small' | 'Medium' | 'Unverified';

export type DataProvenance =
  | 'Live API'
  | 'Grounded Search'
  | 'Deterministic Statutory Model'
  | 'Deterministic Verification · Live Vision Quota Reached'
  | 'Verified Statutory Registry · Oct 2026 Baseline (Live Search Requires Paid Tier)'
  | 'Illustrative Pithampur Pilot'
  | 'AI Vision Extraction'
  | 'Manual Entry';

export type SupplyType = 'intra_mp' | 'inter_state' | 'export_lut';

export type ComplianceStatus =
  | 'overdue'
  | 'due_soon'
  | 'compliant'
  | 'excluded';

export type CliffStatus = 'triggered' | 'approaching' | 'none';

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  supplierGstin: string;
  supplierUdyamNumber: string;
  udyamCategory: UdyamCategory;
  buyerName: string;
  buyerGstin: string;
  buyerTurnoverCr: number;
  hasWrittenAgreement: boolean;
  contractedDays: number;
  hasStatutoryClause: boolean;
  invoiceDate: string;
  acceptanceDate: string;
  supplyType: SupplyType;
  subtotal: number;
  gstRatePercent: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  lineItemSummary: string;
  clusterLocation: string;
  paid: boolean;
  provenance: DataProvenance;
}

export interface GstinValidationResult {
  validFormat: boolean;
  validChecksum: boolean;
  stateCode: string;
  stateName: string;
  isMadhyaPradesh: boolean;
}

export interface ComplianceFinding {
  id: string;
  severity: 'critical' | 'warning' | 'info' | 'pass';
  title: string;
  detail: string;
}

export interface RegimeMetadata {
  id: TaxRegime;
  shortLabel: string;
  actName: string;
  sectionLabel: string;
  auditFormLabel: string;
  fiscalYearLabel: string;
  itrSectionLabel: string;
}

export interface ComplianceAuditResult {
  eligibleForProtection: boolean;
  statutoryLimitDays: number;
  statutoryDueDate: string;
  daysElapsed: number;
  daysRemaining: number;
  overdueDays: number;
  status: ComplianceStatus;
  rbiBankRate: number;
  section16AnnualRate: number;
  section16Interest: number;
  cliffStatus: CliffStatus;
  fiscalYearEnd: string;
  buyerTaxDisallowance: number;
  expectedTaxTotal: number;
  declaredTaxTotal: number;
  taxMathDelta: number;
  expectedGrandTotal: number;
  grandTotalDelta: number;
  supplierGstinCheck: GstinValidationResult;
  buyerGstinCheck: GstinValidationResult;
  tredsMandatoryBuyer: boolean;
  tredsReady: boolean;
  findings: ComplianceFinding[];
}

export interface TredsInput {
  invoiceAmount: number;
  delayDays: number;
  tredsAnnualRate: number;
  informalAnnualRate: number;
  buyerTaxRate: number;
}

export interface TredsSimulation {
  tredsDiscountCost: number;
  netCashTodayTreds: number;
  informalCreditCost: number;
  netCashInformal: number;
  savingsVsInformal: number;
  annualizedMarginSavedPct: number;
  buyerTaxShieldPreserved: number;
  workingCapitalDaysUnlocked: number;
}

export interface LiveWeatherData {
  status: 'live' | 'unavailable';
  corridorName: string;
  latitude: number;
  longitude: number;
  temperatureC: number | null;
  precipitationMm: number | null;
  windKmh: number | null;
  weatherCode: number | null;
  freightAdvisory: string;
  observedAt: string | null;
}

export interface LiveFxData {
  status: 'live' | 'unavailable';
  base: string;
  usdInr: number | null;
  eurInr: number | null;
  rateDate: string | null;
}

export interface LiveCorridorSnapshot {
  fetchedAt: string;
  weather: LiveWeatherData;
  fx: LiveFxData;
}

export interface PolicyCitation {
  title: string;
  uri: string;
}

export interface PolicyGroundingResponse {
  mode: 'live_grounded' | 'offline_fallback';
  fetchedAt: string;
  summary: string;
  keyPoints: string[];
  citations: PolicyCitation[];
  provenance: DataProvenance;
  notice?: string;
}

export interface AuditApiResponse {
  mode: 'live_vision' | 'offline_fallback' | 'non_invoice';
  isInvoice?: boolean;
  modelUsed?: string;
  extracted: Partial<InvoiceRecord>;
  aiNotes: string[];
  provenance: DataProvenance;
  notice?: string;
}
