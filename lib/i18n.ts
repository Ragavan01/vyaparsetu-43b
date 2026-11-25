import type {AppLanguage} from './types';

export interface UiCopy {
  nav: {
    audit: string;
    ledger: string;
    treds: string;
    pulse: string;
    scanCta: string;
  };
  hero: {
    kicker: string;
    headline: string;
    subheading: string;
    primaryCta: string;
    secondaryCta: string;
  };
  audit: {
    title: string;
    subtitle: string;
    uploadPrompt: string;
    uploadHint: string;
    sampleLabel: string;
    runAiBtn: string;
    runningAiBtn: string;
    addLedgerBtn: string;
    simTredsBtn: string;
  };
  ledger: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    resetBtn: string;
    emptyTitle: string;
    emptyBody: string;
    copyNoticeBtn: string;
    copiedLabel: string;
  };
  treds: {
    title: string;
    subtitle: string;
    copyChecklistBtn: string;
    mandateNote: string;
  };
  pulse: {
    title: string;
    subtitle: string;
    refreshBtn: string;
    verifyPolicyBtn: string;
    verifyingBtn: string;
    rbiLabel: string;
  };
}

export const UI_COPY: Record<AppLanguage, UiCopy> = {
  en: {
    nav: {
      audit: 'Audit Studio',
      ledger: '43B(h) Ledger',
      treds: 'TReDS Simulator',
      pulse: 'Indore Pulse',
      scanCta: 'Scan Invoice',
    },
    hero: {
      kicker: 'Pithampur & Sanwer Road MSME Workbench · Built for Bharat 2036',
      headline: 'Turn Delayed MSME Invoices Into Protected Cashflow.',
      subheading:
        'Audit GST invoices in seconds, separate MSMED §16 compound interest from March 31 tax disallowance, and unlock non-recourse TReDS liquidity.',
      primaryCta: 'Scan Invoice Now',
      secondaryCta: 'Open Receivables Ledger',
    },
    audit: {
      title: 'Multimodal Invoice Audit Studio',
      subtitle:
        'Upload a GST invoice photo or select a Pithampur industrial sample for Gemini Vision extraction and deterministic statutory audit.',
      uploadPrompt: 'Drop GST invoice photo here or browse device',
      uploadHint: 'JPG, PNG, or WebP up to 4 MB · Validated client & server side',
      sampleLabel: 'One-click Pithampur samples',
      runAiBtn: 'Run AI Audit',
      runningAiBtn: 'Auditing Invoice...',
      addLedgerBtn: 'Add to Ledger',
      simTredsBtn: 'Simulate on TReDS',
    },
    ledger: {
      title: 'Statutory Receivables Ledger',
      subtitle:
        'Track 15/45-day MSE deadlines, MSMED §16 monthly compound interest, and March 31 Cliff tax disallowance risk.',
      searchPlaceholder: 'Search invoice, buyer, supplier, or GSTIN...',
      resetBtn: 'Reset Pilot Data',
      emptyTitle: 'No invoices match this filter',
      emptyBody: 'Clear your search query or switch the urgency filter to view Pithampur receivables.',
      copyNoticeBtn: 'Copy Buyer Notice',
      copiedLabel: 'Copied to Clipboard',
    },
    treds: {
      title: 'TReDS Working-Capital Simulator',
      subtitle:
        'Compare non-recourse TReDS factoring (M1xchange, RXIL, Invoicemart) against informal local financing in real time.',
      copyChecklistBtn: 'Copy TReDS Checklist',
      mandateNote:
        'Ministry of MSME mandatory TReDS onboarding applies to corporate buyers with ₹250 Cr+ annual turnover.',
    },
    pulse: {
      title: 'Indore–Pithampur Corridor Pulse',
      subtitle:
        'Live NH-52 freight weather, export INR/USD/EUR rates, and live Google Search verification of RBI & MP MSME policy.',
      refreshBtn: 'Refresh Live Data',
      verifyPolicyBtn: 'Verify Live RBI & MP Policy',
      verifyingBtn: 'Verifying via Google Search...',
      rbiLabel: 'RBI Bank Rate (% p.a.)',
    },
  },
  hi: {
    nav: {
      audit: 'Audit Studio',
      ledger: '43B(h) Ledger',
      treds: 'TReDS Simulator',
      pulse: 'Indore Pulse',
      scanCta: 'बिल स्कैन करें',
    },
    hero: {
      kicker: 'पीथमपुर एवं सांवेर रोड MSME वर्कबेंच · भारत 2036 के लिए निर्मित',
      headline: 'अटके MSME बिलों को सुरक्षित कैशफ्लो में बदलें।',
      subheading:
        'GST इनवॉइस का तुरंत AI ऑडिट करें, MSMED §16 ब्याज और March 31 tax disallowance अलग समझें, और TReDS से 24 घंटे में पेमेंट पाएं।',
      primaryCta: 'इनवॉइस स्कैन करें',
      secondaryCta: '43B(h) लेजर देखें',
    },
    audit: {
      title: 'Multimodal Invoice Audit Studio',
      subtitle:
        'GST बिल की फोटो अपलोड करें या पीथमपुर सैंपल चुनें — Gemini Vision एक्सट्रैक्शन + सटीक statutory math ऑडिट।',
      uploadPrompt: 'GST इनवॉइस फोटो यहाँ ड्रॉप करें या चुनें',
      uploadHint: 'JPG, PNG या WebP (अधिकतम 4 MB) · सुरक्षित सर्वर जांच',
      sampleLabel: '1-क्लिक पीथमपुर सैंपल बिल',
      runAiBtn: 'AI ऑडिट चलाएं',
      runningAiBtn: 'ऑडिट हो रहा है...',
      addLedgerBtn: 'लेजर में जोड़ें',
      simTredsBtn: 'TReDS सिमुलेट करें',
    },
    ledger: {
      title: 'Statutory Receivables लेजर',
      subtitle:
        '15/45-दिन की सीमा, MSMED §16 मासिक चक्रवृद्धि ब्याज और March 31 Cliff tax risk एक ही जगह ट्रैक करें।',
      searchPlaceholder: 'इनवॉइस, बायर, सप्लायर या GSTIN खोजें...',
      resetBtn: 'पायलट डेटा रीसेट करें',
      emptyTitle: 'इस फ़िल्टर में कोई बिल नहीं मिला',
      emptyBody: 'खोज बदलें या सभी पीथमपुर बिल देखने के लिए "All" चुनें।',
      copyNoticeBtn: 'बायर नोटिस कॉपी करें',
      copiedLabel: 'कॉपी हो गया',
    },
    treds: {
      title: 'TReDS वर्किंग-कैपिटल सिमुलेटर',
      subtitle:
        'M1xchange, RXIL और Invoicemart पर TReDS डिस्काउंटिंग बनाम लोकल ब्याज की तुरंत तुलना करें।',
      copyChecklistBtn: 'TReDS चेकलिस्ट कॉपी करें',
      mandateNote:
        '₹250 करोड़+ टर्नओवर वाले कॉर्पोरेट बायर्स के लिए TReDS ऑनबोर्डिंग अनिवार्य है।',
    },
    pulse: {
      title: 'इंदौर–पीथमपुर कॉरिडोर पल्स',
      subtitle:
        'NH-52 लाइव मौसम, एक्सपोर्ट INR/USD/EUR रेट और Google Search से लाइव RBI एवं MP MSME नीति सत्यापन।',
      refreshBtn: 'लाइव डेटा रीफ्रेश करें',
      verifyPolicyBtn: 'लाइव RBI व MP पॉलिसी जांचें',
      verifyingBtn: 'Google Search से जांच जारी...',
      rbiLabel: 'RBI बैंक दर (% सालाना)',
    },
  },
};
