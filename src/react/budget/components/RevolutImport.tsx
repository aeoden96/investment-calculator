import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { iconifyIcon } from '../config';
import type { ImportedSpendingData } from '../types';
import { validateRevolutCSV, analyzeCSV } from '../utils/csvAnalyzer';
import { formatImportSummary } from '../utils/statsFormatter';
import { CategorizationModal } from './CategorizationModal';
import { getTranslatedCategoryName } from '../utils/getTranslatedCategory';

interface RevolutImportProps {
  onApplyImport: (data: ImportedSpendingData) => void;
  onReset: () => void;
  hasImportedData: boolean;
}

export function RevolutImport({ onApplyImport, onReset, hasImportedData }: RevolutImportProps) {
  const { t } = useTranslation();
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string[]; warnings: string[] } | null>(null);
  const [analyzedData, setAnalyzedData] = useState<ImportedSpendingData | null>(null);
  const [csvText, setCsvText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [customMappings, setCustomMappings] = useState<Record<string, string>>({});
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      setCsvText(text);
      setFileName(file.name);
      setCustomMappings({}); // Reset custom mappings for new file
      
      const validationResult = validateRevolutCSV(text);
      setValidation(validationResult);
      
      if (validationResult.isValid) {
        // Analyze the CSV
        const analyzed = analyzeCSV(text, file.name);
        setAnalyzedData(analyzed);
      } else {
        setAnalyzedData(null);
      }
    } catch (error: any) {
      setValidation({
        isValid: false,
        errors: [`Error reading file: ${error.message}`],
        warnings: []
      });
      setAnalyzedData(null);
    }
  };
  
  const handleApplyCustomMappings = (mappings: Record<string, string>) => {
    setCustomMappings(mappings);
    
    // Re-analyze with custom mappings
    if (csvText && fileName) {
      const analyzed = analyzeCSV(csvText, fileName, mappings);
      setAnalyzedData(analyzed);
    }
  };
  
  const handleApply = () => {
    if (analyzedData) {
      onApplyImport(analyzedData);
    }
  };
  
  const handleReset = () => {
    setValidation(null);
    setAnalyzedData(null);
    setCsvText('');
    setFileName('');
    setCustomMappings({});
    onReset();
    
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  return (
    <div className="card bg-base-200 mb-0">
      <div className="card-body p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-lg font-bold border-b border-base-300 pb-2">
              {t('import.title')}
            </h2>
          </div>
          {hasImportedData && (
            <button
              onClick={handleReset}
              className="btn btn-sm btn-error btn-outline"
            >
              <span dangerouslySetInnerHTML={{ __html: iconifyIcon('mdi:refresh', '1.2em') }} />
              {t('import.reset')}
            </button>
          )}
        </div>
        
        {!hasImportedData && (
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">{t('import.upload')}</span>
            </label>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="file-input file-input-bordered file-input-primary w-full max-w-md"
              />
            </div>
          </div>
        )}
        
        {/* Validation Results */}
        {validation && !hasImportedData && (
          <div className="mt-4">
            {!validation.isValid ? (
              <div className="p-4 rounded-lg border border-error bg-error/10">
                <div className="font-bold text-error mb-2">❌ {t('import.validationFailed')}</div>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {validation.errors.map((error, i) => (
                    <li key={i} className="text-error">{error}</li>
                  ))}
                </ul>
              </div>
            ) : analyzedData ? (
              <div className="p-4 rounded-lg border border-success bg-success/10">
                <div className="font-bold text-success mb-3">✅ {t('import.analysisSuccess')}</div>
                <div className="text-sm mb-3">{formatImportSummary(analyzedData, t)}</div>
                
                {/* Category breakdown summary */}
                <div className="mt-3 p-3 bg-base-100 rounded text-sm">
                  <div className="font-semibold mb-2">{t('import.categoryBreakdown')}:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(analyzedData.categoryBreakdown)
                      .sort((a, b) => b[1].total - a[1].total)
                      .slice(0, 6)
                      .map(([category, data]) => {
                        const translatedName = getTranslatedCategoryName(category, t);
                        const plainName = translatedName.replace(/<[^>]*>/g, '');
                        return (
                          <div key={category} className="flex justify-between">
                            <span className="capitalize">{plainName}:</span>
                            <span className="font-semibold">€{Math.round(data.monthlyAverage)}/mo</span>
                          </div>
                        );
                      })}
                  </div>
                  {analyzedData.uncategorized.length > 0 && (
                    <div className="mt-2 p-3 bg-warning/10 rounded border border-warning">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-warning">
                          {analyzedData.uncategorized.length} {t('import.uncategorized')}
                        </div>
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="btn btn-sm btn-warning"
                        >
                          <span dangerouslySetInnerHTML={{ __html: iconifyIcon('mdi:tag-plus', '1.2em') }} />
                          {t('import.categorizeManually')}
                        </button>
                      </div>
                      {Object.keys(customMappings).length > 0 && (
                        <div className="mt-2 text-xs text-success">
                          {Object.keys(customMappings).length} {Object.keys(customMappings).length > 1 
                            ? t('import.customMappingsPlural')
                            : t('import.customMappings')
                          } {t('import.applied', { defaultValue: 'applied' })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {validation.warnings.length > 0 && (
                  <div className="mt-3 p-3 bg-warning/10 rounded border border-warning text-sm">
                    <div className="font-semibold text-warning mb-2">⚠️ {t('import.warnings')}:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {validation.warnings.map((warning, i) => (
                        <li key={i} className="text-warning">{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Apply button */}
                <button
                  onClick={handleApply}
                  className="btn btn-primary w-full mt-4"
                >
                  <span dangerouslySetInnerHTML={{ __html: iconifyIcon('mdi:check', '1.2em') }} />
                  {t('import.apply')}
                </button>
              </div>
            ) : null}
          </div>
        )}
        
        {/* Show applied data info */}
        {hasImportedData && analyzedData && (
          <div className="mt-4 p-4 rounded-lg border border-info bg-info/10">
            <div className="font-bold text-info mb-2">
              <span dangerouslySetInnerHTML={{ __html: iconifyIcon('mdi:information', '1.2em') }} />
              {' '}{t('import.dataApplied')}
            </div>
            <div className="text-sm">
              {t('import.usingData')} {fileName}
            </div>
          </div>
        )}
      </div>
      
      {/* Categorization Modal */}
      {analyzedData && (
        <CategorizationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          uncategorizedTransactions={analyzedData.uncategorized}
          onApplyMappings={handleApplyCustomMappings}
        />
      )}
    </div>
  );
}
