const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbz6BmO1rhI8LTRNzakiQ8ryL1cO2tAaNSFfWx9fh0ZFHqZ0b2FgW4WJxg19B8VC5WkH/exec';

interface GoogleSheetsResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export const googleSheetsService = {
  async getCandidates(filters?: any): Promise<GoogleSheetsResponse> {
    try {
      const params = new URLSearchParams({
        action: 'getCandidates',
        ...filters
      });

      const response = await fetch(`${SCRIPT_URL}?${params.toString()}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
      return { success: false, error: 'Erro ao buscar candidatos' };
    }
  },

  async updateCandidateStatus(
    registrationNumber: string,
    statusTriagem: 'Classificado' | 'Desclassificado' | 'Revisar',
    options?: {
      reasonId?: string;
      notes?: string;
      analystEmail?: string;
    }
  ): Promise<GoogleSheetsResponse> {
    try {
      const params = new URLSearchParams({
        action: 'updateCandidateStatus',
        registrationNumber,
        statusTriagem,
        ...(options?.reasonId && { reasonId: options.reasonId }),
        ...(options?.notes && { notes: options.notes }),
        ...(options?.analystEmail && { analystEmail: options.analystEmail })
      });

      const response = await fetch(`${SCRIPT_URL}?${params.toString()}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return { success: false, error: 'Erro ao atualizar status' };
    }
  },

  async getCandidatesByStatus(status: 'Classificado' | 'Desclassificado' | 'Revisar'): Promise<GoogleSheetsResponse> {
    try {
      const params = new URLSearchParams({
        action: 'getCandidatesByStatus',
        status
      });

      const url = `${SCRIPT_URL}?${params.toString()}`;
      console.log('🔗 getCandidatesByStatus - URL:', url);
      console.log('📊 Status buscado:', status);

      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Dados recebidos:', data);
      console.log('✅ success:', data.success);
      console.log('📋 data.data:', data.data);

      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar candidatos por status:', error);
      return { success: false, error: 'Erro ao buscar candidatos por status' };
    }
  },

  async logMessage(
    registrationNumber: string,
    messageType: 'email' | 'sms',
    recipient: string,
    subject: string | null,
    content: string,
    sentBy: string
  ): Promise<GoogleSheetsResponse> {
    try {
      const params = new URLSearchParams({
        action: 'logMessage',
        registrationNumber,
        messageType,
        recipient,
        ...(subject && { subject }),
        content,
        sentBy
      });

      const response = await fetch(`${SCRIPT_URL}?${params.toString()}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao registrar mensagem:', error);
      return { success: false, error: 'Erro ao registrar mensagem' };
    }
  },

  async getDisqualificationReasons(): Promise<GoogleSheetsResponse> {
    try {
      const params = new URLSearchParams({
        action: 'getDisqualificationReasons'
      });

      const response = await fetch(`${SCRIPT_URL}?${params.toString()}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar motivos de desclassificação:', error);
      return { success: false, error: 'Erro ao buscar motivos de desclassificação' };
    }
  },

  async getMessageTemplates(messageType?: 'email' | 'sms'): Promise<GoogleSheetsResponse> {
    try {
      const params = new URLSearchParams({
        action: 'getMessageTemplates',
        ...(messageType && { messageType })
      });

      const response = await fetch(`${SCRIPT_URL}?${params.toString()}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar templates de mensagens:', error);
      return { success: false, error: 'Erro ao buscar templates de mensagens' };
    }
  },

  async sendMessages(
    messageType: 'email' | 'sms',
    subject: string,
    content: string,
    candidateIds: string,
    sentBy: string
  ): Promise<GoogleSheetsResponse> {
    try {
      console.log('📤 Enviando requisição para Google Apps Script');
      console.log('  Tipo:', messageType);
      console.log('  IDs:', candidateIds);

      const payload = {
        action: 'sendMessages',
        messageType,
        subject,
        content,
        candidateIds,
        sentBy
      };

      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Resposta recebida:', data);

      return data;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagens:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao enviar mensagens'
      };
    }
  }
};
