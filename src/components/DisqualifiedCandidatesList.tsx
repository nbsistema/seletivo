import { useState, useEffect } from 'react';
import { XCircle, Loader2 } from 'lucide-react';
import type { Candidate } from '../types/candidate';

export default function DisqualifiedCandidatesList() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    loadDisqualifiedCandidates();
  }, []);

  async function loadDisqualifiedCandidates() {
    try {
      setLoading(true);
      const { googleSheetsService } = await import('../services/googleSheets');

      console.log('🚀 Iniciando busca por candidatos desclassificados...');
      console.log('📡 Buscando status: "Desclassificado"');

      const result = await googleSheetsService.getCandidatesByStatus('Desclassificado');

      console.log('\n📊 RESULTADO COMPLETO DA API:');
      console.log('JSON:', JSON.stringify(result, null, 2));
      console.log('✅ result.success:', result.success);
      console.log('📦 result.data (tipo):', typeof result.data);
      console.log('📦 result.data (é array?):', Array.isArray(result.data));
      console.log('📦 result.data (conteúdo):', result.data);

      if (!result.success) {
        console.error('❌ Erro retornado:', result.error);
        alert(`Erro ao carregar candidatos: ${result.error}`);
        return;
      }

      let candidatesData: Candidate[] = [];

      // Tenta extrair os candidatos de diferentes formatos
      if (Array.isArray(result.data)) {
        console.log('✅ result.data é um array direto');
        candidatesData = result.data;
      } else if (result.data && typeof result.data === 'object') {
        console.log('⚠️ result.data é um objeto, tentando extrair candidatos...');

        // Tenta diferentes propriedades
        if (Array.isArray((result.data as any).candidates)) {
          console.log('✅ Encontrado em result.data.candidates');
          candidatesData = (result.data as any).candidates;
        } else if (Array.isArray((result.data as any).data)) {
          console.log('✅ Encontrado em result.data.data');
          candidatesData = (result.data as any).data;
        } else {
          console.log('📋 Propriedades disponíveis em result.data:', Object.keys(result.data));
        }
      } else {
        console.warn('⚠️ result.data não é array nem objeto:', result.data);
      }

      console.log('\n📋 CANDIDATOS EXTRAÍDOS:');
      console.log('Total:', candidatesData.length);
      console.log('Array completo:', candidatesData);

      if (candidatesData.length > 0) {
        console.log('\n👤 PRIMEIRO CANDIDATO:');
        console.log('JSON:', JSON.stringify(candidatesData[0], null, 2));
        console.log('🔑 Campos:', Object.keys(candidatesData[0]));
        console.log('📝 CPF:', candidatesData[0].CPF);
        console.log('📝 Nome:', candidatesData[0].NOMECOMPLETO);
        console.log('📝 Status:', (candidatesData[0] as any).Status);
      } else {
        console.warn('⚠️ Nenhum candidato desclassificado encontrado!');
        console.warn('💡 Verifique se existem candidatos com Status = "Desclassificado" na planilha');
      }

      setCandidates(candidatesData);
    } catch (error) {
      console.error('❌ ERRO ao carregar candidatos desclassificados:', error);
      console.error('Stack:', error instanceof Error ? error.stack : 'N/A');
      alert(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  }

  function getMotivo(candidate: Candidate): string {
    const candidateAny = candidate as any;

    // Lista COMPLETA de campos possíveis para o motivo
    const possibleFields = [
      'Motivo Desclassificação',
      'MOTIVO DESCLASSIFICAÇÃO',
      'Motivo Desclassificacao',
      'MOTIVO DESCLASSIFICACAO',
      'MotivoDesclassificacao',
      'Motivo',
      'MOTIVO',
      'motivo_desclassificacao',
      'motivo',
      'disqualification_reason',
      'reason'
    ];

    console.log('🔍 Buscando motivo para candidato:', candidate.CPF);
    console.log('📦 Todos os campos do candidato:', Object.keys(candidateAny));

    // Tentar cada campo possível
    for (const field of possibleFields) {
      const value = candidateAny[field];

      if (value) {
        console.log(`✅ Campo "${field}" encontrado:`, value);

        // Se for string e não vazia
        if (typeof value === 'string' && value.trim()) {
          return value.trim();
        }

        // Se for objeto com propriedade reason
        if (value && typeof value === 'object' && value.reason) {
          return value.reason;
        }
      }
    }

    console.warn('⚠️ Nenhum campo de motivo encontrado para', candidate.CPF);
    return 'Não informado';
  }

  function getObservacoes(candidate: Candidate): string | undefined {
    const candidateAny = candidate as any;
    return (
      candidateAny['Observações'] ||
      candidateAny['OBSERVAÇÕES'] ||
      candidateAny['Observacoes'] ||
      candidateAny['OBSERVACOES'] ||
      candidateAny.observacoes ||
      candidateAny.screening_notes ||
      candidateAny.notes
    );
  }

  function getDataTriagem(candidate: Candidate): string | undefined {
    const candidateAny = candidate as any;
    return (
      candidateAny['Data Triagem'] ||
      candidateAny['DATA TRIAGEM'] ||
      candidateAny['DataTriagem'] ||
      candidateAny.data_hora_triagem ||
      candidateAny.screened_at
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <XCircle className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500">Nenhum candidato desclassificado ainda</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Candidatos Desclassificados</h2>
        <p className="text-sm text-gray-600 mt-1">
          {candidates.length} candidato(s) desclassificado(s)
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Nome Completo
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Área
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Cargo Pretendido
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Motivo
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Data
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {candidates.map((candidate) => {
              const dataTriagem = getDataTriagem(candidate);
              const motivo = getMotivo(candidate);

              return (
                <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                    {candidate.NOMECOMPLETO || 'Não informado'}
                    {candidate.NOMESOCIAL && (
                      <div className="text-xs text-gray-500">
                        ({candidate.NOMESOCIAL})
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {candidate.AREAATUACAO || 'Não informado'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {candidate.CARGOPRETENDIDO || 'Não informado'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {motivo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {dataTriagem
                      ? new Date(dataTriagem).toLocaleDateString('pt-BR')
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedCandidate(candidate)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Detalhes da Desclassificação</h3>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Nome Completo</p>
                <p className="text-lg font-semibold text-gray-800">
                  {selectedCandidate.NOMECOMPLETO || 'Não informado'}
                </p>
              </div>

              {selectedCandidate.NOMESOCIAL && (
                <div>
                  <p className="text-sm text-gray-600">Nome Social</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {selectedCandidate.NOMESOCIAL}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">CPF</p>
                <p className="text-lg font-mono text-gray-800">
                  {selectedCandidate.CPF || 'Não informado'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Área de Atuação</p>
                <p className="text-lg text-gray-800">
                  {selectedCandidate.AREAATUACAO || 'Não informado'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Cargo Pretendido</p>
                <p className="text-lg text-gray-800">
                  {selectedCandidate.CARGOPRETENDIDO || 'Não informado'}
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">Motivo da Desclassificação</p>
                <p className="text-lg text-red-600 font-semibold">
                  {getMotivo(selectedCandidate)}
                </p>
              </div>

              {getObservacoes(selectedCandidate) && (
                <div>
                  <p className="text-sm text-gray-600">Observações</p>
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {getObservacoes(selectedCandidate)}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Data da Desclassificação</p>
                <p className="text-gray-800">
                  {getDataTriagem(selectedCandidate)
                    ? new Date(getDataTriagem(selectedCandidate)!).toLocaleString('pt-BR')
                    : 'Não informado'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
