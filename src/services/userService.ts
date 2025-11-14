import { User } from '../contexts/AuthContext';

export interface AssignmentRequest {
  candidateIds: string[];
  analystId: string;
  adminId: string;
}

// Serviço para comunicação com Google Sheets
class GoogleSheetsService {
  private scriptUrl: string;

  constructor(scriptUrl: string) {
    this.scriptUrl = scriptUrl;
  }

  async fetchData(action: string, data?: any): Promise<any> {
    try {
      if (!this.scriptUrl) {
        throw new Error('URL do Google Script não configurada. Verifique o arquivo .env');
      }

      const url = new URL(this.scriptUrl);
      url.searchParams.append('action', action);

      if (data) {
        Object.keys(data).forEach(key => {
          url.searchParams.append(key, String(data[key]));
        });
      }

      console.log('🔄 [UserService] Chamando Google Apps Script:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        mode: 'cors',
        redirect: 'follow',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('📡 [UserService] Resposta recebida - Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [UserService] Erro na resposta:', errorText);
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ [UserService] Dados recebidos:', result);
      return result;
    } catch (error) {
      console.error('❌ [UserService] Erro na comunicação com Google Apps Script:', error);
      console.error('🔍 URL configurada:', this.scriptUrl);
      console.error('🔍 Action:', action);
      console.error('🔍 Data:', data);
      throw error;
    }
  }
}

const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwRZ7vLEm4n8iha2GJSnIfCEjhHejRLme-OkIkp_qu6/dev';
const sheetsService = new GoogleSheetsService(SCRIPT_URL);

export async function getUsers(): Promise<User[]> {
  try {
    const result = await sheetsService.fetchData('getAllUsers');
    if (result && result.users) {
      return result.users.map((user: any) => ({
        id: user.Email || user.id,
        email: user.Email || user.email,
        name: user.Nome || user.name,
        role: user.Role || user.role,
        active: user.Ativo !== undefined ? user.Ativo : user.active,
        password: user.Password || user.password
      }));
    }
    return [];
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  }
}

export async function getAnalysts(): Promise<User[]> {
  try {
    console.log('🔍 Buscando analistas...');
    const result = await sheetsService.fetchData('getAnalysts');
    console.log('📥 Resultado completo de getAnalysts:', result);

    // CORREÇÃO: Verificar múltiplas estruturas possíveis
    let analysts = [];
    
    if (result.success && result.data && Array.isArray(result.data.analysts)) {
      // Estrutura: { success: true, data: { analysts: [...] } }
      analysts = result.data.analysts;
    } else if (result.success && Array.isArray(result.analysts)) {
      // Estrutura: { success: true, analysts: [...] }
      analysts = result.analysts;
    } else if (Array.isArray(result.data)) {
      // Estrutura: { data: [...] }
      analysts = result.data;
    } else if (Array.isArray(result)) {
      // Estrutura: [...] (array direto)
      analysts = result;
    } else {
      console.warn('⚠️ Estrutura de dados inesperada:', result);
      analysts = [];
    }

    console.log('✅ Analistas extraídos:', analysts);
    console.log('📊 Total de analistas:', analysts.length);

    // Mapear para o formato User
    return analysts.map((analyst: any) => ({
      id: analyst.id || analyst.Email || analyst.email,
      email: analyst.Email || analyst.email,
      name: analyst.Nome || analyst.name || 'Nome não informado',
      role: analyst.Role || analyst.role || 'analyst',
      active: analyst.Ativo !== undefined ? analyst.Ativo : (analyst.active !== false)
    }));

  } catch (error) {
    console.error('❌ Erro ao buscar analistas:', error);
    // Retornar array vazio em caso de erro para não quebrar a UI
    return [];
  }
}

export async function createUser(user: Omit<User, 'id' | 'active'>): Promise<User> {
  try {
    return await sheetsService.fetchData('createUser', user);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  try {
    return await sheetsService.fetchData('updateUser', { id, updates });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
}

export async function deactivateUser(id: string): Promise<void> {
  try {
    await sheetsService.fetchData('deactivateUser', { id });
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    throw error;
  }
}

export async function assignCandidates(request: AssignmentRequest): Promise<void> {
  try {
    console.log('🔵 Alocando candidatos:', request);

    const result = await sheetsService.fetchData('assignCandidates', {
      candidateIds: request.candidateIds.join(','),
      analystEmail: request.analystId,
      adminEmail: request.adminId
    });

    console.log('✅ Alocação concluída:', result);

    if (result.error) {
      throw new Error(result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ Erro ao atribuir candidatos:', error);
    throw error;
  }
}

export async function unassignCandidates(candidateIds: string[]): Promise<void> {
  try {
    await sheetsService.fetchData('unassignCandidates', { candidateIds });
  } catch (error) {
    console.error('Erro ao remover atribuição de candidatos:', error);
    throw error;
  }
}
