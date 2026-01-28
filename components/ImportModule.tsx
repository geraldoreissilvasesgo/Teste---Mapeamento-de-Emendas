
import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, Check, X, Send, Download, FileSpreadsheet, Info } from 'lucide-react';
import { Amendment, Status, SectorConfig, Role, AmendmentType, TransferMode, GNDType } from '../types';

interface ImportModuleProps {
  onImport: (data: Amendment[]) => void;
  sectors: SectorConfig[];
}

interface ValidationError {
  line: number;
  message: string;
}

export const ImportModule: React.FC<ImportModuleProps> = ({ onImport, sectors }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Amendment[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const initialOrigin = 'SES/CEP-20903'; // Setor de origem fixo
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

  const handleConfirmImport = () => {
    if (!initialDestination) {
        setError("É obrigatório selecionar um setor de destino para a tramitação inicial.");
        return;
    }
    
    const destinationSector = sectors.find(s => s.name === initialDestination);
    if (!destinationSector) {
        setError("O setor de destino selecionado é inválido. Recarregue a página ou cadastre o setor.");
        return;
    }

    const finalData = parsedData.map(item => {
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + (destinationSector.defaultSlaDays || 5));

        const newMovement = {
            id: Math.random().toString(36).substr(2, 9),
            amendmentId: item.id,
            fromSector: initialOrigin,
            toSector: initialDestination,
            dateIn: new Date().toISOString(),
            dateOut: null,
            deadline: deadline.toISOString(),
            daysSpent: 0,
            handledBy: 'Sistema de Importação'
        };

        return {
            ...item,
            currentSector: initialDestination,
            movements: [newMovement]
        };
    });

    onImport(finalData);
  };

  const parseCurrency = (valStr: string): number => {
    if (!valStr) return 0;
    return parseFloat(valStr.replace('R$', '').replace(/\./g, '').replace(',', '.') || '0');
  };

  const parseBool = (valStr: string): boolean => {
    return valStr?.trim().toLowerCase() === 'sim';
  };

  const handleFileProcessing = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError("Formato de arquivo inválido. Apenas arquivos .CSV são aceitos.");
      return;
    }
    setFile(file);
    setError(null);
    setParsedData([]);
    setValidationErrors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(';').map(h => h.trim());
      const validRows: Amendment[] = [];
      const errors: ValidationError[] = [];

      lines.slice(1).forEach((line, index) => {
        if (line.trim() === '') return;
        
        const data = line.split(';');
        const rowData: { [key: string]: string } = {};
        headers.forEach((header, i) => {
          rowData[header] = data[i] ? data[i].trim() : '';
        });

        // Validation
        const sei = rowData['PROCESSO_SEI'];
        const value = parseCurrency(rowData['VALOR_RECURSO']);
        const municipality = rowData['MUNICIPIO_BENEFICIARIO'];

        if (!sei || !value || !municipality) {
          errors.push({ line: index + 2, message: `Campos obrigatórios (SEI, Valor, Município) faltando.` });
          return;
        }

        const newAmendment: Amendment = {
          id: rowData['ID_SISTEMA'] || `IMP-${Date.now()}-${index}`,
          code: `IMP-${rowData['EXERCICIO'] || new Date().getFullYear()}-${sei.slice(-5)}`,
          seiNumber: sei,
          year: parseInt(rowData['EXERCICIO']) || new Date().getFullYear(),
          type: AmendmentType.IMPOSITIVA, // Default or map from file
          deputyName: rowData['PARLAMENTAR_AUTOR'],
          municipality,
          object: rowData['OBJETO_DESCRICAO'] || 'Objeto não especificado na importação',
          value,
          status: Status.IN_PROGRESS,
          currentSector: initialOrigin,
          movements: [],
          suinfra: parseBool(rowData['REQUER_SUINFRA']),
          sutis: parseBool(rowData['REQUER_SUTIS']),
          transferMode: rowData['MODALIDADE'] as TransferMode || TransferMode.FUNDO_A_FUNDO,
          gnd: rowData['GND'] as GNDType || GNDType.CUSTEIO,
          entryDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          notes: rowData['OBSERVACOES_GERAIS']
        };
        validRows.push(newAmendment);
      });
      
      setParsedData(validRows);
      setValidationErrors(errors);

      if (errors.length > 0) {
        setError(`Processamento concluído com ${errors.length} erro(s). Verifique os detalhes abaixo.`);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcessing(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcessing(e.target.files[0]);
    }
  };


  const handleDownloadTemplate = () => {
    const headers = "ID_SISTEMA;PROCESSO_SEI;VALOR_RECURSO;MUNICIPIO_BENEFICIARIO;OBJETO_DESCRICAO;REQUER_SUINFRA;REQUER_SUTIS;STATUS_ATUAL;MODALIDADE;EXERCICIO;PARLAMENTAR_AUTOR;COLUNA_VAZIA_4;OBSERVACOES_GERAIS\n";
    const exampleRow = "IMP-001;2025000012345;150000,00;Goiânia;Aquisição de Equipamentos Hospitalares;Não;Sim;EM ANDAMENTO;FUNDO A FUNDO;2025;DELEGADO EDUARDO PRADO;;Notas adicionais aqui\n";
    
    const blob = new Blob([headers + exampleRow], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_importacao_gesa.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-black text-[#0d457a] uppercase tracking-tighter">Importação de Processos em Lote</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Cadastro massivo via arquivo CSV (UTF-8, delimitado por ponto e vírgula).</p>
        </div>
        <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 bg-white text-slate-600 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 shadow-sm transition-all text-[10px] uppercase font-black tracking-widest"
          >
            <FileSpreadsheet size={16} />
            Baixar Modelo
        </button>
      </div>

      {!file ? (
        <div 
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative p-12 text-center border-4 border-dashed rounded-[40px] transition-all cursor-pointer group
            ${dragActive ? 'border-[#0d457a] bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept=".csv" />
          <div className="flex flex-col items-center justify-center">
            <div className={`p-6 bg-slate-100 rounded-3xl mb-6 transition-all group-hover:bg-[#0d457a] group-hover:text-white ${dragActive ? 'bg-[#0d457a] text-white' : 'text-slate-400'}`}>
              <UploadCloud size={48} />
            </div>
            <h3 className="font-black text-slate-700">Arraste e Solte o Arquivo CSV</h3>
            <p className="text-xs text-slate-400 uppercase font-bold mt-2">ou clique para selecionar do seu computador</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FileText size={24} className="text-emerald-500" />
              <div>
                <p className="font-bold text-slate-800">{file.name}</p>
                <p className="text-xs text-slate-400 font-medium">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <button 
              onClick={() => { setFile(null); setParsedData([]); setValidationErrors([]); setError(null); }}
              className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-red-100 transition-colors"
            >
              <X size={14} /> Trocar Arquivo
            </button>
          </div>
          
          <div className="bg-blue-50 p-8 rounded-3xl border-2 border-dashed border-blue-200 grid grid-cols-2 gap-8">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Setor de Origem (Padrão)</label>
                <input 
                    readOnly
                    className="w-full px-5 py-4 bg-slate-200/50 text-slate-500 rounded-2xl outline-none font-bold"
                    value={initialOrigin}
                />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest ml-1">Setor de Destino (Tramitação Inicial)</label>
                <select 
                    className="w-full px-5 py-4 bg-white rounded-2xl outline-none font-bold text-[#0d457a] uppercase text-xs"
                    value={initialDestination}
                    onChange={(e) => setInitialDestination(e.target.value)}
                >
                    <option value="">Selecione o destino...</option>
                    {sectors.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
            </div>
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-sm mb-2">{error}</p>
                {validationErrors.map((err, i) => (
                  <p key={i} className="text-xs font-mono">Linha {err.line}: {err.message}</p>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-200">
              <h4 className="flex items-center gap-2 text-emerald-600 font-bold text-sm mb-4">
                <Check size={18} /> {parsedData.length} Registros Válidos para Importação
              </h4>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {parsedData.map(item => (
                  <div key={item.id} className="p-3 bg-emerald-50 rounded-lg text-xs">
                    <span className="font-bold text-emerald-800">{item.seiNumber}</span> - <span className="text-emerald-700">{item.municipality}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-red-200">
              <h4 className="flex items-center gap-2 text-red-600 font-bold text-sm mb-4">
                <X size={18} /> {validationErrors.length} Registros com Erros (Ignorados)
              </h4>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {validationErrors.map((err, i) => (
                  <div key={i} className="p-3 bg-red-50 rounded-lg text-xs">
                    <span className="font-bold text-red-800">Linha {err.line}:</span> <span className="text-red-700">{err.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              disabled={parsedData.length === 0 || !initialDestination}
              onClick={handleConfirmImport}
              className="bg-[#0d457a] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 uppercase text-xs shadow-xl hover:bg-[#0a365f] disabled:opacity-40 transition-all"
            >
              <Send size={16} /> Confirmar e Importar {parsedData.length} Registros
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
