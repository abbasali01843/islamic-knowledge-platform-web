import React, { useEffect, useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calculator,
  Coins,
  FileText,
  HelpCircle,
  Copy,
  Check,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  NISAB_GOLD_GRAMS,
  NISAB_SILVER_GRAMS,
  ZAKAT_RECIPIENTS,
  ZAKAT_FAQS,
} from '../../data/zakatData';
import { toBengaliNumerals } from '../../utils/prayerCalculation';
import { fetchLiveNisab, NISAB_SOURCE_LABEL, NISAB_SOURCE_URL } from '../../services/nisabApi';

interface ZakatScreenProps {
  onBack: () => void;
}

type ZakatTab = 'calculator' | 'recipients' | 'faq';

export const ZakatScreen: React.FC<ZakatScreenProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<ZakatTab>('calculator');
  const [copied, setCopied] = useState(false);

  // Price configurations (BDT)
  const [goldGramPrice, setGoldGramPrice] = useState<number>(0);
  const [silverGramPrice, setSilverGramPrice] = useState<number>(0);
  const [liveNisab, setLiveNisab] = useState<{ goldNisabValueBdt:number; silverNisabValueBdt:number; updatedAt:string; standard:string } | null>(null);
  const [nisabLoading, setNisabLoading] = useState(true);
  const [nisabError, setNisabError] = useState('');
  const [showPriceSettings, setShowPriceSettings] = useState<boolean>(false);\n  const [content, setContent] = useState<ZakatContent | null>(null);\n  const [contentLoading, setContentLoading] = useState(true);\n  const [contentError, setContentError] = useState('');

  useEffect(() => {
    let active = true;
    fetchLiveNisab('BDT', 'hanafi').then((data) => {
      if (!active) return;
      setGoldGramPrice(data.goldGramPriceBdt);
      setSilverGramPrice(data.silverGramPriceBdt);
      setLiveNisab(data);
      setNisabError('');
    }).catch(() => { if (active) setNisabError('লাইভ নিসাবের তথ্য পাওয়া যায়নি। নিচের মূল্য হাতে দিয়ে সেট করুন।'); })
      .finally(() => { if (active) setNisabLoading(false); });
    return () => { active = false; };
  }, []);

  // Asset inputs (BDT or values)
  const [cashInHand, setCashInHand] = useState<string>('');
  const [bankBalance, setBankBalance] = useState<string>('');
  const [goldWeightGrams, setGoldWeightGrams] = useState<string>('');
  const [silverWeightGrams, setSilverWeightGrams] = useState<string>('');
  const [businessGoods, setBusinessGoods] = useState<string>('');
  const [investmentsShares, setInvestmentsShares] = useState<string>('');
  const [receivables, setReceivables] = useState<string>('');
  const [otherAssets, setOtherAssets] = useState<string>('');

  // Liabilities
  const [immediateDebts, setImmediateDebts] = useState<string>('');
  const [dueExpenses, setDueExpenses] = useState<string>('');

  // Calculations
  const parseVal = (val: string) => {
    const num = parseFloat(val);
    return isNaN(num) || num < 0 ? 0 : num;
  };

  const goldValue = parseVal(goldWeightGrams) * goldGramPrice;
  const silverValue = parseVal(silverWeightGrams) * silverGramPrice;

  const totalAssets = useMemo(() => {
    return (
      parseVal(cashInHand) +
      parseVal(bankBalance) +
      goldValue +
      silverValue +
      parseVal(businessGoods) +
      parseVal(investmentsShares) +
      parseVal(receivables) +
      parseVal(otherAssets)
    );
  }, [
    cashInHand,
    bankBalance,
    goldValue,
    silverValue,
    businessGoods,
    investmentsShares,
    receivables,
    otherAssets,
  ]);

  const totalLiabilities = useMemo(() => {
    return parseVal(immediateDebts) + parseVal(dueExpenses);
  }, [immediateDebts, dueExpenses]);

  const netWealth = Math.max(0, totalAssets - totalLiabilities);

  const silverNisabValue = liveNisab?.silverNisabValueBdt ?? NISAB_SILVER_GRAMS * silverGramPrice;
  const goldNisabValue = liveNisab?.goldNisabValueBdt ?? NISAB_GOLD_GRAMS * goldGramPrice;

  // By default, for mixed assets, the silver nisab is preferred to benefit the poor
  const isEligible = netWealth >= silverNisabValue;
  const zakatPayable = isEligible ? netWealth * 0.025 : 0;

  const handleReset = () => {
    setCashInHand('');
    setBankBalance('');
    setGoldWeightGrams('');
    setSilverWeightGrams('');
    setBusinessGoods('');
    setInvestmentsShares('');
    setReceivables('');
    setOtherAssets('');
    setImmediateDebts('');
    setDueExpenses('');
  };

  const handleCopySummary = async () => {
    const text = `ইসলামিক যাকাত হিসাব বিবরণী
--------------------------------
মোট সম্পদ: ৳${totalAssets.toLocaleString('bn-BD')}
মোট দায়/ঋণ: ৳${totalLiabilities.toLocaleString('bn-BD')}
মোট যাকাতযোগ্য সম্পদ: ৳${netWealth.toLocaleString('bn-BD')}
রৌপ্যের নিসাব থ্রেশহোল্ড: ৳${Math.round(silverNisabValue).toLocaleString('bn-BD')}
যাকাত প্রযোজ্য: ${isEligible ? 'হ্যাঁ (ফরজ)' : 'না'}
প্রদেয় যাকাত (২.৫%): ৳${Math.round(zakatPayable).toLocaleString('bn-BD')}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300 pb-24">
      {/* Top Header with Back Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2.5 rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 text-[#176B4D] dark:text-[#9DD6B9] hover:bg-[#D4F2E2]/30 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#181D19] dark:text-[#E1E5E1]">
            যাকাত ক্যালকুলেটর
          </h1>
          <p className="text-xs text-[#717A74] dark:text-[#8B958E]">
            স্বর্ণ, রৌপ্য, নগদ অর্থ ও ব্যবসায়ের সম্পদের নিসাব এবং ২.৫% হিসাব
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#E8EFEA] dark:bg-[#222C25]">
        <button
          type="button"
          onClick={() => setActiveTab('calculator')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'calculator'
              ? 'bg-white dark:bg-[#1A221C] text-[#176B4D] dark:text-[#9DD6B9] shadow-xs'
              : 'text-[#414A45] dark:text-[#C1CAC4] hover:text-[#181D19]'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>হিসাব করুন</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('recipients')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'recipients'
              ? 'bg-white dark:bg-[#1A221C] text-[#176B4D] dark:text-[#9DD6B9] shadow-xs'
              : 'text-[#414A45] dark:text-[#C1CAC4] hover:text-[#181D19]'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>যাকাতের ৮টি খাত</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('faq')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'faq'
              ? 'bg-white dark:bg-[#1A221C] text-[#176B4D] dark:text-[#9DD6B9] shadow-xs'
              : 'text-[#414A45] dark:text-[#C1CAC4] hover:text-[#181D19]'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>মাসআলা ও প্রশ্নোত্তর</span>
        </button>
      </div>

      {activeTab === 'calculator' && (
        <div className="space-y-6">
          {/* Summary Result Banner */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-[#176B4D] to-[#0E4933] text-white shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9DD6B9]">
                যাকাত ফলাফল সারাংশ
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 text-xs text-white/80 hover:text-white bg-white/10 px-2.5 py-1 rounded-xl transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>রিসেট</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="flex items-center gap-1 text-xs text-white/80 hover:text-white bg-white/10 px-2.5 py-1 rounded-xl transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'কপি হয়েছে' : 'কপি'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-white/80 block">মোট যাকাতযোগ্য সম্পদ:</span>
                <span className="text-2xl sm:text-3xl font-black font-sans">
                  ৳ {toBengaliNumerals(Math.round(netWealth).toLocaleString('en-US'))}
                </span>
                <span className="text-[11px] text-white/60 block mt-0.5">
                  (মোট সম্পদ ৳{toBengaliNumerals(Math.round(totalAssets).toLocaleString('en-US'))} - ঋণ ৳{toBengaliNumerals(Math.round(totalLiabilities).toLocaleString('en-US'))})
                </span>
              </div>

              <div className="sm:text-right">
                <span className="text-xs text-white/80 block">প্রদেয় যাকাত (২.৫%):</span>
                <span className="text-3xl sm:text-4xl font-black text-[#A4F4C9] font-sans">
                  ৳ {toBengaliNumerals(Math.round(zakatPayable).toLocaleString('en-US'))}
                </span>
              </div>
            </div>

            {/* Status indicator */}
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {isEligible ? (
                  <CheckCircle2 className="w-4 h-4 text-[#A4F4C9]" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-300" />
                )}
                <span>
                  {isEligible
                    ? 'আপনার সম্পদ নিসাব পরিমাণ অতিক্রম করেছে। যাকাত প্রদান ফরজ।'
                    : 'আপনার সম্পদ নিসাব পরিমাণের নিচে। যাকাত আবশ্যক নয়।'}
                </span>
              </div>
              <span className="text-[11px] text-white/80">
                নিসাব: ৳ {toBengaliNumerals(Math.round(silverNisabValue).toLocaleString('en-US'))}
              </span>
            </div>
          </div>

          {nisabLoading && <div className="text-xs text-[#717A74]">লাইভ নিসাবের মূল্য লোড হচ্ছে…</div>}
      {nisabError && <div className="text-xs text-amber-700 dark:text-amber-300">{nisabError}</div>}
      {liveNisab && <div className="text-[11px] text-[#717A74] dark:text-[#8B958E]">নিসাব উৎস: <a className="underline" href={NISAB_SOURCE_URL} target="_blank" rel="noreferrer">{NISAB_SOURCE_LABEL}</a> · ফিকহ স্ট্যান্ডার্ড: হানাফি · আপডেট: {new Date(liveNisab.updatedAt).toLocaleString('bn-BD')}</div>}

      {/* Price Settings Accordion */}
          <div className="rounded-2xl border border-[#E8EFEA] dark:border-[#3A4D43]/60 bg-white dark:bg-[#1A221C] overflow-hidden">
            <button
              type="button"
              onClick={() => setShowPriceSettings(!showPriceSettings)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-bold text-[#181D19] dark:text-[#E1E5E1] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#176B4D] dark:text-[#9DD6B9]" />
                <span>বর্তমান স্বর্ণ ও রূপার বাজার দর সেটিং (প্রতি গ্রাম)</span>
              </div>
              {showPriceSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showPriceSettings && (
              <div className="p-5 border-t border-[#E8EFEA] dark:border-[#3A4D43]/40 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-1 text-[#414A45] dark:text-[#C1CAC4]">
                      স্বর্ণের গ্রাম মূল্য (টাকা):
                    </label>
                    <input
                      type="number"
                      value={goldGramPrice}
                      onChange={(e) => setGoldGramPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E8EFEA] dark:border-[#3A4D43]/60 bg-[#F4F8F5] dark:bg-[#252F28] font-bold"
                    />
                    <span className="text-[11px] text-[#717A74] mt-1 block">
                      স্বর্ণের নিসাব: ৳{' '}
                      {toBengaliNumerals(Math.round(goldNisabValue).toLocaleString('en-US'))}
                    </span>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-[#414A45] dark:text-[#C1CAC4]">
                      রূপার গ্রাম মূল্য (টাকা):
                    </label>
                    <input
                      type="number"
                      value={silverGramPrice}
                      onChange={(e) => setSilverGramPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E8EFEA] dark:border-[#3A4D43]/60 bg-[#F4F8F5] dark:bg-[#252F28] font-bold"
                    />
                    <span className="text-[11px] text-[#717A74] mt-1 block">
                      রূপার নিসাব: ৳{' '}
                      {toBengaliNumerals(Math.round(silverNisabValue).toLocaleString('en-US'))}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Asset Inputs */}
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">যাকাতের কিছু মাসআলায় মাজহাবভেদে মতভেদ আছে। এই ক্যালকুলেটরটি হানাফি স্ট্যান্ডার্ডের নিসাব ব্যবহার করছে; ব্যক্তিগত ফতোয়ার জন্য যোগ্য আলেমের পরামর্শ নিন।</div>
            <h3 className="text-sm font-extrabold text-[#181D19] dark:text-[#E1E5E1] flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#176B4D] dark:text-[#9DD6B9]" />
              <span>১. যাকাতযোগ্য সম্পদের বিবরণ (টাকায়)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 space-y-1.5">
                <label className="text-xs font-bold text-[#181D19] dark:text-[#E1E5E1]">
                  নগদ টাকা (হাতে বা লকারে)
                </label>
                <input
                  type="number"
                  placeholder="০"
                  value={cashInHand}
                  onChange={(e) => setCashInHand(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EFEA] dark:border-[#3A4D43]/60 bg-[#F4F8F5] dark:bg-[#252F28] text-sm font-bold"
                />
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 space-y-1.5">
                <label className="text-xs font-bold text-[#181D19] dark:text-[#E1E5E1]">
                  ব্যাংক ব্যালেন্স ও সঞ্চয়পত্র
                </label>
                <input
                  type="number"
                  placeholder="০"
                  value={bankBalance}
                  onChange={(e) => setBankBalance(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EFEA] dark:border-[#3A4D43]/60 bg-[#F4F8F5] dark:bg-[#252F28] text-sm font-bold"
                />
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#181D19] dark:text-[#E1E5E1]">
                    স্বর্ণের পরিমাণ (গ্রাম)
                  </label>
                  <span className="text-[11px] text-[#176B4D] dark:text-[#9DD6B9] font-bold">
                    = ৳{toBengaliNumerals(Math.round(goldValue).toLocaleString('en-US'))}
                  </span>
                </div>
                <input
                  type="number"
                  placeholder="যেমন: ৫০"
                  value={goldWeightGrams}
                  onChange={(e) => setGoldWeightGrams(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EFEA] dark:border-[#3A4D43]/60 bg-[#F4F8F5] dark:bg-[#252F28] text-sm font-bold"
                />
                <span className="text-[10px] text-[#717A74] block">১ ভরি = ১১.৬৬৪ গ্রাম</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#181D19] dark:text-[#E1E5E1]">
                    রূপার পরিমাণ (গ্রাম)
                  </label>
                  <span className="text-[11px] text-[#176B4D] dark:text-[#9DD6B9] font-bold">
                    = ৳{toBengaliNumerals(Math.round(silverValue).toLocaleString('en-US'))}
                  </span>
                </div>
                <input
                  type="number"
                  placeholder="যেমন: ২০০"
                  value={silverWeightGrams}
                  onChange={(e) => setSilverWeightGrams(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EFEA] dark:border-[#3A4D43]/60 bg-[#F4F8F5] dark:bg-[#252F28] text-sm font-bold"
                />
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 space-y-1.5">
                <label className="text-xs font-bold text-[#181D19] dark:text-[#E1E5E1]">
                  ব্যবসায়ের পণ্য ও বিক্রয়যোগ্য স্টক
                </label>
                <input
                  type="number"
                  placeholder="০"
                  value={businessGoods}
                  onChange={(e) => setBusinessGoods(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EFEA] dark:border-[#3A4D43]/60 bg-[#F4F8F5] dark:bg-[#252F28] text-sm font-bold"
                />
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 space-y-1.5">
                <label className="text-xs font-bold text-[#181D19] dark:text-[#E1E5E1]">
                  শেয়ার বাজার, বন্ড ও প্রভিডেন্ট ফান্ড
                </label>
                <input
                  type="number"
                  placeholder="০"
                  value={investmentsShares}
                  onChange={(e) => setInvestmentsShares(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EFEA] dark:border-[#3A4D43]/60 bg-[#F4F8F5] dark:bg-[#252F28] text-sm font-bold"
                />
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 space-y-1.5">
                <label className="text-xs font-bold text-[#181D19] dark:text-[#E1E5E1]">
                  পাওনা টাকা (যা ফেরত পাওয়ার সম্ভাবনা আছে)
                </label>
                <input
                  type="number"
                  placeholder="০"
                  value={receivables}
                  onChange={(e) => setReceivables(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EFEA] dark:border-[#3A4D43]/60 bg-[#F4F8F5] dark:bg-[#252F28] text-sm font-bold"
                />
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 space-y-1.5">
                <label className="text-xs font-bold text-[#181D19] dark:text-[#E1E5E1]">
                  অন্যান্য যাকাতযোগ্য সম্পদ
                </label>
                <input
                  type="number"
                  placeholder="০"
                  value={otherAssets}
                  onChange={(e) => setOtherAssets(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EFEA] dark:border-[#3A4D43]/60 bg-[#F4F8F5] dark:bg-[#252F28] text-sm font-bold"
                />
              </div>
            </div>
          </div>

          {/* Liabilities Inputs */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-[#181D19] dark:text-[#E1E5E1] flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-500" />
              <span>২. দেনা ও ঋণ (সম্পদ থেকে কর্তনযোগ্য)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 space-y-1.5">
                <label className="text-xs font-bold text-[#181D19] dark:text-[#E1E5E1]">
                  তাৎক্ষণিক পরিশোধযোগ্য ঋণ
                </label>
                <input
                  type="number"
                  placeholder="০"
                  value={immediateDebts}
                  onChange={(e) => setImmediateDebts(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EFEA] dark:border-[#3A4D43]/60 bg-[#F4F8F5] dark:bg-[#252F28] text-sm font-bold"
                />
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 space-y-1.5">
                <label className="text-xs font-bold text-[#181D19] dark:text-[#E1E5E1]">
                  বকেয়া বিল, বেতন ও ব্যবসার চলতি দেনা
                </label>
                <input
                  type="number"
                  placeholder="০"
                  value={dueExpenses}
                  onChange={(e) => setDueExpenses(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EFEA] dark:border-[#3A4D43]/60 bg-[#F4F8F5] dark:bg-[#252F28] text-sm font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 8 CATEGORIES OF RECIPIENTS */}
      {activeTab === 'recipients' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-[#005236]/30 border border-emerald-500/30 text-xs text-[#181D19] dark:text-[#E1E5E1]">
            <strong className="font-bold block mb-1 text-[#176B4D] dark:text-[#9DD6B9]">
              পবিত্র কুরআনে বর্ণিত যাকাতের ৮টি খাত (সূরা আত-তাওবা: ৬০)
            </strong>
            <p>
              "যাকাত কেবল ফকির, মিসকীন, যাকাত আদায়ে নিযুক্ত কর্মচারী, যাদের চিত্ত আকর্ষণ করা প্রয়োজন, দাসমুক্তি, ঋণগ্রস্তদের সাহায্য, আল্লাহর পথে এবং নিঃস্ব মুসাফিরদের জন্য। এটি আল্লাহর পক্ষ থেকে নির্ধারিত বিধান।"
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {content?.recipients.map((rec) => (
              <div
                key={rec.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-[#181D19] dark:text-[#E1E5E1]">
                    {rec.nameBengali}
                  </h4>
                  <span
                    dir="rtl"
                    className="text-xs font-serif text-[#176B4D] dark:text-[#9DD6B9]"
                    style={{ fontFamily: "'Amiri', serif" }}
                  >
                    {rec.nameArabic}
                  </span>
                </div>
                <p className="text-xs text-[#414A45] dark:text-[#C1CAC4] leading-relaxed">
                  {rec.descriptionBengali}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FAQ & FIQH RULES */}
      {activeTab === 'faq' && (
        <div className="space-y-4">
          {content?.faqs.map((faq, idx) => (
            <div
              key={faq.question}
              className="p-5 rounded-3xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 shadow-xs space-y-2"
            >
              <h4 className="font-bold text-sm text-[#176B4D] dark:text-[#9DD6B9] flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#176B4D] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  {toBengaliNumerals(idx + 1)}
                </span>
                <span>{faq.question}</span>
              </h4>
              <p className="text-xs text-[#414A45] dark:text-[#C1CAC4] leading-relaxed pl-7">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
