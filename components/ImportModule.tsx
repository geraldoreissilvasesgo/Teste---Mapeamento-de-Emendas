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

  // Helper to parse dates from DD/MM/YYYY to YYYY-MM-DD
  const parseDate = (dateStr: string): string | undefined => {
    if (!dateStr) return undefined;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return undefined;
  };

  // Helper to parse currency "R$ 500.000,00" -> 500000.00
  const parseCurrency = (valStr: string): number => {
    if (!valStr) return 0;
    return parseFloat(valStr.replace('R$', '').replace(/\./g, '').replace(',', '.') || '0');
  };

  // Helper to map boolean "Sim" -> true
  const parseBool = (valStr: string): boolean => {
    return valStr?.trim().toLowerCase() === 'sim';
  };

  const parseCSV = (text: string) => {
    try {
      const lines = text.split('\n');
      const data: Amendment[] = [];
      
      // Assume first row is header, start from index 1
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const delimiter = line.includes(';') ? ';' : ',';
        const cols = line.split(delimiter);

        // Mapeamento baseado na imagem da planilha:
        // A (0): Sequencia (IGNORAR AGORA)
        // B (1): SEI
        // C (2): Valores
        // D (3): Municipio
        // E (4): Objeto
        // F (5): SUINFRA
        // G (6): SUTIS
        // H (7): Status
        // I (8): Data Entrada
        // J (9): Data Saída
        // ...
        // M (12): Observações

        if (cols.length < 5) continue; 

        const seiNumber = cols[1]?.trim();
        // Generate a random code since sequence is gone
        const code = `EM-IMP-${Math.floor(Math.random() * 90000) + 10000}`;

        const statusText = cols[7]?.trim();
        let mappedStatus = Status.PROCESSING;
        if (statusText?.toLowerCase().includes('concluída')) mappedStatus = Status.CONCLUDED;
        if (statusText?.toLowerCase().includes('diligência')) mappedStatus = Status.DILIGENCE_SGI;

        const newAmendment: Amendment = {
          id: Math.random().toString(36).substr(2, 9),
          // sequence removed
          code: code,
          type: AmendmentType.IMPOSITIVA, // Default type for imported items
          seiNumber: seiNumber || 'N/A',
          value: parseCurrency(cols[2]),
          municipality: cols[3]?.trim() || 'Não Identificado',
          object: cols[4]?.trim() || 'Objeto não especificado',
          suinfra: parseBool(cols[5]),
          sutis: parseBool(cols[6]),
          statusDescription: statusText,
          status: mappedStatus,
          entryDate: parseDate(cols[8]),
          exitDate: parseDate(cols[9]),
          notes: cols[12]?.trim(), // Observações na coluna M (índice 12 se contar K e L vazias)
          
          // Defaults
          year: new Date().getFullYear(),
          deputyName: 'Importado da Planilha',
          party: '-',
          healthUnit: 'SES-GO',
          currentSector: Sector.PROTOCOL,
          createdAt: new Date().toISOString(),
          movements: []
        };

        // Initialize standard movement
        newAmendment.movements.push({
          id: Math.random().toString(36).substr(2, 9),
          amendmentId: newAmendment.id,
          fromSector: null,
          toSector: Sector.PROTOCOL,
          dateIn: newAmendment.entryDate || new Date().toISOString(),
          dateOut: null,
          daysSpent: 0,
          handledBy: 'system-import'
        });

        data.push(newAmendment);
      }

      if (data.length === 0) {
        setError("Nenhum dado válido encontrado. Verifique se o separador é ponto-e-vírgula (;).");
      } else {
        setParsedData(data);
        setError(null);
      }
    } catch (err) {
      setError("Erro ao processar o arquivo. Verifique o layout.");
    }
  };

  const handleFile = (file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      setError("Envie apenas arquivos CSV.");
      return;
    }
    setFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        parseCSV(text);
      }
    };
    reader.readAsText(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const downloadTemplate = () => {
    // Matches the spreadsheet structure
    const header = "SEQUENCIA;PROCESSOS SEI;VALORES;MUNICIPIOS;OBJETO;SUINFRA;SUTIS;STATUS;DATA ENTRADA;DATA SAIDA;;;OBSERVACOES\n";
    const example = "1;202500042004774;500.000,00;São Francisco de Goiás;ANEXO II;Não;Não;Concluída;14/11/2025;14/11/2025;;;Sem pendencias";
    const blob = new Blob([header + example], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "layout_subipei_emendas.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleConfirm = () => {
    if (parsedData.length > 0) {
      onImport(parsedData);
      setFile(null);
      setParsedData([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0d457a] uppercase tracking-tight">Importação de Dados</h2>
          <p className="text-slate-500 text-sm">Carregamento da planilha de Consolidação de Dados (SUBIPEI).</p>
        </div>
        <button 
          onClick={downloadTemplate}
          className="flex items-center gap-2 text-[#0d457a] bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-md font-medium text-sm transition-colors"
        >
          <Download size={16} />
          Modelo Planilha
        </button>
      </div>

      {!parsedData.length ? (
        <div 
          className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center transition-colors
            ${dragActive ? 'border-[#0d457a] bg-blue-50' : 'border-slate-300 hover:border-[#0d457a] hover:bg-slate-50'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <FileSpreadsheet size={40} className="text-[#0d457a]" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">Arraste a planilha (.csv) aqui</h3>
          <p className="text-slate-500 text-sm mb-6">Compatível com layout: Sequência, SEI, Valores, Município, Objeto...</p>
          
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept=".csv"
            onChange={handleChange} 
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2.5 bg-[#0d457a] text-white rounded-md font-bold uppercase text-xs tracking-wider shadow-sm hover:bg-[#0a365f] transition-colors"
          >
            Selecionar Arquivo
          </button>

          {error && (
            <div className="mt-6 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-md border border-red-100 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="bg-emerald-100 p-2 rounded-full">
                    <Check size={20} className="text-emerald-700" />
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-800">Pré-visualização</h3>
                    <p className="text-xs text-slate-500">{parsedData.length} registros reconhecidos.</p>
                 </div>
              </div>
              <div className="flex gap-3">
                 <button 
                    onClick={() => { setParsedData([]); setFile(null); }}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50"
                 >
                    Cancelar
                 </button>
                 <button 
                    onClick={handleConfirm}
                    className="px-4 py-2 bg-[#0d457a] text-white rounded-md text-sm font-bold uppercase hover:bg-[#0a365f] shadow-sm"
                 >
                    Confirmar Importação
                 </button>
              </div>
           </div>

           <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs whitespace-nowrap">
                 <thead className="bg-slate-100 text-[#0d457a] sticky top-0 z-10">
                    <tr>
                       <th className="px-3 py-3 font-bold border-b border-slate-200">SEI</th>
                       <th className="px-3 py-3 font-bold border-b border-slate-200">Valor</th>
                       <th className="px-3 py-3 font-bold border-b border-slate-200">Município</th>
                       <th className="px-3 py-3 font-bold border-b border-slate-200">Objeto</th>
                       <th className="px-3 py-3 font-bold border-b border-slate-200">SUINFRA</th>
                       <th className="px-3 py-3 font-bold border-b border-slate-200">SUTIS</th>
                       <th className="px-3 py-3 font-bold border-b border-slate-200">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {parsedData.map((item, idx) => (
                       <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-medium text-slate-700">{item.seiNumber}</td>
                          <td className="px-3 py-2 font-mono text-slate-600">R$ {item.value.toLocaleString('pt-BR')}</td>
                          <td className="px-3 py-2 text-slate-600">{item.municipality}</td>
                          <td className="px-3 py-2 text-slate-600 truncate max-w-[150px]" title={item.object}>{item.object}</td>
                          <td className="px-3 py-2">
                             <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.suinfra ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                                {item.suinfra ? 'SIM' : 'NÃO'}
                             </span>
                          </td>
                          <td className="px-3 py-2">
                             <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.sutis ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                                {item.sutis ? 'SIM' : 'NÃO'}
                             </span>
                          </td>
                          <td className="px-3 py-2 text-slate-600">{item.statusDescription}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
};