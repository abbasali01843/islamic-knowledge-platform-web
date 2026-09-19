export const NISAB_SOURCE_LABEL = 'Nisab Al Zakat';
export const NISAB_SOURCE_URL = 'https://nisab.tahababa.com/api.html';

export interface LiveNisab {
  goldGramPriceBdt: number;
  silverGramPriceBdt: number;
  goldNisabValueBdt: number;
  silverNisabValueBdt: number;
  updatedAt: string;
  standard: 'hanafi' | 'maliki' | 'shafii' | 'hanbali';
}

type NisabResponse = {
  meta?: { updated_at?: string };
  prices?: { gold?: { per_gram?: number }; silver?: { per_gram?: number } };
  nisab?: Record<string, { gold?: { grams?: number; values?: Record<string, number> }; silver?: { grams?: number; values?: Record<string, number> } }>;
};

export async function fetchLiveNisab(currency = 'BDT', standard: LiveNisab['standard'] = 'hanafi'): Promise<LiveNisab> {
  const response = await fetch('https://nisab.tahababa.com/nisab.json', { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Nisab API ' + response.status);
  const data = (await response.json()) as NisabResponse;
  const selected = data.nisab?.[standard];
  const goldPrice = Number(data.prices?.gold?.per_gram);
  const silverPrice = Number(data.prices?.silver?.per_gram);
  const goldNisab = Number(selected?.gold?.values?.[currency]);
  const silverNisab = Number(selected?.silver?.values?.[currency]);
  if (![goldPrice, silverPrice, goldNisab, silverNisab].every(Number.isFinite)) throw new Error('Invalid Nisab API response');
  return { goldGramPriceBdt: goldNisab / Number(selected?.gold?.grams || 85), silverGramPriceBdt: silverNisab / Number(selected?.silver?.grams || 612.36), goldNisabValueBdt: goldNisab, silverNisabValueBdt: silverNisab, updatedAt: data.meta?.updated_at || '', standard };
}
