export interface IProduct {
  _id: string;
  name: string;
  productCode: string;
  description: string;
  terms: string;
  productStatus: string;
  client: {
    _id: string;
    name: string;
    clientCode: string;
    partnerId: string;
    channel: string;
    country: {
      _id: string;
      name: string;
      countryCode: string;
    };
  };
  insurer: {
    _id: string;
    name: string;
    insurerCode: string;
  };
  devices: [
    {
      _id: string;
      name: string;
      deviceCode: string;
    }
  ];
  clientProductName: string;
  clientProductDescription: string;
  startDateForSales: number;
  endDateForSales: number;
  subscriptionType: string;
  subscriptionValue: number;
  maximumSubscriptionFrequency: number;
  subscriptionCategory: string;
  tenureInMonths: number;
  forPostpaidPlan: boolean;
  isExpiring: boolean;
  rules: {
    claimServer: string;
    claimLimitConfig: string;
    claimCountConfig: string;
    subsequentClaimConfig: string;
    settlementConfig: string;
    techSupportOffered: boolean;
    worldwideCoverOffered: boolean;
    replacementOffered: boolean;
    chargeExcessFeeRepair: boolean;
    chargeExcessFeeBer: boolean;
    excessFeeRepairConfig: string;
    excessFeeBerConfig: string;
    excessFeeRepairVariableValue: number;
    excessFeeReplacementVariableValue: number;
    excessFeeTimeLimitInDays: number;
    logistics: string;
    serviceLevelPromiseInDays: number;
    salvageValue: number;
    internalSalvageRate: number;
    waitingPeriodForClaimInDays: number;
    reinsuranceRate: number;
  };
  plans: [
    {
      _id: string;
      name: string;
      planCode: string;
      productCode: string;
      description: string;
      tenureInMonths: number;
      coverage: {
        _id: string;
        name: string;
        coverageCode: string;
      };
      band: {
        _id: string;
        bandNo: number;
        bandCode: string;
        currencyCode: string;
        forExtendedWarranty: boolean;
        devicePriceStartingRange: number;
        devicePriceEndingRange: number;
        salesMixRate: number;
        averageDevicePrice: number;
        claimFrequency: {
          repairRate: number;
          berRate: number;
          ewRate: number;
          ewBerRate: number;
        };
        claimSeverity: {
          repairRate: number;
          repairValue: number;
          berRate: number;
          berValue: number;
        };
        excessFee: {
          repairRate: number;
          repairValue: number;
          berRate: number;
          berValue: number;
        };
        claimRisk: {
          repairValue: number;
          berValue: number;
          subTotal: number;
          underwritingMarginRate: number;
          underwritingMarginValue: number;
          technicalRatingValueExcInsuranceTax: number;
          technicalRatingRateExcInsuranceTax: number;
          lgtRate: number;
          lgtValue: number;
          dstRate: number;
          dstValue: number;
          technicalRatingValueIncInsuranceTax: number;
          technicalRatingRateIncInsuranceTax: number;
        };
        cost: {
          insuranceCostRateOfAverageDevicePriceExcInsuranceTax: number;
          insuranceCostValueExcInsuranceTax: number;
          insuranceCostsRateOfAverageDevicePriceIncInsuranceTax: number;
          insuranceCostsValueIncInsuranceTax: number;
          reinsuranceFeesValue: number;
          reinsuranceFeesRateOfRetailPrice: number;
          corporateIncomeTaxRateForReinsurance: number;
          corporateIncomeTaxValueForReinsurance: number;
          contingencyInsuranceValue: number;
          excessFeeWaiverForRepairValue: number;
          claimAdminValue: number;
          brokerFeePreTransferPriceValue: number;
          costTotalValue: number;
        };
        price: {
          internalMarginWithoutContingencyCost: number;
          internalMarginWithContingencyCost: number;
          transferPriceValue: number;
          retailPriceValueWithTax: number;
          retailPriceValueWithoutTax: number;
          taxRateVat__VN: number;
          taxValueVat__VN: number;
          taxRateVat__PH: number;
          taxValueVat__PH: number;
          taxRateGrt__PH: number;
          taxValueGrt__PH: number;
          clientMarginPostTransferPriceRateOfRetailPrice__FirstClient: number;
          clientMarginPostTransferPriceValueOfRetailPrice__FirstClient: number;
          clientMarginPostTransferPriceRateOfRetailPrice__SecondClient: number;
          clientMarginPostTransferPriceValueOfRetailPrice__SecondClient: number;
          clientMarginPostTransferPriceRateOfRetailPrice__ThirdClient: number;
          clientMarginPostTransferPriceValueOfRetailPrice__ThirdClient: number;
        };
      };
    }
  ];
}
