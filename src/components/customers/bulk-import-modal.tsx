'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  Loader2,
  ChevronRight,
  FileText,
  BadgeAlert,
} from 'lucide-react';
import { api } from '../../lib/api';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

type ImportStep = 1 | 2 | 3 | 4;

export default function BulkImportModal({ isOpen, onClose, onImportSuccess }: BulkImportModalProps) {
  const [step, setStep] = useState<ImportStep>(1);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [validationStats, setValidationStats] = useState({
    total: 0,
    valid: 0,
    invalid: 0,
  });
  const [isImporting, setIsImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      parseAndValidate(selected);
    }
  };

  const parseAndValidate = (selectedFile: File) => {
    setIsParsing(true);
    setErrorMsg(null);
    const filename = selectedFile.name.toLowerCase();

    const processData = (rawRows: any[]) => {
      const normalized = rawRows.map((row: any) => {
        const obj: any = {};
        for (const key of Object.keys(row)) {
          obj[key.trim().toLowerCase()] = row[key];
        }
        return obj;
      });

      // Simple local validation
      let valid = 0;
      let invalid = 0;

      const preview = normalized.map((row) => {
        const name = row.name || row['customer name'] || row['fullname'] || '';
        const mobile = row.mobile || row.phone || row['mobile number'] || row['phone number'] || '';
        const email = row.email || row['email address'] || '';

        const hasName = String(name).trim().length > 0;
        const cleanMobile = String(mobile).replace(/[^\d+]/g, '');
        const hasMobile = cleanMobile.length >= 7;

        const isValid = hasName && hasMobile;
        if (isValid) valid++;
        else invalid++;

        return {
          name: String(name).trim(),
          mobile: cleanMobile,
          email: String(email).trim(),
          isValid,
          reason: !hasName ? 'Missing Name' : !hasMobile ? 'Invalid Phone' : '',
        };
      });

      setParsedRows(preview);
      setValidationStats({
        total: preview.length,
        valid,
        invalid,
      });
      setIsParsing(false);
      setStep(2); // Go to preview step
    };

    if (filename.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvString = e.target?.result as string;
        const parsed = Papa.parse(csvString, { header: true, skipEmptyLines: true });
        processData(parsed.data);
      };
      reader.readAsText(selectedFile);
    } else if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonRows = XLSX.utils.sheet_to_json(sheet);
        processData(jsonRows);
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      setErrorMsg('Unsupported file format. Please upload CSV or Excel (.xlsx).');
      setIsParsing(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setIsImporting(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/imports/customers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportSummary(res.data);
      setStep(4);
      onImportSuccess();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Bulk customer import failed.');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Name,Mobile,Email\nJohn Doe,+1234567890,john@example.com\nAlice Smith,+1987654321,alice@example.com';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'sample_customers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Import Customer Contacts</h3>
            <p className="text-xs text-slate-400">Step {step} of 4</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1: Upload File */}
        {step === 1 && (
          <div className="space-y-5 py-3">
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-slate-950/20">
              <input
                type="file"
                id="modalFileUpload"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="modalFileUpload" className="cursor-pointer space-y-3 block">
                <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center mx-auto border border-primary/20">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Click to browse or drag CSV/Excel spreadsheet
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Accepts CSV or XLSX templates</p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-slate-400">First time importing? Use our format template.</span>
              <button
                onClick={downloadSampleCSV}
                className="text-primary hover:underline font-semibold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Sample CSV
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preview Records */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">Extracted Raw Columns</span>
              <button
                onClick={() => setStep(3)}
                className="text-primary font-bold hover:underline flex items-center gap-0.5"
              >
                <span>Proceed to Validation</span> <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] tracking-wider uppercase text-slate-500">
                  <tr>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Mobile</th>
                    <th className="py-2 px-3">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parsedRows.slice(0, 10).map((row, i) => (
                    <tr key={i}>
                      <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{row.name}</td>
                      <td className="py-2 px-3 font-mono">{row.mobile}</td>
                      <td className="py-2 px-3 text-slate-400">{row.email || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-400">Previewing first 10 rows extracted from file.</p>
          </div>
        )}

        {/* Step 3: Validate Records */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl text-center border border-slate-100 dark:border-slate-805">
                <span className="text-xl font-bold text-slate-800 dark:text-white">{validationStats.total}</span>
                <p className="text-[10px] text-slate-400 mt-1">Total Contacts</p>
              </div>
              <div className="p-3.5 bg-primary-light rounded-xl text-center border border-primary/20">
                <span className="text-xl font-bold text-primary">{validationStats.valid}</span>
                <p className="text-[10px] text-primary font-semibold mt-1">Valid Records</p>
              </div>
              <div className="p-3.5 bg-rose-500/10 rounded-xl text-center border border-rose-500/20">
                <span className="text-xl font-bold text-rose-400">{validationStats.invalid}</span>
                <p className="text-[10px] text-rose-500 font-semibold mt-1">Invalid Rows</p>
              </div>
            </div>

            {validationStats.invalid > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex gap-2">
                <BadgeAlert className="w-4 h-4 shrink-0" />
                <p>Warning: {validationStats.invalid} records contain invalid format (missing name or short mobile number) and will be skipped.</p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setStep(2)}
                className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Back to Preview
              </button>
              <button
                onClick={handleImport}
                disabled={isImporting || validationStats.valid === 0}
                className="py-2.5 px-6 bg-primary hover:bg-primary-hover font-semibold text-white text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-primary/20 disabled:opacity-50"
              >
                {isImporting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Confirm & Execute Import'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Summary Report */}
        {step === 4 && importSummary && (
          <div className="space-y-5 text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Import Job Succeeded</h3>
              <p className="text-xs text-slate-400 mt-1">Contacts have been merged into your main directory</p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <div className="p-3 bg-primary-light rounded-xl border border-primary/25">
                <span className="text-lg font-black text-primary">{importSummary.importedCount}</span>
                <p className="text-[10px] text-primary font-bold mt-0.5">Imported</p>
              </div>
              <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/25">
                <span className="text-lg font-black text-rose-450">{importSummary.failedCount}</span>
                <p className="text-[10px] text-rose-500 font-bold mt-0.5">Failed</p>
              </div>
            </div>


            <button
              onClick={onClose}
              className="py-2 px-6 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
