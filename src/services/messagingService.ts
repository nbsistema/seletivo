const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface EmailRequest {
  to: string;
  subject: string;
  content: string;
  candidateId: string;
  sentBy: string;
}

interface SMSRequest {
  to: string;
  content: string;
  candidateId: string;
  sentBy: string;
}

interface MessageResponse {
  success: boolean;
  message?: string;
  error?: string;
  messageId?: string;
  messageSid?: string;
}

export const messagingService = {
  async sendEmail(request: EmailRequest): Promise<MessageResponse> {
    try {
      const url = `${SUPABASE_URL}/functions/v1/send-email`;

      console.log('📧 Chamando Edge Function send-email:', url);
      console.log('📦 Request:', { ...request, content: request.content.substring(0, 50) + '...' });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Erro na resposta:', data);
        throw new Error(data.error || 'Erro ao enviar email');
      }

      console.log('✅ Email enviado com sucesso:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao enviar email',
      };
    }
  },

  async sendSMS(request: SMSRequest): Promise<MessageResponse> {
    try {
      const url = `${SUPABASE_URL}/functions/v1/send-sms`;

      console.log('📱 Chamando Edge Function send-sms:', url);
      console.log('📦 Request:', { ...request, content: request.content.substring(0, 50) + '...' });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Erro na resposta:', data);
        throw new Error(data.error || 'Erro ao enviar SMS');
      }

      console.log('✅ SMS enviado com sucesso:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao enviar SMS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao enviar SMS',
      };
    }
  },
};
