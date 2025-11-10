import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, Mail, MessageSquare, Loader2 } from 'lucide-react';
import MessagingModal from './MessagingModal';

interface Candidate {
  id: string;
  full_name?: string;
  social_name?: string;
  nome_completo?: string;
  nome_social?: string;
  cpf?: string;
  cpf_numero?: string;
  email?: string;
  telefone?: string;
  desired_area?: string;
  area_atuacao_pretendida?: string;
  desired_position_admin?: boolean;
  desired_position_assistant?: boolean;
  cargo_administrativo?: string | boolean;
  cargo_assistencial?: string | boolean;
  screened_at?: string;
  screened_by?: string;
}

export default function ClassifiedCandidatesList() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showMessagingModal, setShowMessagingModal] = useState(false);

  useEffect(() => {
    loadClassifiedCandidates();
  }, []);

  async function loadClassifiedCandidates() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('status_triagem', 'Classificado')
        .order('screened_at', { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (error) {
      console.error('Erro ao carregar candidatos classificados:', error);
    } finally {
      setLoading(false);
    }
  }

  function toggleCandidate(id: string) {
    const newSelected = new Set(selectedCandidates);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCandidates(newSelected);
  }

  function toggleAll() {
    if (selectedCandidates.size === candidates.length) {
      setSelectedCandidates(new Set());
    } else {
      setSelectedCandidates(new Set(candidates.map(c => c.id)));
    }
  }

  function getSelectedCandidatesData() {
    return candidates.filter(c => selectedCandidates.has(c.id));
  }

  function getCargo(candidate: Candidate) {
    if (candidate.cargo_administrativo && candidate.cargo_administrativo !== 'false') {
      return typeof candidate.cargo_administrativo === 'string'
        ? candidate.cargo_administrativo
        : 'Administrativo';
    }
    if (candidate.cargo_assistencial && candidate.cargo_assistencial !== 'false') {
      return typeof candidate.cargo_assistencial === 'string'
        ? candidate.cargo_assistencial
        : 'Assistencial';
    }
    return 'Não informado';
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
        <CheckCircle className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500">Nenhum candidato classificado ainda</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Candidatos Classificados</h2>
          <p className="text-sm text-gray-600 mt-1">
            {selectedCandidates.size > 0
              ? `${selectedCandidates.size} candidato(s) selecionado(s)`
              : `${candidates.length} candidato(s) classificado(s)`}
          </p>
        </div>

        {selectedCandidates.size > 0 && (
          <button
            onClick={() => setShowMessagingModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Enviar Mensagens
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedCandidates.size === candidates.length && candidates.length > 0}
                  onChange={toggleAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Nome Completo
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Nome Social
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Área
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Cargo Pretendido
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                CPF
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Telefone
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {candidates.map((candidate) => (
              <tr
                key={candidate.id}
                className={`hover:bg-gray-50 transition-colors ${
                  selectedCandidates.has(candidate.id) ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedCandidates.has(candidate.id)}
                    onChange={() => toggleCandidate(candidate.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                  {candidate.nome_completo || candidate.full_name || 'Não informado'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {candidate.nome_social || candidate.social_name || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {candidate.area_atuacao_pretendida || candidate.desired_area || 'Não informado'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {getCargo(candidate)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                  {candidate.cpf_numero || candidate.cpf || 'Não informado'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {candidate.email ? (
                    <a href={`mailto:${candidate.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {candidate.email}
                    </a>
                  ) : (
                    'Não informado'
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {candidate.telefone || 'Não informado'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MessagingModal
        isOpen={showMessagingModal}
        onClose={() => setShowMessagingModal(false)}
        candidates={getSelectedCandidatesData()}
        onMessagesSent={() => {
          setSelectedCandidates(new Set());
          setShowMessagingModal(false);
        }}
      />
    </div>
  );
}
