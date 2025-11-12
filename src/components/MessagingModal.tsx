import { useState, useEffect } from 'react';
import { X, Mail, MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface MessageTemplate {
  id: string;
  template_name: string;
  message_type: 'sms' | 'email';
  subject?: string;
  content: string;
}

interface Candidate {
  id: string;
  full_name?: string;
  nome_completo?: string;
  nome_social?: string;
  email?: string;
  telefone?: string;
  cargo_administrativo?: string | boolean;
  cargo_assistencial?: string | boolean;
  area_atuacao_pretendida?: string;
}

interface MessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: Candidate[];
  onMessagesSent: () => void;
}

export default function MessagingModal({
  isOpen,
  onClose,
  candidates,
  onMessagesSent
}: MessagingModalProps) {
  const { user } = useAuth();
  const [messageType, setMessageType] = useState<'email' | 'sms'>('email');
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen, messageType]);

  async function loadTemplates() {
    try {
      setLoadingTemplates(true);
      const { googleSheetsService } = await import('../services/googleSheets');
      const result = await googleSheetsService.getMessageTemplates(messageType);

      if (!result.success) {
        throw new Error(result.error || 'Erro ao carregar templates');
      }

      setTemplates(result.data || []);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  }

  function handleTemplateSelect(templateId: string) {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject || '');
      setContent(template.content || '');
    }
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
    return 'Cargo não especificado';
  }

  function personalizeMessage(template: string, candidate: Candidate) {
    return template
      .replace(/\[NOME\]/g, candidate.nome_completo || candidate.full_name || 'Candidato')
      .replace(/\[CARGO\]/g, getCargo(candidate))
      .replace(/\[AREA\]/g, candidate.area_atuacao_pretendida || 'área de interesse');
  }

  async function handleSend() {
    if (!content.trim()) {
      alert('Por favor, preencha o conteúdo da mensagem');
      return;
    }

    if (messageType === 'email' && !subject.trim()) {
      alert('Por favor, preencha o assunto do email');
      return;
    }

    try {
      setLoading(true);
      const { googleSheetsService } = await import('../services/googleSheets');

      // Coletar IDs dos candidatos
      const candidateIds = candidates.map(c => c.id).join(',');

      console.log('📤 Enviando mensagens via Google Apps Script...');
      console.log('  Tipo:', messageType);
      console.log('  Candidatos:', candidates.length);

      const result = await googleSheetsService.sendMessages(
        messageType,
        subject,
        content,
        candidateIds,
        user?.email || 'admin'
      );

      if (!result.success) {
        throw new Error(result.error || 'Erro ao enviar mensagens');
      }

      const data = result.data;
      const successCount = data.successCount || 0;
      const failCount = data.failCount || 0;
      const results = data.results || [];

      console.log('✅ Sucesso:', successCount);
      console.log('❌ Falhas:', failCount);

      let message = `${successCount} mensagem(ns) enviada(s) com sucesso`;

      if (failCount > 0) {
        const errors = results
          .filter((r: any) => !r.success)
          .map((r: any) => `${r.candidateName}: ${r.error}`)
          .join('\n');
        message += `\n\n${failCount} falha(s):\n${errors}`;
      }

      alert(message);

      if (successCount > 0) {
        onMessagesSent();
        handleClose();
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagens:', error);
      alert(`Erro ao enviar mensagens: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setMessageType('email');
    setSelectedTemplate('');
    setSubject('');
    setContent('');
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Enviar Mensagens
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Enviando para {candidates.length} candidato(s) selecionado(s)
            </p>
            <div className="flex gap-2 flex-wrap">
              {candidates.slice(0, 5).map((candidate) => (
                <span
                  key={candidate.id}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {candidate.nome_completo || candidate.full_name}
                </span>
              ))}
              {candidates.length > 5 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  +{candidates.length - 5} mais
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Mensagem
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="messageType"
                  value="email"
                  checked={messageType === 'email'}
                  onChange={(e) => setMessageType(e.target.value as 'email' | 'sms')}
                  className="text-blue-600"
                />
                <Mail className="w-4 h-4" />
                <span className="text-sm">Email</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="messageType"
                  value="sms"
                  checked={messageType === 'sms'}
                  onChange={(e) => setMessageType(e.target.value as 'email' | 'sms')}
                  className="text-blue-600"
                />
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">SMS</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template de Mensagem
            </label>
            {loadingTemplates ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando templates...
              </div>
            ) : (
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione um template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.template_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {messageType === 'email' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assunto *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite o assunto do email"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conteúdo da Mensagem *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite a mensagem..."
            />
            <p className="text-xs text-gray-500 mt-2">
              Você pode usar as variáveis: [NOME], [CARGO], [AREA]
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={loading || !content.trim() || (messageType === 'email' && !subject.trim())}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                {messageType === 'email' ? <Mail className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                Enviar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
