type PresidioEntity = {
  entity_type: string;
  start: number;
  end: number;
  score: number;
};

type PresidioAnonymizeResponse = {
  text: string;
};

function isDeidEnabled(): boolean {
  const value = process.env.DEID_ENABLED?.toLowerCase();
  return value === "true" || value === "1" || value === "yes";
}

function getPresidioUrls() {
  return {
    analyzer:
      process.env.PRESIDIO_ANALYZER_URL ??
      "http://localhost:3001/analyze",
    anonymizer:
      process.env.PRESIDIO_ANONYMIZER_URL ??
      "http://localhost:3002/anonymize",
  };
}

export async function deidentifyForExternalUse(text: string): Promise<{
  sanitizedText: string;
  redacted: boolean;
  entitiesDetected: number;
}> {
  if (!isDeidEnabled()) {
    return { sanitizedText: text, redacted: false, entitiesDetected: 0 };
  }

  const { analyzer, anonymizer } = getPresidioUrls();

  try {
    const analyzeRes = await fetch(analyzer, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        language: "en",
      }),
    });

    if (!analyzeRes.ok) {
      throw new Error(`Presidio analyzer failed with status ${analyzeRes.status}`);
    }

    const entities = (await analyzeRes.json()) as PresidioEntity[];
    if (!Array.isArray(entities) || entities.length === 0) {
      return { sanitizedText: text, redacted: false, entitiesDetected: 0 };
    }

    const anonymizeRes = await fetch(anonymizer, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        analyzer_results: entities,
      }),
    });

    if (!anonymizeRes.ok) {
      throw new Error(
        `Presidio anonymizer failed with status ${anonymizeRes.status}`
      );
    }

    const anonymized = (await anonymizeRes.json()) as PresidioAnonymizeResponse;
    return {
      sanitizedText: anonymized.text ?? text,
      redacted: true,
      entitiesDetected: entities.length,
    };
  } catch {
    // Fail-open for demo resilience; do not block guideline search.
    return { sanitizedText: text, redacted: false, entitiesDetected: 0 };
  }
}
