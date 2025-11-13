import { useState, useEffect } from 'react';
import { FileText, Download, Filter, Loader2, Users, UserX, ClipboardCheck } from 'lucide-react';
import type { Candidate } from '../types/candidate';

interface ReportsPageProps {
  onClose: () => void;
}

type ReportType = 'classificados' | 'desclassificados' | 'entrevista_classificados' | 'entrevista_desclassificados';

export default function ReportsPage({ onClose }: ReportsPageProps) {
  const [loading, setLoading] = useState(false);
  const [analysts, setAnalysts] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [selectedAnalyst, setSelectedAnalyst] = useState<string>('todos');
  const [reportType, setReportType] = useState<ReportType>('classificados');
  const [reportData, setReportData] = useState<Candidate[]>([]);
  const [stats, setStats] = useState({
    classificados: 0,
    desclassificados: 0,
    entrevistaClassificados: 0,
    entrevistaDesclassificados: 0
  });

  useEffect(() => {
    loadAnalysts();
    loadStats();
  }, []);

  useEffect(() => {
    if (reportType) {
      loadReport();
    }
  }, [reportType, selectedAnalyst]);

  async function loadAnalysts() {
    try {
      const { googleSheetsService } = await import('../services/googleSheets');
      const result = await googleSheetsService.getAnalysts();

      if (result.success && Array.isArray(result.data)) {
        setAnalysts(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar analistas:', error);
    }
  }

  async function loadStats() {
    try {
      const { googleSheetsService } = await import('../services/googleSheets');
      const result = await googleSheetsService.getReportStats();

      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }

  async function loadReport() {
    try {
      setLoading(true);
      const { googleSheetsService } = await import('../services/googleSheets');

      const result = await googleSheetsService.getReport(
        reportType,
        selectedAnalyst === 'todos' ? undefined : selectedAnalyst
      );

      if (result.success && Array.isArray(result.data)) {
        setReportData(result.data);
      } else {
        setReportData([]);
      }
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  }

  function exportToCSV() {
    if (reportData.length === 0) {
      alert('Não há dados para exportar');
      return;
    }

    let headers: string[] = [];
    let rows: string[][] = [];

    switch (reportType) {
      case 'classificados':
      case 'entrevista_classificados':
        headers = ['Nome Completo', 'Nome Social', 'CPF', 'Telefone', 'Cargo Pretendido', 'PCD'];
        rows = reportData.map(c => [
          c.NOMECOMPLETO || '',
          c.NOMESOCIAL || '',
          c.CPF || '',
          c.TELEFONE || '',
          c.CARGOPRETENDIDO || '',
          c.VAGAPCD || ''
        ]);
        break;

      case 'desclassificados':
        headers = ['Nome Completo', 'Nome Social', 'CPF', 'Telefone', 'Cargo Pretendido', 'Motivo Desclassificação', 'PCD'];
        rows = reportData.map(c => [
          c.NOMECOMPLETO || '',
          c.NOMESOCIAL || '',
          c.CPF || '',
          c.TELEFONE || '',
          c.CARGOPRETENDIDO || '',
          c['Motivo Desclassificação'] || '',
          c.VAGAPCD || ''
        ]);
        break;

      case 'entrevista_desclassificados':
        headers = ['Nome Completo', 'Nome Social', 'CPF', 'Telefone', 'Cargo Pretendido', 'Pontuação', 'PCD'];
        rows = reportData.map(c => [
          c.NOMECOMPLETO || '',
          c.NOMESOCIAL || '',
          c.CPF || '',
          c.TELEFONE || '',
          c.CARGOPRETENDIDO || '',
          c.interview_score?.toString() || '',
          c.VAGAPCD || ''
        ]);
        break;
    }

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function getReportTitle(): string {
    switch (reportType) {
      case 'classificados':
        return 'Candidatos Classificados - Triagem';
      case 'desclassificados':
        return 'Candidatos Desclassificados - Triagem';
      case 'entrevista_classificados':
        return 'Candidatos Classificados - Entrevista';
      case 'entrevista_desclassificados':
        return 'Candidatos Desclassificados - Entrevista';
      default:
        return 'Relatório';
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Relatórios</h2>
            <p className="text-sm text-gray-600 mt-1">Visualize e exporte relatórios do processo seletivo</p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Fechar
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-800">Classificados</div>
                <div className="text-2xl font-bold text-blue-800">{stats.classificados}</div>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-red-800">Desclassificados</div>
                <div className="text-2xl font-bold text-red-800">{stats.desclassificados}</div>
              </div>
              <UserX className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-800">Aprovados Entrevista</div>
                <div className="text-2xl font-bold text-green-800">{stats.entrevistaClassificados}</div>
              </div>
              <ClipboardCheck className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-orange-800">Reprovados Entrevista</div>
                <div className="text-2xl font-bold text-orange-800">{stats.entrevistaDesclassificados}</div>
              </div>
              <UserX className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>

          <div className="flex-1 flex items-center gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Tipo de Relatório</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="classificados">Classificados - Triagem</option>
                <option value="desclassificados">Desclassificados - Triagem</option>
                <option value="entrevista_classificados">Classificados - Entrevista</option>
                <option value="entrevista_desclassificados">Desclassificados - Entrevista</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Analista</label>
              <select
                value={selectedAnalyst}
                onChange={(e) => setSelectedAnalyst(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos os Analistas</option>
                {analysts.map((analyst) => (
                  <option key={analyst.id} value={analyst.email}>
                    {analyst.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={exportToCSV}
              disabled={reportData.length === 0}
              className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : reportData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <FileText className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhum dado encontrado para este relatório</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">{getReportTitle()}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {reportData.length} {reportData.length === 1 ? 'registro encontrado' : 'registros encontrados'}
                {selectedAnalyst !== 'todos' && ` - Analista: ${analysts.find(a => a.email === selectedAnalyst)?.name}`}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Nome Completo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Nome Social
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      CPF
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Telefone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Cargo Pretendido
                    </th>
                    {reportType === 'desclassificados' && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Motivo Desclassificação
                      </th>
                    )}
                    {(reportType === 'entrevista_classificados' || reportType === 'entrevista_desclassificados') && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Pontuação
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      PCD
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.map((candidate, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                        {candidate.NOMECOMPLETO || 'Não informado'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {candidate.NOMESOCIAL || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                        {candidate.CPF || 'Não informado'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {candidate.TELEFONE || 'Não informado'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {candidate.CARGOPRETENDIDO || 'Não informado'}
                      </td>
                      {reportType === 'desclassificados' && (
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {candidate['Motivo Desclassificação'] || 'Não informado'}
                        </td>
                      )}
                      {(reportType === 'entrevista_classificados' || reportType === 'entrevista_desclassificados') && (
                        <td className="px-4 py-3 text-sm font-semibold">
                          <span className={
                            Number(candidate.interview_score) >= 80
                              ? 'text-green-700'
                              : Number(candidate.interview_score) >= 60
                              ? 'text-yellow-700'
                              : 'text-red-700'
                          }>
                            {candidate.interview_score || 0}/120
                          </span>
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm">
                        {candidate.VAGAPCD === 'Sim' ? (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            Sim
                          </span>
                        ) : (
                          <span className="text-gray-400">Não</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
