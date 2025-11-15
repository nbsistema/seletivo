const PROXY_URL = '/.netlify/functions/google-sheets-proxy';

class GoogleSheetsProxyService {
  constructor() {
    this.baseUrl = PROXY_URL;
  }

  async request(action, data = {}) {
    try {
      console.log(`🔍 [Proxy] Enviando ação: ${action}`, data);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          ...data
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      console.log(`✅ [Proxy] Resposta para ${action}:`, result);
      
      return result;

    } catch (error) {
      console.error(`❌ [Proxy] Erro na ação ${action}:`, error);
      throw new Error(`Falha na comunicação: ${error.message}`);
    }
  }

  // ============================================
  // FUNÇÕES DE USUÁRIOS
  // ============================================

  async getUserRole(email, password = null) {
    const params = { email };
    if (password) params.password = password;
    return this.request('getUserRole', params);
  }

  async getAllUsers() {
    return this.request('getAllUsers');
  }

  async getAnalysts() {
    return this.request('getAnalysts');
  }

  async getInterviewers() {
    return this.request('getInterviewers');
  }

  async createUser(userData) {
    return this.request('createUser', userData);
  }

  async updateUser(userData) {
    return this.request('updateUser', userData);
  }

  async deleteUser(email) {
    return this.request('deleteUser', { email });
  }

  // ============================================
  // FUNÇÕES DE CANDIDATOS
  // ============================================

  async getCandidates() {
    return this.request('getCandidates');
  }

  async getCandidate(id) {
    return this.request('getCandidate', { 
      registration_number: id,
      id: id,
      CPF: id 
    });
  }

  async addCandidate(candidateData) {
    return this.request('addCandidate', candidateData);
  }

  async updateCandidate(candidateData) {
    return this.request('updateCandidate', candidateData);
  }

  async deleteCandidate(id) {
    return this.request('deleteCandidate', {
      registration_number: id,
      CPF: id
    });
  }

  async assignCandidates(candidateIds, analystEmail, adminEmail = null) {
    return this.request('assignCandidates', {
      candidateIds: Array.isArray(candidateIds) ? candidateIds.join(',') : candidateIds,
      analystEmail,
      adminEmail
    });
  }

  async bulkUpdateCandidates(updates) {
    return this.request('bulkUpdateCandidates', { updates });
  }

  async updateCandidateStatus(statusData) {
    return this.request('updateCandidateStatus', statusData);
  }

  async getCandidatesByStatus(status) {
    return this.request('getCandidatesByStatus', { status });
  }

  async saveScreening(screeningData) {
    return this.request('saveScreening', screeningData);
  }

  // ============================================
  // FUNÇÕES DE ENTREVISTA
  // ============================================

  async moveToInterview(candidateIds) {
    return this.request('moveToInterview', {
      candidateIds: Array.isArray(candidateIds) ? candidateIds.join(',') : candidateIds
    });
  }

  async getInterviewCandidates() {
    return this.request('getInterviewCandidates');
  }

  async allocateToInterviewer(candidateIds, interviewerEmail, adminEmail = null) {
    return this.request('allocateToInterviewer', {
      candidateIds: Array.isArray(candidateIds) ? candidateIds.join(',') : candidateIds,
      interviewerEmail,
      adminEmail
    });
  }

  async getInterviewerCandidates(interviewerEmail) {
    return this.request('getInterviewerCandidates', { interviewerEmail });
  }

  async saveInterviewEvaluation(evaluationData) {
    return this.request('saveInterviewEvaluation', evaluationData);
  }

  // ============================================
  // FUNÇÕES DE MENSAGENS E TEMPLATES
  // ============================================

  async sendMessages(messageData) {
    return this.request('sendMessages', messageData);
  }

  async logMessage(messageData) {
    return this.request('logMessage', messageData);
  }

  async updateMessageStatus(statusData) {
    return this.request('updateMessageStatus', statusData);
  }

  async getMessageTemplates() {
    return this.request('getMessageTemplates');
  }

  async getEmailAliases() {
    return this.request('getEmailAliases');
  }

  // ============================================
  // FUNÇÕES DE RELATÓRIOS E ESTATÍSTICAS
  // ============================================

  async getStatistics() {
    return this.request('getStatistics');
  }

  async getReportStats() {
    return this.request('getReportStats');
  }

  async getReport(reportType) {
    return this.request('getReport', { reportType });
  }

  // ============================================
  // FUNÇÕES DE MOTIVOS
  // ============================================

  async getDisqualificationReasons() {
    return this.request('getDisqualificationReasons');
  }

  // ============================================
  // FUNÇÃO DE TESTE
  // ============================================

  async testConnection() {
    return this.request('testConnection');
  }
}

// Exportar instância única
export default new GoogleSheetsProxyService();
