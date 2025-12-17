'use client';

import { useState, useEffect, useRef } from 'react';

interface PropertyInputs {
  // Property Info
  propertyAddress: string;
  
  // Property & Financing
  purchasePrice: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTerm: number;
  
  // Revenue Assumptions
  occupancyPercent: number;
  expectedADR: number;
  platformFeePercent: number;
  
  // Operating Expenses
  annualPropertyTax: number;
  annualInsurance: number;
  annualUtilities: number;
  annualRepairsCapEx: number;
  annualHOAFees: number;
  otherAnnualOpEx: number;
  
  // Setup & Tax
  furnishingsAmount: number;
  bonusDepreciationPercent: number;
  marginalTaxRate: number;
}

interface PropertyInfo {
  propertyAddress?: string;
  yearBuilt?: string;
  numBedrooms?: number;
  numBathrooms?: number;
  listingPrice?: string;
  lotSize?: string;
  livingSpace?: string;
  otherDetails?: string;
  positives?: string[];
  negatives?: string[];
}

const DEFAULT_VALUES: PropertyInputs = {
  // Property Info
  propertyAddress: '',
  
  // Property & Financing
  purchasePrice: 1000000,
  downPaymentPercent: 20,
  interestRate: 6.5,
  loanTerm: 30,
  
  // Revenue Assumptions
  occupancyPercent: 50,
  expectedADR: 200,
  platformFeePercent: 3,
  
  // Operating Expenses
  annualPropertyTax: 1000000 * 0.006, // 0.6% of purchase price
  annualInsurance: 1000000 * 0.01, // 1% of purchase price
  annualUtilities: 1250*3,
  annualRepairsCapEx: 3000,
  annualHOAFees: 0,
  otherAnnualOpEx: 1000,
  
  // Setup & Tax
  furnishingsAmount: 30000,
  bonusDepreciationPercent: 20,
  marginalTaxRate: 37,
};

export default function STRAnalyzerPage() {
  const [inputs, setInputs] = useState<PropertyInputs>(DEFAULT_VALUES);
  const [propertyInfo, setPropertyInfo] = useState<PropertyInfo | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [instructionsExpanded, setInstructionsExpanded] = useState(false);
  const insuranceManuallyEdited = useRef(false);
  const propertyTaxManuallyEdited = useRef(false);
  const furnishingsManuallyEdited = useRef(false);
  const utilitiesManuallyEdited = useRef(false);
  const previousPurchasePrice = useRef(inputs.purchasePrice);
  const previousNumBedrooms = useRef<number | undefined>(undefined);

  // Auto-calculate insurance and property tax when purchase price changes (if not manually edited)
  useEffect(() => {
    if (inputs.purchasePrice !== previousPurchasePrice.current) {
      const updates: Partial<PropertyInputs> = {};
      
      if (!insuranceManuallyEdited.current) {
        updates.annualInsurance = inputs.purchasePrice * 0.01;
      }
      
      if (!propertyTaxManuallyEdited.current) {
        updates.annualPropertyTax = inputs.purchasePrice * 0.006;
      }
      
      if (Object.keys(updates).length > 0) {
        setInputs(prev => ({ ...prev, ...updates }));
      }
      
      previousPurchasePrice.current = inputs.purchasePrice;
    }
  }, [inputs.purchasePrice]);

  // Auto-calculate utilities and furnishings when number of bedrooms changes (if not manually edited)
  useEffect(() => {
    const currentNumBedrooms = propertyInfo?.numBedrooms;
    if (currentNumBedrooms !== undefined && currentNumBedrooms !== previousNumBedrooms.current) {
      const updates: Partial<PropertyInputs> = {};
      
      if (!utilitiesManuallyEdited.current && typeof currentNumBedrooms === 'number') {
        updates.annualUtilities = 1250 * currentNumBedrooms;
      }
      
      if (!furnishingsManuallyEdited.current && typeof currentNumBedrooms === 'number') {
        updates.furnishingsAmount = 10000 * currentNumBedrooms;
      }
      
      if (Object.keys(updates).length > 0) {
        setInputs(prev => ({ ...prev, ...updates }));
      }
      
      previousNumBedrooms.current = currentNumBedrooms;
    }
  }, [propertyInfo?.numBedrooms]);

  const handleInputChange = (field: keyof PropertyInputs, value: string) => {
    // Handle string fields (like propertyAddress)
    if (field === 'propertyAddress') {
      setInputs(prev => ({ ...prev, [field]: value }));
      return;
    }
    
    // Handle number fields
    const numValue = value === '' ? 0 : parseFloat(value) || 0;
    
    // Track if insurance, property tax, utilities, or furnishings are manually edited
    if (field === 'annualInsurance') {
      insuranceManuallyEdited.current = true;
    }
    if (field === 'annualPropertyTax') {
      propertyTaxManuallyEdited.current = true;
    }
    if (field === 'annualUtilities') {
      utilitiesManuallyEdited.current = true;
    }
    if (field === 'furnishingsAmount') {
      furnishingsManuallyEdited.current = true;
    }
    
    setInputs(prev => ({ ...prev, [field]: numValue }));
  };

  const handleLoadWithAI = async () => {
    if (!inputs.propertyAddress.trim()) {
      alert('Please enter a property address');
      return;
    }

    setIsLoadingAI(true);
    try {
      const response = await fetch('https://n8n.apsquared.co/webhook/72dda0e1-882d-4389-bccd-eec1022012db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: inputs.propertyAddress,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to load property data');
      }

      // Get response data
      const data = await response.json();
      
      // Print response to console
      console.log('Webhook Response:', data);
      
      // Extract output data
      const output = data?.output;
      if (output) {
        // Parse listingPrice (remove $ and commas, convert to number)
        let purchasePrice = inputs.purchasePrice;
        if (output.listingPrice) {
          const priceString = output.listingPrice.replace(/[$,]/g, '');
          purchasePrice = parseFloat(priceString) || inputs.purchasePrice;
        }
        
        // Calculate annualUtilities based on number of bedrooms (1250 per bedroom)
        let annualUtilities = inputs.annualUtilities;
        if (output.numBedrooms && typeof output.numBedrooms === 'number') {
          if (!utilitiesManuallyEdited.current) {
            annualUtilities = 1250 * output.numBedrooms;
          }
        }
        
        // Calculate furnishingsAmount based on number of bedrooms (10000 per bedroom)
        let furnishingsAmount = inputs.furnishingsAmount;
        if (output.numBedrooms && typeof output.numBedrooms === 'number') {
          if (!furnishingsManuallyEdited.current) {
            furnishingsAmount = 10000 * output.numBedrooms;
          }
        }
        
        // Map response to inputs
        setInputs(prev => ({
          ...prev,
          propertyAddress: output.propertyAddress || prev.propertyAddress,
          purchasePrice: purchasePrice,
          bonusDepreciationPercent: output.shortLifeAssetPercentage || prev.bonusDepreciationPercent,
          annualUtilities: annualUtilities,
          furnishingsAmount: furnishingsAmount,
        }));
        
        // Store property information for display
        setPropertyInfo({
          propertyAddress: output.propertyAddress,
          yearBuilt: output.yearBuilt,
          numBedrooms: output.numBedrooms,
          numBathrooms: output.numBathrooms,
          listingPrice: output.listingPrice,
          lotSize: output.lotSize,
          livingSpace: output.livingSpace,
          otherDetails: output.otherDetails,
          positives: output.positives,
          negatives: output.negatives,
        });
      }
      
    } catch (error) {
      console.error('Error loading property data:', error);
      alert('Failed to load property data. Please try again.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const calculateRepairsFromRevenue = () => {
    // Calculate GAV (Gross Revenue)
    const gav = inputs.expectedADR * 365 * (inputs.occupancyPercent / 100);
    // Calculate 4% of GAV
    const calculatedRepairs = gav * 0.04;
    setInputs(prev => ({ ...prev, annualRepairsCapEx: calculatedRepairs }));
  };

  const calculateResults = () => {
    // Loan Amount = Purchase Price × (1 - Down Payment %)
    const downPayment = inputs.purchasePrice * (inputs.downPaymentPercent / 100);
    const loanAmount = inputs.purchasePrice * (1 - inputs.downPaymentPercent / 100);
    
    // Annual Debt Service = Annual principal & interest payment
    const monthlyRate = inputs.interestRate / 100 / 12;
    const numPayments = inputs.loanTerm * 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    const annualDebtService = monthlyPayment * 12;
    
    // Annual Gross Available Nights = Total nights per year
    const annualGrossAvailableNights = 365;
    
    // Underwritten Booked Nights = 365 × Occupancy %
    const underwrittenBookedNights = 365 * (inputs.occupancyPercent / 100);
    
    // Underwritten Gross Revenue (GAV) = ADR × 365 × Occupancy
    const gav = inputs.expectedADR * 365 * (inputs.occupancyPercent / 100);
    
    // Platform Fees = Platform fee % × GAV
    const platformFees = (inputs.platformFeePercent / 100) * gav;
    
    // Total Operating Expenses (Detail) = Sum of detailed annual operating expenses
    const totalOpEx = inputs.annualPropertyTax + 
                     inputs.annualInsurance + 
                     inputs.annualUtilities + 
                     inputs.annualRepairsCapEx + 
                     inputs.annualHOAFees + 
                     inputs.otherAnnualOpEx;
    
    // NOI (Unlevered) = GAV - OpEx - Platform Fees
    const noi = gav - totalOpEx - platformFees;
    
    // Cap Rate = NOI ÷ Purchase Price
    const capRate = inputs.purchasePrice > 0 ? (noi / inputs.purchasePrice) * 100 : 0;
    
    // Break-Even Revenue Needed = Debt Service + OpEx + Platform Fees
    const breakEvenRevenue = annualDebtService + totalOpEx + platformFees;
    
    // Break-Even ADR (at Underwritten Occ) = Break-even revenue ÷ booked nights
    const breakEvenADR = underwrittenBookedNights > 0 ? breakEvenRevenue / underwrittenBookedNights : 0;
    
    // Furnishings Cost = Direct amount input by user
    const furnishingsCost = inputs.furnishingsAmount;
    
    // Total Cash In (Down + Furnishings) = Down Payment + Furnishings
    const totalCashIn = downPayment + furnishingsCost;
    
    // Cash Flow (After Debt Service) = NOI - Debt Service
    const cashFlow = noi - annualDebtService;
    
    // Cash-on-Cash Return = Cash Flow ÷ Total Cash In
    const cashOnCashReturn = totalCashIn > 0 ? (cashFlow / totalCashIn) * 100 : 0;
    
    // Bonus Depreciation Amount (Year 1) = Purchase Price × Bonus Depreciation %
    const bonusDepreciationAmount = inputs.purchasePrice * (inputs.bonusDepreciationPercent / 100);
    
    // Estimated Tax Savings (Year 1) = Bonus Depreciation × Marginal Tax Rate
    const estimatedTaxSavings = bonusDepreciationAmount * (inputs.marginalTaxRate / 100);
    
    // Year 1 Profit = Tax Savings + Annual Cash Flow
    const year1Profit = estimatedTaxSavings + cashFlow;
    
    // Year 1 ROI = Year 1 Profit / Down Payment
    const year1ROI = downPayment > 0 ? (year1Profit / downPayment) * 100 : 0;
    
    return {
      downPayment,
      loanAmount,
      monthlyPayment,
      annualDebtService,
      annualGrossAvailableNights,
      underwrittenBookedNights,
      gav,
      platformFees,
      totalOpEx,
      noi,
      capRate,
      breakEvenRevenue,
      breakEvenADR,
      furnishingsCost,
      totalCashIn,
      cashFlow,
      cashOnCashReturn,
      bonusDepreciationAmount,
      estimatedTaxSavings,
      year1Profit,
      year1ROI,
    };
  };

  const results = calculateResults();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatADR = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const formatNumber = (value: number) => {
    return Math.round(value).toLocaleString();
  };

  const copyToClipboard = async () => {
    // Format data as tab-separated values for spreadsheet pasting
    const data = [
      inputs.propertyAddress || '',
      formatCurrency(inputs.purchasePrice),
      formatCurrency(results.year1Profit),
      formatPercent(results.year1ROI),
      formatCurrency(results.cashFlow),
      formatPercent(results.cashOnCashReturn),
      formatPercent(results.capRate),
      formatPercent(inputs.occupancyPercent),
      formatADR(inputs.expectedADR),
    ].join('\t'); // Tab-separated for spreadsheet compatibility

    try {
      await navigator.clipboard.writeText(data);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Failed to copy to clipboard. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Short-Term Rental Investment Analyzer
          </h1>
          <p className="text-lg text-gray-600">
            Analyze the investment opportunity of a property
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
          <button
            onClick={() => setInstructionsExpanded(!instructionsExpanded)}
            className="w-full flex items-center justify-between text-left"
          >
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <span className="mr-2">📖</span>
              How to Use This Tool
            </h2>
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                instructionsExpanded ? 'transform rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {instructionsExpanded && (
            <div className="space-y-4 text-sm text-gray-700 mt-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-blue-500">1.</span>
                  Start with AI-Powered Property Loading
                </h3>
                <p className="ml-6">
                  Enter a property address and click <strong>&quot;Load With AI&quot;</strong> to automatically fetch property details including bedrooms, bathrooms, listing price, and property analysis. The tool will auto-calculate several values based on the property data:
                </p>
                <ul className="ml-10 mt-2 space-y-1 list-disc">
                  <li><strong>Utilities:</strong> $1,250 per bedroom</li>
                  <li><strong>Furnishings:</strong> $10,000 per bedroom</li>
                  <li><strong>Bonus Depreciation %:</strong> AI estimates the percentage of the purchase price that qualifies for bonus depreciation based on the property listing details and characteristics</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-blue-500">2.</span>
                  Review & Adjust Inputs
                </h3>
                <p className="ml-6">
                  The tool automatically calculates several values:
                </p>
                <ul className="ml-10 mt-2 space-y-1 list-disc">
                  <li><strong>Property Tax:</strong> Auto-calculated at 0.6% of purchase price (can be overridden)</li>
                  <li><strong>Insurance:</strong> Auto-calculated at 1% of purchase price (can be overridden)</li>
                  <li><strong>Utilities:</strong> Auto-calculated at $1,250 per bedroom (can be overridden)</li>
                  <li><strong>Furnishings:</strong> Auto-calculated at $10,000 per bedroom (can be overridden)</li>
                  <li><strong>Repairs/CapEx:</strong> Use the &quot;Calc&quot; button to calculate as 4% of Gross Revenue</li>
                </ul>
                <p className="ml-6 mt-2">
                  You can manually override any auto-calculated value by typing directly into the field. Once manually edited, that field won&apos;t be auto-updated.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-blue-500">3.</span>
                  Key Metrics to Watch
                </h3>
                <p className="ml-6">
                  Focus on these critical investment metrics in the results panel:
                </p>
                <ul className="ml-10 mt-2 space-y-1 list-disc">
                  <li><strong>Year 1 ROI:</strong> Your return on investment including tax benefits</li>
                  <li><strong>Cash-on-Cash Return:</strong> Annual cash flow relative to your initial investment</li>
                  <li><strong>Cap Rate:</strong> Unlevered return on the property</li>
                  <li><strong>Break-Even ADR:</strong> Minimum daily rate needed to cover all expenses</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-blue-500">4.</span>
                  Export Your Analysis
                </h3>
                <p className="ml-6">
                  Click <strong>&quot;Copy Data&quot;</strong> in the results panel to copy key metrics in spreadsheet-friendly format (tab-separated) for easy pasting into Excel or Google Sheets.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-blue-800">
                  <strong>💡 Tip:</strong> Use the AirDNA link (appears after entering an address) to research comparable properties and validate your ADR and occupancy assumptions.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            {/* Property Address */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📍</span>
                Property Information
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputs.propertyAddress}
                  onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
                  placeholder="Enter property address"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleLoadWithAI}
                  disabled={isLoadingAI || !inputs.propertyAddress.trim()}
                  className="px-6 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoadingAI ? 'Loading...' : 'Load With AI'}
                </button>
              </div>
              {inputs.propertyAddress && (
                <div className="mt-2">
                  <a
                    href={`http://app.airdna.co/data/rentalizer?address=${encodeURIComponent(inputs.propertyAddress)}&tab=active-str-listings`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View on AirDNA
                  </a>
                </div>
              )}
            </div>

            {/* Property Details (Read-only) */}
            {propertyInfo && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">📋</span>
                  Property Details
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {propertyInfo.yearBuilt && (
                    <div>
                      <div className="text-gray-600 font-medium">Year Built</div>
                      <div className="text-gray-900">{propertyInfo.yearBuilt}</div>
                    </div>
                  )}
                  {propertyInfo.numBedrooms !== undefined && (
                    <div>
                      <div className="text-gray-600 font-medium">Bedrooms</div>
                      <div className="text-gray-900">{propertyInfo.numBedrooms}</div>
                    </div>
                  )}
                  {propertyInfo.numBathrooms !== undefined && (
                    <div>
                      <div className="text-gray-600 font-medium">Bathrooms</div>
                      <div className="text-gray-900">{propertyInfo.numBathrooms}</div>
                    </div>
                  )}
                  {propertyInfo.listingPrice && (
                    <div>
                      <div className="text-gray-600 font-medium">Listing Price</div>
                      <div className="text-gray-900">{propertyInfo.listingPrice}</div>
                    </div>
                  )}
                  {propertyInfo.lotSize && (
                    <div>
                      <div className="text-gray-600 font-medium">Lot Size</div>
                      <div className="text-gray-900">{propertyInfo.lotSize}</div>
                    </div>
                  )}
                  {propertyInfo.livingSpace && (
                    <div>
                      <div className="text-gray-600 font-medium">Living Space</div>
                      <div className="text-gray-900">{propertyInfo.livingSpace}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Property & Financing */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">🏠</span>
                Property & Financing
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Price
                  </label>
                  <input
                    type="number"
                    value={inputs.purchasePrice || ''}
                    onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Down Payment %
                  </label>
                  <input
                    type="number"
                    value={inputs.downPaymentPercent || ''}
                    onChange={(e) => handleInputChange('downPaymentPercent', e.target.value)}
                    placeholder="20"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interest Rate %
                  </label>
                  <input
                    type="number"
                    value={inputs.interestRate || ''}
                    onChange={(e) => handleInputChange('interestRate', e.target.value)}
                    placeholder="7.5"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loan Term (Years)
                  </label>
                  <input
                    type="number"
                    value={inputs.loanTerm || ''}
                    onChange={(e) => handleInputChange('loanTerm', e.target.value)}
                    placeholder="30"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Revenue Assumptions */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">💰</span>
                Revenue Assumptions
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Occupancy % (Underwriting)
                  </label>
                  <input
                    type="number"
                    value={inputs.occupancyPercent || ''}
                    onChange={(e) => handleInputChange('occupancyPercent', e.target.value)}
                    placeholder="50"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Conservative underwriting occupancy</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected ADR (Average Daily Rate)
                  </label>
                  <input
                    type="number"
                    value={inputs.expectedADR || ''}
                    onChange={(e) => handleInputChange('expectedADR', e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform Fee % (Airbnb/VRBO)
                  </label>
                  <input
                    type="number"
                    value={inputs.platformFeePercent || ''}
                    onChange={(e) => handleInputChange('platformFeePercent', e.target.value)}
                    placeholder="15"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📊</span>
                Operating Expenses
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Property Tax
                  </label>
                  <input
                    type="number"
                    value={inputs.annualPropertyTax || ''}
                    onChange={(e) => handleInputChange('annualPropertyTax', e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-calculated at 0.6% of purchase price (can be overridden)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Insurance
                  </label>
                  <input
                    type="number"
                    value={inputs.annualInsurance || ''}
                    onChange={(e) => handleInputChange('annualInsurance', e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-calculated at 1% of purchase price (can be overridden)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Utilities
                  </label>
                  <input
                    type="number"
                    value={inputs.annualUtilities || ''}
                    onChange={(e) => handleInputChange('annualUtilities', e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Electric, water, internet, etc. (Estimate: $1,250 per bedroom)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Repairs/CapEx
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={inputs.annualRepairsCapEx || ''}
                      onChange={(e) => handleInputChange('annualRepairsCapEx', e.target.value)}
                      placeholder="0"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={calculateRepairsFromRevenue}
                      className="px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                      title="Calculate as 4% of Gross Revenue"
                    >
                      Calc
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Reserve for repairs and CapEx (Calc: 4% of Gross Revenue)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Annual HOA Fees
                  </label>
                  <input
                    type="number"
                    value={inputs.annualHOAFees || ''}
                    onChange={(e) => handleInputChange('annualHOAFees', e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">If applicable</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Other Annual OpEx
                  </label>
                  <input
                    type="number"
                    value={inputs.otherAnnualOpEx || ''}
                    onChange={(e) => handleInputChange('otherAnnualOpEx', e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Supplies, software, lawncare, misc.</p>
                </div>
              </div>
            </div>

            {/* Setup & Tax */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">⚙️</span>
                Setup & Tax
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Furnishings Cost
                  </label>
                  <input
                    type="number"
                    value={inputs.furnishingsAmount || ''}
                    onChange={(e) => handleInputChange('furnishingsAmount', e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Estimate: $10,000 per bedroom</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    Bonus Depreciation %
                    {propertyInfo && ((propertyInfo.positives && propertyInfo.positives.length > 0) || (propertyInfo.negatives && propertyInfo.negatives.length > 0) || propertyInfo.otherDetails) && (
                      <div className="relative group">
                        <button
                          type="button"
                          className="text-blue-500 hover:text-blue-700 focus:outline-none"
                          aria-label="Show property analysis details"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <div className="absolute left-full top-0 ml-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                          <div className="text-sm space-y-3 max-h-96 overflow-y-auto">
                            {propertyInfo.positives && propertyInfo.positives.length > 0 && (
                              <div>
                                <div className="text-green-700 font-semibold mb-2 flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Positives
                                </div>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 text-xs">
                                  {propertyInfo.positives.map((positive, index) => (
                                    <li key={index}>{positive}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {propertyInfo.negatives && propertyInfo.negatives.length > 0 && (
                              <div>
                                <div className="text-red-700 font-semibold mb-2 flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                  Negatives
                                </div>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 text-xs">
                                  {propertyInfo.negatives.map((negative, index) => (
                                    <li key={index}>{negative}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {propertyInfo.otherDetails && (
                              <div>
                                <div className="text-gray-700 font-semibold mb-2">Additional Details</div>
                                <p className="text-gray-700 text-xs">{propertyInfo.otherDetails}</p>
                              </div>
                            )}
                          </div>
                          {/* Arrow pointer */}
                          <div className="absolute right-full top-4 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-gray-200"></div>
                        </div>
                      </div>
                    )}
                  </label>
                  <input
                    type="number"
                    value={inputs.bonusDepreciationPercent || ''}
                    onChange={(e) => handleInputChange('bonusDepreciationPercent', e.target.value)}
                    placeholder="0"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Portion of purchase price depreciated in Year 1</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marginal Tax Rate %
                  </label>
                  <input
                    type="number"
                    value={inputs.marginalTaxRate || ''}
                    onChange={(e) => handleInputChange('marginalTaxRate', e.target.value)}
                    placeholder="32"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Combined federal + state</p>
                </div>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <span className="mr-2">📈</span>
                  Investment Analysis
                </h2>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
                  title="Copy property data to clipboard (spreadsheet format)"
                >
                  {copiedToClipboard ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Data
                    </>
                  )}
                </button>
              </div>

              {/* Key Metrics */}
              <div className="space-y-4 mb-6">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
                  <div className="text-sm text-gray-600 mb-1">Year 1 ROI</div>
                  <div className="text-3xl font-bold text-orange-700">
                    {formatPercent(results.year1ROI)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Year 1 Profit / Down Payment</p>
                </div>
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg border border-teal-200">
                  <div className="text-sm text-gray-600 mb-1">Year 1 Profit</div>
                  <div className="text-3xl font-bold text-teal-700">
                    {formatCurrency(results.year1Profit)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Tax Savings + Annual Cash Flow</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-sm text-gray-600 mb-1">Cash-on-Cash Return</div>
                  <div className="text-3xl font-bold text-blue-700">
                    {formatPercent(results.cashOnCashReturn)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Cash Flow ÷ Total Cash In</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <div className="text-sm text-gray-600 mb-1">Annual Cash Flow</div>
                  <div className="text-3xl font-bold text-green-700">
                    {formatCurrency(results.cashFlow)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">NOI - Debt Service</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-sm text-gray-600 mb-1">Cap Rate</div>
                  <div className="text-3xl font-bold text-purple-700">
                    {formatPercent(results.capRate)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">NOI ÷ Purchase Price</p>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Financing</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Down Payment</div>
                    <div className="font-semibold text-gray-900">{formatCurrency(results.downPayment)}</div>
                    <p className="text-xs text-gray-500 mt-0.5">Purchase Price × Down Payment %</p>
                  </div>
                  <div>
                    <div className="text-gray-600">Loan Amount</div>
                    <div className="font-semibold text-gray-900">{formatCurrency(results.loanAmount)}</div>
                    <p className="text-xs text-gray-500 mt-0.5">Purchase Price × (1 - Down Payment %)</p>
                  </div>
                  <div>
                    <div className="text-gray-600">Monthly Payment</div>
                    <div className="font-semibold text-gray-900">{formatCurrency(results.monthlyPayment)}</div>
                    <p className="text-xs text-gray-500 mt-0.5">Principal & interest payment</p>
                  </div>
                  <div>
                    <div className="text-gray-600">Annual Debt Service</div>
                    <div className="font-semibold text-gray-900">{formatCurrency(results.annualDebtService)}</div>
                    <p className="text-xs text-gray-500 mt-0.5">Annual principal & interest payment</p>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-700 border-b pb-2 mt-4">Revenue</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Gross Available Nights</div>
                    <div className="font-semibold text-gray-900">{formatNumber(results.annualGrossAvailableNights)}</div>
                    <p className="text-xs text-gray-500 mt-0.5">Total nights per year (365)</p>
                  </div>
                  <div>
                    <div className="text-gray-600">Underwritten Booked Nights</div>
                    <div className="font-semibold text-gray-900">{formatNumber(results.underwrittenBookedNights)}</div>
                    <p className="text-xs text-gray-500 mt-0.5">365 × Occupancy %</p>
                  </div>
                  <div>
                    <div className="text-gray-600">Gross Revenue (GAV)</div>
                    <div className="font-semibold text-gray-900">{formatCurrency(results.gav)}</div>
                    <p className="text-xs text-gray-500 mt-0.5">ADR × 365 × Occupancy</p>
                  </div>
                  <div>
                    <div className="text-gray-600">Platform Fees</div>
                    <div className="font-semibold text-gray-900">{formatCurrency(results.platformFees)}</div>
                    <p className="text-xs text-gray-500 mt-0.5">Platform fee % × GAV</p>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-700 border-b pb-2 mt-4">Expenses & NOI</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Total OpEx</div>
                    <div className="font-semibold text-gray-900">{formatCurrency(results.totalOpEx)}</div>
                    <p className="text-xs text-gray-500 mt-0.5">Sum of detailed annual operating expenses</p>
                  </div>
                  <div>
                    <div className="text-gray-600">NOI (Unlevered)</div>
                    <div className="font-semibold text-gray-900">{formatCurrency(results.noi)}</div>
                    <p className="text-xs text-gray-500 mt-0.5">GAV - OpEx - Platform Fees</p>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-700 border-b pb-2 mt-4">Break-Even Analysis</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Break-Even Revenue</div>
                    <div className="font-semibold text-gray-900">{formatCurrency(results.breakEvenRevenue)}</div>
                    <p className="text-xs text-gray-500 mt-0.5">Debt Service + OpEx + Platform Fees</p>
                  </div>
                  <div>
                    <div className="text-gray-600">Break-Even ADR</div>
                    <div className="font-semibold text-gray-900">{formatADR(results.breakEvenADR)}</div>
                    <p className="text-xs text-gray-500 mt-0.5">Break-even revenue ÷ booked nights</p>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-700 border-b pb-2 mt-4">Initial Investment</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Furnishings Cost</div>
                    <div className="font-semibold text-gray-900">{formatCurrency(results.furnishingsCost)}</div>
                    <p className="text-xs text-gray-500 mt-0.5">Direct amount input by user</p>
                  </div>
                  <div>
                    <div className="text-gray-600">Total Cash In</div>
                    <div className="font-semibold text-gray-900">{formatCurrency(results.totalCashIn)}</div>
                    <p className="text-xs text-gray-500 mt-0.5">Down Payment + Furnishings</p>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-700 border-b pb-2 mt-4">Tax Benefits</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Bonus Depreciation (Year 1)</div>
                    <div className="font-semibold text-gray-900">{formatCurrency(results.bonusDepreciationAmount)}</div>
                    <p className="text-xs text-gray-500 mt-0.5">Purchase Price × Bonus Depreciation %</p>
                  </div>
                  <div>
                    <div className="text-gray-600">Estimated Tax Savings (Year 1)</div>
                    <div className="font-semibold text-gray-900">{formatCurrency(results.estimatedTaxSavings)}</div>
                    <p className="text-xs text-gray-500 mt-0.5">Bonus Depreciation × Marginal Tax Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className="mt-8 max-w-7xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-800 text-center space-y-2">
              <p>
                <strong>Disclaimer:</strong> This is a work in progress and should not be used to make a purchase.
              </p>
              <p>
                Tax advantages are subject to material involvement qualification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

