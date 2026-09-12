'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Loader2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../../lib/api';

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      parseSelectedFile(selected);
    }
  };

  const parseSelectedFile = (selectedFile: File) => {
    setFile(selectedFile);
    setIsParsing(true);
    setErrorMsg(null);
    setSummary(null);

    const filename = selectedFile.name.toLowerCase();

    if (filename.endsWith('.csv')) {
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setPreviewRows(results.data.slice(0, 10));
          setIsParsing(false);
        },
        error: (err) => {
          setErrorMsg('Failed to parse CSV file.');
          setIsParsing(false);
        },
      });
    } else if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonRows = XLSX.utils.sheet_to_json(sheet);
          setPreviewRows(jsonRows.slice(0, 10));
        } catch (err) {
          setErrorMsg('Failed to parse Excel file.');
        } finally {
          setIsParsing(false);
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      setErrorMsg('Please upload a valid CSV or Excel (.xlsx) file.');
      setIsParsing(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Name,Mobile,Email\nJohn Doe,+1234567890,john@example.com\nAlice Smith,+1987654321,alice@example.com\nBob Johnson,+1122334455,bob@example.com';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'sample_customers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/imports/customers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSummary(res.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Bulk customer import failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-900 flex items-center gap-2.5">
            <UploadCloud className="w-7 h-7 text-emerald-500" />
            <span>Bulk Customer Import</span>
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">
            Upload CSV or Excel spreadsheets to quickly add hundreds of customer contacts
          </p>
        </div>

        <button
          onClick={downloadSampleCSV}
          className="py-2.5 px-4 bg-white border border-slate-200 hover:border-slate-700 font-semibold text-slate-800 text-xs rounded-xl transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Download Sample CSV</span>
        </button>
      </div>

      {/* Upload Dropzone */}
      <div className="bg-white dark:bg-white border-2 border-dashed border-slate-300 dark:border-slate-200 hover:border-emerald-500/50 rounded-2xl p-8 text-center transition-colors">
        <input
          type="file"
          id="fileUpload"
          accept=".csv, .xlsx, .xls"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="fileUpload" className="cursor-pointer space-y-3 block">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-900">
              {file ? file.name : 'Click or Drag & Drop CSV / Excel File'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Supports .csv, .xlsx and .xls formats</p>
          </div>
        </label>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Pre-Import Data Preview */}
      {previewRows.length > 0 && !summary && (
        <div className="bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>File Data Preview (First 10 Rows)</span>
            </h3>
            <span className="text-xs text-slate-400">Total File Selected: {file?.name}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-100/60 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-200">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {previewRows.map((row, i) => (
                  <tr key={i}>
                    <td className="py-2.5 px-4 font-mono text-slate-400">{i + 1}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-slate-900">
                      {row.name || row.Name || row['Customer Name'] || 'N/A'}
                    </td>
                    <td className="py-2.5 px-4 font-mono">
                      {row.mobile || row.Mobile || row.phone || row['Mobile Number'] || 'N/A'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">{row.email || row.Email || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={isSubmitting}
              className="py-2.5 px-6 bg-emerald-500 hover:bg-emerald-600 font-semibold text-white text-xs rounded-xl transition-all flex items-center gap-2 shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Execute Bulk Import</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Summary Report Results */}
      {summary && (
        <div className="bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-900">Import Execution Summary</h3>
              <p className="text-xs text-slate-400 dark:text-slate-400">Processed file: {file?.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span className="text-2xl font-extrabold text-emerald-400">{summary.importedCount}</span>
              <p className="text-xs text-emerald-500 font-semibold mt-1">Successfully Imported</p>
            </div>
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
              <span className="text-2xl font-extrabold text-rose-400">{summary.failedCount}</span>
              <p className="text-xs text-rose-500 font-semibold mt-1">Failed Rows</p>
            </div>
          </div>

          {summary.errorRows && summary.errorRows.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-rose-400">Failed Rows Details</h4>
              <div className="max-h-40 overflow-y-auto bg-slate-50 p-3 rounded-xl text-xs space-y-1 font-mono text-slate-700">
                {summary.errorRows.map((err: any, idx: number) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-rose-400 font-bold">Row {err.row}:</span>
                    <span>{err.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setFile(null);
              setPreviewRows([]);
              setSummary(null);
            }}
            className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-200 text-xs font-semibold text-slate-400 hover:text-slate-900 flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Upload Another File</span>
          </button>
        </div>
      )}
    </div>
  );
}
