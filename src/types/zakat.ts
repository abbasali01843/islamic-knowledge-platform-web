export interface ZakatCalculationInput {
  cashInHand: number;
  bankBalance: number;
  goldWeightGrams: number;
  goldGramPrice: number;
  silverWeightGrams: number;
  silverGramPrice: number;
  businessGoodsValue: number;
  investmentsShares: number;
  moneyLentReceivables: number;
  otherZakatableAssets: number;
  immediateDebts: number;
  dueExpenses: number;
}

export interface ZakatResult {
  totalAssets: number;
  totalLiabilities: number;
  netZakatableWealth: number;
  nisabThresholdSilver: number;
  nisabThresholdGold: number;
  isEligibleForZakat: boolean;
  zakatPayable: number;
}

export interface ZakatRecipientCategory {
  id: string;
  nameArabic: string;
  nameBengali: string;
  descriptionBengali: string;
  quranReference: string;
}
