export interface SalahGuideContent {
  version: number;
  updatedAt: string;
  methodology: string;
  sources: { title: string; url: string }[];
  wuduFarz: string[];
  wuduSteps: { id: string; title: string; type: string; instruction: string; arabic?: string }[];
  prayers: { id: string; name: string; farz: number; sunnah: string; note: string }[];
  salahSteps: { id: string; title: string; arabic: string; meaning: string; instruction: string }[];
}

const CONTENT_URL =
  'https://raw.githubusercontent.com/abbasali01843/islamic-knowledge-platform-web/main/content/salah-guide.json';

export const fetchSalahGuide = async (): Promise<SalahGuideContent> => {
  const response = await fetch(CONTENT_URL, { cache: 'no-store' });
  if (!response.ok) throw new Error('Salah guide could not be loaded.');
  return response.json() as Promise<SalahGuideContent>;
};
