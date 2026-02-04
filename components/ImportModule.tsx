
import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, Check, X, Send, Download, FileSpreadsheet, Info } from 'lucide-react';
import { Amendment, AmendmentType, Status, AmendmentMovement } from '../types.ts';
import { generateUUID } from '../services/supabase.ts';

interface ImportModuleProps {
  onImport: (data: Amendment[]) => void;
  sectors: any[];
  tenantId: string;
}

interface ValidationError {
  line: number;
  message: string;
}

export const ImportModule: React.FC<ImportModuleProps> = ({ onImport, sectors, tenantId }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Amendment[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const initialOrigin = 'Origem Externa';
  const mandatorySector = 'SES/CEP-20903';
  const [initialDestination, setInitialDestination] = useState<string>(mandatorySector);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "text/csv" || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        handleFileProcessing(droppedFile);
      } else {
        setError("Por favor, envie um arquivo CSV válido.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      handleFileProcessing(e.target.files[0]);
    }
  };

  const parseCurrency = (valStr: string): number => {
    if (!valStr) return 0;
    const cleanedString = valStr.replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.').trim();
    const value = parseFloat(cleanedString);
    return isNaN(value) ? 0 : value;
  };

  const handleFileProcessing = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      
      if (lines.length < 2) {
        setError("O arquivo parece estar vazio ou sem cabeçalho.");
        return;
      }

      const validRows: Amendment[] = [];
      const errors: ValidationError[] = [];

      lines.slice(1).forEach((line, index) => {
        if (!line.trim()) return;
        
        const cols = line.split(';');
        if (cols.length < 5) {
          errors.push({ line: index + 2, message: "Linha com colunas insuficientes." });
          return;
        }

        try {
          const newAmendment: Amendment = {
            id: `imp-${generateUUID()}`,
            tenantId: tenantId,
            code: `IMP-${cols[1]?.trim() || new Date().getFullYear()}-${index}`,
            seiNumber: cols[0]?.trim(),
            year: parseInt(cols[1]?.trim()) || new Date().getFullYear(),
            object: cols[2]?.trim(),
            value: parseCurrency(cols[3]),
            municipality: cols[4]?.trim(),
            deputyName: cols[5]?.trim() || 'Não Informado',
            type: AmendmentType.IMPOSITIVA,
            status: Status.DOCUMENT_ANALYSIS,
            currentSector: mandatorySector,
            movements: [], 
            createdAt: new Date().toISOString(),
            suinfra: false,
            sutis: false
          };

          if (!newAmendment.seiNumber) throw new Error("Número SEI ausente");
          validRows.push(newAmendment);
        } catch (err) {
          errors.push({ line: index + 2, message: "Erro ao processar dados da linha." });
        }
      });
      
      setParsedData(validRows);
      setValidationErrors(errors);
      setError(null);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    const finalData = parsedData.map(item => {
      const destSectorConfig = sectors.find(s => s.name === initialDestination);
      const slaDays = destSectorConfig?.defaultSlaDays || 5;
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + slaDays);

      const newMovement: AmendmentMovement = {
        id: generateUUID(),
        amendmentId: item.id,
        fromSector: initialOrigin,
        toSector: initialDestination,
        dateIn: new Date().toISOString(),
        dateOut: null,
        deadline: deadline.toISOString(),
        daysSpent: 0,
        handledBy: 'Ingestão GESA Lote',
        analysisType: destSectorConfig?.analysisType,
      };

      return {
        ...item,
        currentSector: initialDestination,
        movements: [newMovement],
      };
    });

    onImport(finalData);
    setFile(null);
    setParsedData([]);
    setValidationErrors([]);
  };

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,SEI;Ano;Objeto;Valor;Municipio;Autor\n12345678;2024;Aquisição de Ambulância;250000,00;Goiânia;Parlamentar Teste";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "modelo_ingestao_gesa.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-[#0d457a] uppercase tracking-tighter leading-none">Ingestão de Dados</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
            <UploadCloud size={14} className="text-blue-500" /> Carga Massiva para Repositório GESA
          </p>
        </div>
        <button onClick={handleDownloadTemplate} className="flex items-center gap-2 bg-white text-[#0d457a] border border-slate-200 px-6 py-3 rounded-2xl hover:bg-slate-50 transition-all shadow-sm uppercase text-[10px] font-black tracking-widest">
            <FileSpreadsheet size={16} /> Baixar Modelo CSV
        </button>
      </div>
      
      {!file ? (
        <div 
          className={`border-4 border-dashed rounded-[40px] p-24 text-center transition-all ${dragActive ? 'border-[#0d457a] bg-blue-50' : 'border-slate-200 bg-white shadow-inner'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <UploadCloud size={40} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-[#0d457a] uppercase mb-2">Preparar Ingestão GESA</h3>
          <p className="text-slate-400 font-bold text-sm mb-10 uppercase tracking-tight">Arraste o arquivo ou clique para selecionar</p>
          <button onClick={() => fileInputRef.current?.click()} className="bg-[#0d457a] text-white px-10 py-4 rounded-2xl font-black uppercase text-xs hover:bg-[#0a365f] transition-all shadow-xl">
            Procurar Arquivo
          </button>
          <input 
            ref={fileInputRef} 
            type="file" 
            accept=".csv" 
            className="hidden" 
            onChange={handleFileChange} 
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                <FileText size={32} />
              </div>
              <div>
                <p className="font-black text-[#0d457a] text-lg leading-none">{file.name}</p>
                <p className="text-[10px] text-slate-400 font-black uppercase mt-2">Volume: {(file.size / 1024).toFixed(2)} KB • {parsedData.length} registros</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="relative">
                 <select 
                    value={initialDestination} 
                    onChange={(e) => setInitialDestination(e.target.value)}
                    className="pl-5 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 ring-blue-500/5 outline-none text-xs font-black text-slate-600 appearance-none uppercase"
                 >
                    <option value={mandatorySector}>{mandatorySector} (PROTOCOLAR)</option>
                    {sectors.filter(s => s.name !== mandatorySector).map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                 </select>
                 <Info size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"/>
               </div>
               <button onClick={() => { setFile(null); setParsedData([]); setError(null); }} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors">
                 <X size={24} />
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 text-emerald-600">
                <Check size={24} /> <span className="font-black uppercase text-xs tracking-widest">Pré-visualização de Registros</span>
              </div>
              <div className="h-64 overflow-y-auto custom-scrollbar space-y-3">
                {parsedData.map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                    <div>
                        <span className="font-black text-[#0d457a] text-[10px] uppercase">{item.seiNumber}</span>
                        <p className="text-[9px] text-slate-400 font-bold uppercase truncate max-w-[200px]">{item.object}</p>
                    </div>
                    <span className="text-[9px] font-black text-slate-600">R$ {item.value.toLocaleString('pt-BR')}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 text-red-500">
                <AlertCircle size={24} /> <span className="font-black uppercase text-xs tracking-widest">Inconsistências ({validationErrors.length})</span>
              </div>
              <div className="h-64 overflow-y-auto custom-scrollbar space-y-3">
                {validationErrors.map((err, idx) => (
                   <div key={idx} className="p-4 bg-red-50/50 rounded-xl border border-red-100 text-[10px] text-red-600 font-bold uppercase">
                    Linha {err.line}: {err.message}
                   </div>
                ))}
                {validationErrors.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50">
                        <Check size={48} className="mb-4" />
                        <p className="text-[10px] font-black uppercase">Arquivo Integro</p>
                    </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
             <button 
               onClick={handleConfirmImport} 
               disabled={parsedData.length === 0}
               className="flex items-center gap-3 bg-[#0d457a] text-white px-12 py-5 rounded-[24px] hover:bg-[#0a365f] transition-all shadow-2xl disabled:opacity-50 font-black uppercase text-xs tracking-[0.2em]"
             >
               <Send size={20} /> Efetivar Ingestão
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
