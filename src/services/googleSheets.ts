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

      const response = await fetch(`${SCRIPT_URL}?${params.toString()}`);
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
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateCandidateStatus',
          registrationNumber,
          statusTriagem,
          ...options
        })
      });

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

      const response = await fetch(`${SCRIPT_URL}?${params.toString()}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar candidatos por status:', error);
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
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'logMessage',
          registrationNumber,
          messageType,
          recipient,
          subject,
          content,
          sentBy
        })
      });

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

      const response = await fetch(`${SCRIPT_URL}?${params.toString()}`);
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

      const response = await fetch(`${SCRIPT_URL}?${params.toString()}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar templates de mensagens:', error);
      return { success: false, error: 'Erro ao buscar templates de mensagens' };
    }
  }
};
