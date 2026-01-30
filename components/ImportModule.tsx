
/**
 * MÓDULO DE IMPORTAÇÃO DE PROCESSOS EM LOTE
 * 
 * Este componente permite que os usuários cadastrem múltiplos processos de uma só vez
 * através do upload de um arquivo CSV. Ele valida os dados, mostra um resumo
 * dos registros válidos e inválidos, e permite a confirmação da importação.
 */
import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, Check, X, Send, Download, FileSpreadsheet, Info } from 'lucide-react';
import { Amendment, Status, SectorConfig, Role, AmendmentType, TransferMode, GNDType, AmendmentMovement } from '../types';

interface ImportModuleProps {
  onImport: (data: Amendment[]) => void;
  sectors: SectorConfig[];
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
  
  const initialOrigin = 'SES/CEP-20903';
  const [initialDestination, setInitialDestination] = useState<string>('');

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

  const parseBool = (valStr: string): boolean => {
    if (!valStr) return false;
    const lowerVal = valStr.trim().toLowerCase();
    return ['true', 'sim', 's', 'verdadeiro', '1'].includes(lowerVal);
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
          // Mapeamento básico: SEI;Ano;Objeto;Valor;Municipio;Autor
          const newAmendment: Amendment = {
            id: `imp-${Date.now()}-${index}`,
            tenantId: tenantId,
            code: `IMP-${cols[1] || new Date().getFullYear()}-${index}`,
            seiNumber: cols[0]?.trim(),
            year: parseInt(cols[1]?.trim()) || new Date().getFullYear(),
            object: cols[2]?.trim(),
            value: parseCurrency(cols[3]),
            municipality: cols[4]?.trim(),
            deputyName: cols[5]?.trim() || 'Não Informado',
            type: AmendmentType.IMPOSITIVA, // Default
            status: Status.IN_PROGRESS,
            currentSector: 'Aguardando Distribuição',
            movements: [], // Será preenchido ao confirmar
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
    if (!initialDestination) {
      setError("Selecione um setor de destino para iniciar a tramitação.");
      return;
    }

    const finalData = parsedData.map(item => {
      const destSectorConfig = sectors.find(s => s.name === initialDestination);
      const slaDays = destSectorConfig?.defaultSlaDays || 5;
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + slaDays);

      const newMovement: AmendmentMovement = {
        id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        amendmentId: item.id,
        fromSector: initialOrigin,
        toSector: initialDestination,
        dateIn: new Date().toISOString(),
        dateOut: null,
        deadline: deadline.toISOString(),
        daysSpent: 0,
        handledBy: 'Sistema (Importação)',
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
    setInitialDestination('');
  };

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,SEI;Ano;Objeto;Valor;Municipio;Autor\n12345678;2024;Reforma de Escola;150000,00;Goiânia;Deputado Exemplo";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "modelo_importacao_gesa.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Importação em Lote</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Carga de Dados via Arquivo CSV (Excel)</p>
        </div>
        <button onClick={handleDownloadTemplate} className="flex items-center gap-2 bg-white text-[#0d457a] border border-slate-200 px-5 py-2.5 rounded-2xl hover:bg-slate-50 transition-all shadow-sm uppercase text-[10px] font-black tracking-widest">
            <FileSpreadsheet size={16} /> Baixar Modelo
        </button>
      </div>
      
      {!file ? (
        <div 
          className={`border-4 border-dashed rounded-[40px] p-20 text-center transition-all ${dragActive ? 'border-[#0d457a] bg-blue-50' : 'border-slate-200 bg-slate-50'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <UploadCloud size={40} className="text-[#0d457a]" />
          </div>
          <h3 className="text-xl font-black text-[#0d457a] uppercase mb-2">Arraste seu arquivo CSV aqui</h3>
          <p className="text-slate-400 font-bold text-sm mb-8">ou clique para selecionar do computador</p>
          <button onClick={() => fileInputRef.current?.click()} className="bg-[#0d457a] text-white px-8 py-3 rounded-xl font-black uppercase text-xs hover:bg-[#0a365f] transition-all shadow-lg">
            Selecionar Arquivo
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
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <FileText size={24} />
              </div>
              <div>
                <p className="font-black text-[#0d457a]">{file.name}</p>
                <p className="text-xs text-slate-400 font-bold uppercase">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="relative">
                 <select 
                    value={initialDestination} 
                    onChange={(e) => setInitialDestination(e.target.value)}
                    className="pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d457a] outline-none text-sm font-bold text-slate-600 appearance-none"
                 >
                    <option value="">Selecione o Destino Inicial</option>
                    {sectors.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                 </select>
                 <Info size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
               </div>
               <button onClick={() => { setFile(null); setParsedData([]); setError(null); }} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors">
                 <X size={20} />
               </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
              <AlertCircle size={20} /> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <div className="flex items-center gap-2 mb-4 text-emerald-600">
                <Check size={20} /> <span className="font-black uppercase text-sm">Registros Válidos ({parsedData.length})</span>
              </div>
              <div className="h-48 overflow-y-auto custom-scrollbar space-y-2">
                {parsedData.map((item, idx) => (
                  <div key={idx} className="text-xs text-slate-500 border-b border-slate-50 pb-2">
                    <span className="font-bold text-[#0d457a]">{item.seiNumber}</span> - {item.object.substring(0, 40)}...
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <div className="flex items-center gap-2 mb-4 text-red-500">
                <AlertCircle size={20} /> <span className="font-black uppercase text-sm">Erros Encontrados ({validationErrors.length})</span>
              </div>
              <div className="h-48 overflow-y-auto custom-scrollbar space-y-2">
                {validationErrors.map((err, idx) => (
                   <div key={idx} className="text-xs text-red-400 border-b border-red-50 pb-2">
                    Line {err.line}: {err.message}
                   </div>
                ))}
                {validationErrors.length === 0 && <p className="text-xs text-slate-400 italic">Nenhum erro de validação.</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
             <button 
               onClick={handleConfirmImport} 
               disabled={parsedData.length === 0 || !initialDestination}
               className="flex items-center gap-2 bg-[#0d457a] text-white px-8 py-4 rounded-2xl hover:bg-[#0a365f] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-black uppercase text-xs tracking-widest"
             >
               <Send size={16} /> Confirmar Importação
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
