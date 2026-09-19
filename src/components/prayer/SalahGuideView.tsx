import React, { useState } from 'react';
import { BookOpen, CheckCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { SALAH_GUIDE_DATA } from '../../data/salahGuideData';

export const SalahGuideView: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('salah-steps');
  const [expandedStepId, setExpandedStepId] = useState<string | null>('1-niyyah-takbeer');

  const activeCategory =
    SALAH_GUIDE_DATA.find((c) => c.id === selectedCategoryId) ||
    SALAH_GUIDE_DATA[0];

  const toggleStep = (id: string) => {
    setExpandedStepId(expandedStepId === id ? null : id);
  };

  return (
    <div className="space-y-5">
      {/* Category Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {SALAH_GUIDE_DATA.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategoryId(cat.id);
                setExpandedStepId(cat.steps[0]?.id || null);
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#176B4D] text-white shadow-xs'
                  : 'bg-[#E8EFEA] dark:bg-[#252F28] text-[#414A45] dark:text-[#C1CAC4] hover:bg-[#dce7e0]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{cat.title}</span>
            </button>
          );
        })}
      </div>

      {/* Subtitle / Intro */}
      <div className="p-4 rounded-2xl bg-[#D4F2E2]/60 dark:bg-[#005236]/30 border border-[#176B4D]/20 dark:border-[#9DD6B9]/20 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#176B4D] dark:text-[#9DD6B9] shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm text-[#181D19] dark:text-[#E1E5E1]">
            {activeCategory.title}
          </h4>
          <p className="text-xs text-[#414A45] dark:text-[#C1CAC4] mt-0.5">
            {activeCategory.subtitle}
          </p>
        </div>
      </div>

      {/* Steps Accordion */}
      <div className="space-y-3">
        {activeCategory.steps.map((step, index) => {
          const isExpanded = expandedStepId === step.id;

          return (
            <div
              key={step.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'border-[#176B4D]/40 dark:border-[#9DD6B9]/40 bg-white dark:bg-[#1A221C] shadow-sm'
                  : 'border-[#E8EFEA] dark:border-[#3A4D43]/60 bg-[#F7FAF7] dark:bg-[#151D17]'
              }`}
            >
              {/* Header Button */}
              <button
                type="button"
                onClick={() => toggleStep(step.id)}
                className="w-full p-4 text-left flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      isExpanded
                        ? 'bg-[#176B4D] text-white'
                        : 'bg-[#E8EFEA] dark:bg-[#252F28] text-[#414A45] dark:text-[#C1CAC4]'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-[#181D19] dark:text-[#E1E5E1]">
                      {step.titleBengali}
                    </h5>
                    {step.titleArabic && (
                      <span className="text-xs text-[#176B4D] dark:text-[#9DD6B9] font-serif block mt-0.5">
                        {step.titleArabic}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[#717A74] p-1">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="px-4 pb-5 pt-1 space-y-3 border-t border-[#E8EFEA] dark:border-[#3A4D43]/40 text-sm">
                  {/* Detailed instruction */}
                  <p className="text-xs text-[#414A45] dark:text-[#C1CAC4] leading-relaxed">
                    {step.instruction}
                  </p>

                  {/* Arabic Text (if present) */}
                  {step.arabicText && (
                    <div className="p-4 rounded-xl bg-[#F4F8F5] dark:bg-[#1F2A22] border border-[#176B4D]/15 dark:border-[#9DD6B9]/15 text-right space-y-2">
                      <div
                        dir="rtl"
                        className="text-xl sm:text-2xl font-serif text-[#176B4D] dark:text-[#9DD6B9] leading-loose font-normal"
                        style={{ fontFamily: "'Amiri', serif" }}
                      >
                        {step.arabicText}
                      </div>

                      {/* Transliteration */}
                      {step.bengaliTransliteration && (
                        <div className="text-left text-xs font-medium text-[#181D19] dark:text-[#E1E5E1] border-t border-black/5 dark:border-white/5 pt-2">
                          <span className="text-[#717A74] text-[11px] block">উচ্চারণ:</span>
                          {step.bengaliTransliteration}
                        </div>
                      )}

                      {/* Meaning */}
                      {step.bengaliMeaning && (
                        <div className="text-left text-xs text-[#414A45] dark:text-[#C1CAC4] border-t border-black/5 dark:border-white/5 pt-2">
                          <span className="text-[#717A74] text-[11px] block">অর্থ:</span>
                          {step.bengaliMeaning}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Source Reference Badge */}
                  {step.sourceReference && (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#176B4D] dark:text-[#9DD6B9] bg-[#D4F2E2]/60 dark:bg-[#005236]/40 px-3 py-1.5 rounded-lg w-fit">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>উৎস: {step.sourceReference}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
