
import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, Check, X, HelpCircle, Download, FileSpreadsheet } from 'lucide-react';
import { Amendment, Status, Sector, Role, AmendmentType } from '../types';

interface ImportModuleProps {
  onImport: (data: Amendment[]) => void;
}

export const ImportModule: React.FC<ImportModuleProps> = ({ onImport }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Amendment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const parseCurrency = (valStr: string): number => {
    if (!valStr) return 0;
    return parseFloat(valStr.replace('R$', '').replace(/\./g, '').replace(',', '.') || '0');
  };

  const parseBool = (valStr: string): boolean => {
    return valStr?.trim().toLowerCase() === 'sim';
  };

  const parseCSV = (text: string) => {
    try {
      const lines = text.split('\n');
      const data: Amendment[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const delimiter = line.includes(';') ? ';' : ',';
        const cols = line.split(delimiter);

        if (cols.length < 5) continue; 

        const seiNumber = cols[1]?.trim();
        const code = `EM-IMP-${Math.floor(Math.random() * 90000) + 10000}`;

        const statusText = cols[7]?.trim();
        let mappedStatus = Status.PROCESSING;
        if (statusText?.toLowerCase().includes('concluída')) mappedStatus = Status.CONCLUDED;
        if (statusText?.toLowerCase().includes('diligência')) mappedStatus = Status.DILIGENCE;

        const newAmendment: Amendment = {
          id: Math.random().toString(36).substr(2, 9),
          code: code,
          type: AmendmentType.IMPOSITIVA,
          seiNumber: seiNumber || 'N/A',
          value: parseCurrency(cols[2]),
          municipality: cols[3]?.trim() || 'Não Identificado',
          object: cols[4]?.trim() || 'Objeto não especificado',
          suinfra: parseBool(cols[5]),
          sutis: parseBool(cols[6]),
          statusDescription: statusText,
          status: mappedStatus,
          entryDate: new Date().toISOString().split('T')[0],
          exitDate: null,
          notes: cols[12]?.trim(),
          year: new Date().getFullYear(),
          deputyName: 'Importado via Planilha',
          healthUnit: 'SES-GO',
          currentSector: Sector.PROTOCOL,
          createdAt: new Date().toISOString(),
          movements: []
        };

        newAmendment.movements.push({
          id: Math.random().toString(36).substr(2, 9),
          amendmentId: newAmendment.id,
          fromSector: null,
          toSector: Sector.PROTOCOL,
          dateIn: new Date().toISOString(),
          dateOut: null,
          deadline: new Date().toISOString(),
          daysSpent: 0,
          handledBy: 'Importação Automática'
        });

        data.push(newAmendment);
      }

      if (data.length === 0) {
        setError("Nenhum dado válido encontrado.");
      } else {
        setParsedData(data);
        setError(null);
      }
    } catch (err) {
      setError("Erro ao processar arquivo CSV.");
    }
  };

  const handleFile = (file: File) => {
    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') parseCSV(text);
    };
    reader.readAsText(file);
  };

  const handleConfirm = () => {
    onImport(parsedData);
    setParsedData([]);
    setFile(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0d457a] uppercase tracking-tight">Importação de Dados</h2>
          <p className="text-slate-500 text-sm">Carga de dados via planilha de consolidação SUBIPEI.</p>
        </div>
      </div>

      {!parsedData.length ? (
        <div 
          className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center transition-colors
            ${dragActive ? 'border-[#0d457a] bg-blue-50' : 'border-slate-300 hover:border-[#0d457a] hover:bg-slate-50'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
        >
          <UploadCloud size={48} className="text-slate-400 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">Arraste seu arquivo CSV</h3>
          <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
          <button onClick={() => fileInputRef.current?.click()} className="mt-4 bg-[#0d457a] text-white px-6 py-2 rounded-lg font-bold uppercase text-xs">Selecionar Arquivo</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[#0d457a] uppercase">{parsedData.length} Registros Prontos</h3>
            <div className="flex gap-2">
              <button onClick={() => setParsedData([])} className="px-4 py-2 text-slate-500 font-bold uppercase text-xs">Cancelar</button>
              <button onClick={handleConfirm} className="bg-[#0d457a] text-white px-4 py-2 rounded-lg font-bold uppercase text-xs">Confirmar Tudo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
