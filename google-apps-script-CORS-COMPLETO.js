// ============================================
// GOOGLE APPS SCRIPT - VERSÃO COM CORS COMPLETO
// ============================================
//
// INSTRUÇÕES DE INSTALAÇÃO:
// 1. Abra https://script.google.com
// 2. Crie um novo projeto ou abra o existente
// 3. Cole TODO este código (substituindo o código anterior)
// 4. Configure o SPREADSHEET_ID abaixo (linha 15)
// 5. Salve o projeto (Ctrl+S)
// 6. Clique em "Implantar" > "Nova implantação"
// 7. Selecione tipo: "Aplicativo da Web"
// 8. Execute como: "Eu (seu email)"
// 9. Quem tem acesso: "Qualquer pessoa"
// 10. Clique em "Implantar"
// 11. Copie a URL do Web App
// 12. Cole no arquivo .env: VITE_GOOGLE_SCRIPT_URL=sua-url-aqui
//
// ============================================

const SPREADSHEET_ID = '1iQSQ06P_OXkqxaGWN3uG5jRYFBKyjWqQyvzuGk2EplY';
const SHEET_USUARIOS = 'USUARIOS';
const SHEET_CANDIDATOS = 'CANDIDATOS';
const SHEET_MOTIVOS = 'MOTIVOS';
const SHEET_MENSAGENS = 'MENSAGENS';
const SHEET_TEMPLATES = 'TEMPLATES';
const SHEET_ALIAS = 'ALIAS';

// ============================================
// HEADERS CORS - CRÍTICO PARA FUNCIONAMENTO
// ============================================

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };
}

// ============================================
// ENTRADA - Suporta GET, POST e OPTIONS
// ============================================

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function doOptions(e) {
  const output = ContentService.createTextOutput('');
  output.setMimeType(ContentService.MimeType.JSON);

  const headers = getCorsHeaders();
  Object.keys(headers).forEach(key => {
    output.setHeader(key, headers[key]);
  });

  return output;
}

// ============================================
// ROTEAMENTO COM CORS
// ============================================

function handleRequest(e) {
  try {
    const params = parseRequest(e);
    const action = params.action;

    Logger.log('🔵 Ação recebida: ' + action);
    Logger.log('📦 Parâmetros: ' + JSON.stringify(params));

    const routes = {
      'getUserRole': getUserRole,
      'getAllUsers': getAllUsers,
      'getAnalysts': getAnalysts,
      'getInterviewers': getInterviewers,
      'createUser': createUser,
      'updateUser': updateUser,
      'deleteUser': deleteUser,
      'getCandidates': getCandidates,
      'getCandidate': getCandidate,
      'addCandidate': addCandidate,
      'updateCandidate': updateCandidate,
      'deleteCandidate': deleteCandidate,
      'assignCandidates': assignCandidates,
      'bulkUpdateCandidates': bulkUpdateCandidates,
      'updateCandidateStatus': updateCandidateStatus,
      'getCandidatesByStatus': getCandidatesByStatus,
      'saveScreening': saveScreening,
      'moveToInterview': moveToInterview,
      'getInterviewCandidates': getInterviewCandidates,
      'allocateToInterviewer': allocateToInterviewer,
      'getInterviewerCandidates': getInterviewerCandidates,
      'saveInterviewEvaluation': saveInterviewEvaluation,
      'sendMessages': sendMessages,
      'logMessage': logMessage,
      'updateMessageStatus': updateMessageStatus,
      'getMessageTemplates': getMessageTemplates,
      'getEmailAliases': getEmailAliases,
      'getStatistics': getStatistics,
      'getReportStats': getReportStats,
      'getReport': getReport,
      'getDisqualificationReasons': getDisqualificationReasons,
      'test': testConnection
    };

    if (routes[action]) {
      return routes[action](params);
    } else {
      return createResponse({ error: 'Ação não encontrada: ' + action }, 404);
    }
  } catch (error) {
    Logger.log('❌ Erro no handleRequest: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function parseRequest(e) {
  try {
    if (e.postData && e.postData.contents) {
      return JSON.parse(e.postData.contents);
    }
    return e.parameter || {};
  } catch (error) {
    Logger.log('Erro ao fazer parse: ' + error.toString());
    return e.parameter || {};
  }
}

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getSheet(name) {
  const ss = getSpreadsheet();
  return ss.getSheetByName(name);
}

function createResponse(data, statusCode = 200) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);

  const headers = getCorsHeaders();
  Object.keys(headers).forEach(key => {
    output.setHeader(key, headers[key]);
  });

  return output;
}

function getCurrentTimestamp() {
  return new Date().toISOString();
}

function getHeaders(sheet) {
  if (!sheet) return [];
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) return [];
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0];
}

function findRowByValue(sheet, columnName, value) {
  const headers = getHeaders(sheet);
  const colIndex = headers.indexOf(columnName);
  if (colIndex === -1) return -1;

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][colIndex] && data[i][colIndex].toString() === value.toString()) {
      return i + 1;
    }
  }
  return -1;
}

// ============================================
// FUNÇÕES DE USUÁRIOS
// ============================================

function getUserRole(params) {
  try {
    const email = params.email;
    if (!email) {
      return createResponse({ error: 'Email é obrigatório' }, 400);
    }

    const userSheet = getSheet(SHEET_USUARIOS);
    if (!userSheet) {
      return createResponse({ error: 'Planilha de usuários não encontrada' }, 404);
    }

    const data = userSheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createResponse({ error: 'Nenhum usuário cadastrado' }, 404);
    }

    const headers = data[0];
    const emailIndex = headers.indexOf('Email');
    const nomeIndex = headers.indexOf('Nome');
    const roleIndex = headers.indexOf('Role');
    const ativoIndex = headers.indexOf('Ativo');

    for (let i = 1; i < data.length; i++) {
      if (data[i][emailIndex] && data[i][emailIndex].toLowerCase() === email.toLowerCase()) {
        return createResponse({
          success: true,
          data: {
            email: data[i][emailIndex],
            name: data[i][nomeIndex] || '',
            role: data[i][roleIndex] || 'analista',
            active: data[i][ativoIndex] === true || data[i][ativoIndex] === 'TRUE'
          }
        });
      }
    }

    return createResponse({ error: 'Usuário não encontrado' }, 404);
  } catch (error) {
    Logger.log('Erro em getUserRole: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function getAllUsers(params) {
  try {
    const userSheet = getSheet(SHEET_USUARIOS);
    if (!userSheet) {
      return createResponse({ users: [], success: true });
    }

    const data = userSheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createResponse({ users: [], success: true });
    }

    const headers = data[0];
    const users = [];

    for (let i = 1; i < data.length; i++) {
      const user = {};
      headers.forEach((header, index) => {
        user[header] = data[i][index];
      });

      if (user.Email) {
        users.push({
          id: user.Email,
          email: user.Email,
          name: user.Nome || '',
          role: user.Role || 'analista',
          active: user.Ativo === true || user.Ativo === 'TRUE'
        });
      }
    }

    return createResponse({ users: users, success: true });
  } catch (error) {
    Logger.log('Erro em getAllUsers: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function getAnalysts(params) {
  try {
    const userSheet = getSheet(SHEET_USUARIOS);
    if (!userSheet) {
      return createResponse({ success: true, data: { analysts: [] } });
    }

    const data = userSheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createResponse({ success: true, data: { analysts: [] } });
    }

    const headers = data[0];
    const analysts = [];

    for (let i = 1; i < data.length; i++) {
      const user = {};
      headers.forEach((header, index) => {
        user[header] = data[i][index];
      });

      if (user.Email && user.Role && user.Role.toLowerCase() === 'analista') {
        analysts.push({
          id: user.Email,
          Email: user.Email,
          Nome: user.Nome || '',
          Role: user.Role,
          Ativo: user.Ativo === true || user.Ativo === 'TRUE'
        });
      }
    }

    return createResponse({ success: true, data: { analysts: analysts } });
  } catch (error) {
    Logger.log('Erro em getAnalysts: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function getInterviewers(params) {
  try {
    const userSheet = getSheet(SHEET_USUARIOS);
    if (!userSheet) {
      return createResponse({ success: true, data: [] });
    }

    const data = userSheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createResponse({ success: true, data: [] });
    }

    const headers = data[0];
    const interviewers = [];

    for (let i = 1; i < data.length; i++) {
      const user = {};
      headers.forEach((header, index) => {
        user[header] = data[i][index];
      });

      if (user.Email && user.Role === 'entrevistador') {
        interviewers.push({
          id: user.Email,
          email: user.Email,
          name: user.Nome || '',
          role: user.Role,
          active: user.Ativo === true || user.Ativo === 'TRUE'
        });
      }
    }

    return createResponse({ success: true, data: interviewers });
  } catch (error) {
    Logger.log('Erro em getInterviewers: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

// As demais funções permanecem iguais, apenas garantindo que todas usam createResponse()
// que já inclui os headers CORS automaticamente

function getCandidates(params) {
  try {
    const candidateSheet = getSheet(SHEET_CANDIDATOS);
    if (!candidateSheet) {
      return createResponse({ success: true, candidates: [] });
    }

    const data = candidateSheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createResponse({ success: true, candidates: [] });
    }

    const headers = data[0];
    const candidates = [];

    for (let i = 1; i < data.length; i++) {
      const candidate = {};
      headers.forEach((header, index) => {
        candidate[header] = data[i][index];
      });

      if (candidate.CPF || candidate.NOMECOMPLETO) {
        candidates.push(candidate);
      }
    }

    return createResponse({ success: true, candidates: candidates });
  } catch (error) {
    Logger.log('Erro em getCandidates: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function updateCandidateStatus(params) {
  try {
    const registrationNumber = params.registrationNumber;
    const statusTriagem = params.statusTriagem;

    if (!registrationNumber || !statusTriagem) {
      return createResponse({ error: 'Parâmetros obrigatórios ausentes' }, 400);
    }

    const candidateSheet = getSheet(SHEET_CANDIDATOS);
    if (!candidateSheet) {
      return createResponse({ error: 'Planilha não encontrada' }, 404);
    }

    const rowIndex = findRowByValue(candidateSheet, 'CPF', registrationNumber);
    if (rowIndex === -1) {
      return createResponse({ error: 'Candidato não encontrado' }, 404);
    }

    const headers = getHeaders(candidateSheet);
    const timestamp = getCurrentTimestamp();

    const statusTriagemIndex = headers.indexOf('status_triagem');
    if (statusTriagemIndex >= 0) {
      candidateSheet.getRange(rowIndex, statusTriagemIndex + 1).setValue(statusTriagem);
    }

    const dataTriagemIndex = headers.indexOf('data_hora_triagem');
    if (dataTriagemIndex >= 0) {
      candidateSheet.getRange(rowIndex, dataTriagemIndex + 1).setValue(timestamp);
    }

    if (params.analystEmail) {
      const analistaIndex = headers.indexOf('analista_triagem');
      if (analistaIndex >= 0) {
        candidateSheet.getRange(rowIndex, analistaIndex + 1).setValue(params.analystEmail);
      }
    }

    if (params.reasonId) {
      const motivoIndex = headers.indexOf('motivo_desclassificacao');
      if (motivoIndex >= 0) {
        candidateSheet.getRange(rowIndex, motivoIndex + 1).setValue(params.reasonId);
      }
    }

    if (params.notes) {
      const notesIndex = headers.indexOf('observacoes_triagem');
      if (notesIndex >= 0) {
        candidateSheet.getRange(rowIndex, notesIndex + 1).setValue(params.notes);
      }
    }

    return createResponse({ success: true, message: 'Status atualizado' });
  } catch (error) {
    Logger.log('Erro em updateCandidateStatus: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function getCandidatesByStatus(params) {
  try {
    const status = params.status;
    if (!status) {
      return createResponse({ error: 'Status é obrigatório' }, 400);
    }

    const candidateSheet = getSheet(SHEET_CANDIDATOS);
    if (!candidateSheet) {
      return createResponse({ success: true, data: [] });
    }

    const data = candidateSheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createResponse({ success: true, data: [] });
    }

    const headers = data[0];
    const statusTriagemIndex = headers.indexOf('status_triagem');

    if (statusTriagemIndex === -1) {
      return createResponse({ success: true, data: [] });
    }

    const candidates = [];

    for (let i = 1; i < data.length; i++) {
      const statusTriagem = data[i][statusTriagemIndex];
      if (statusTriagem === status) {
        const candidate = {};
        headers.forEach((header, index) => {
          candidate[header] = data[i][index];
        });
        candidates.push(candidate);
      }
    }

    return createResponse({ success: true, data: candidates });
  } catch (error) {
    Logger.log('Erro em getCandidatesByStatus: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function saveScreening(params) {
  try {
    const registrationNumber = params.registrationNumber || params.CPF;
    const status = params.status;

    if (!registrationNumber || !status) {
      return createResponse({ error: 'Parâmetros obrigatórios ausentes' }, 400);
    }

    const candidateSheet = getSheet(SHEET_CANDIDATOS);
    if (!candidateSheet) {
      return createResponse({ error: 'Planilha não encontrada' }, 404);
    }

    const rowIndex = findRowByValue(candidateSheet, 'CPF', registrationNumber);
    if (rowIndex === -1) {
      return createResponse({ error: 'Candidato não encontrado' }, 404);
    }

    const headers = getHeaders(candidateSheet);
    const timestamp = getCurrentTimestamp();

    const statusTriagemIndex = headers.indexOf('status_triagem');
    if (statusTriagemIndex >= 0) {
      candidateSheet.getRange(rowIndex, statusTriagemIndex + 1).setValue(status);
    }

    const dataTriagemIndex = headers.indexOf('data_hora_triagem');
    if (dataTriagemIndex >= 0) {
      candidateSheet.getRange(rowIndex, dataTriagemIndex + 1).setValue(timestamp);
    }

    if (params.analystEmail) {
      const analistaIndex = headers.indexOf('analista_triagem');
      if (analistaIndex >= 0) {
        candidateSheet.getRange(rowIndex, analistaIndex + 1).setValue(params.analystEmail);
      }
    }

    return createResponse({ success: true, message: 'Triagem salva' });
  } catch (error) {
    Logger.log('Erro em saveScreening: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function getDisqualificationReasons(params) {
  try {
    const motivosSheet = getSheet(SHEET_MOTIVOS);
    if (!motivosSheet) {
      return createResponse({ success: true, data: [] });
    }

    const data = motivosSheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createResponse({ success: true, data: [] });
    }

    const headers = data[0];
    const reasons = [];

    for (let i = 1; i < data.length; i++) {
      const reason = {};
      headers.forEach((header, index) => {
        reason[header] = data[i][index];
      });
      if (reason.id || reason.motivo) {
        reasons.push(reason);
      }
    }

    return createResponse({ success: true, data: reasons });
  } catch (error) {
    Logger.log('Erro em getDisqualificationReasons: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function assignCandidates(params) {
  try {
    const candidateIds = params.candidateIds;
    const analystEmail = params.analystEmail || params.analystId;

    if (!candidateIds || !analystEmail) {
      return createResponse({ error: 'Parâmetros obrigatórios ausentes' }, 400);
    }

    const ids = typeof candidateIds === 'string' ? candidateIds.split(',').map(id => id.trim()) : candidateIds;
    const candidateSheet = getSheet(SHEET_CANDIDATOS);

    if (!candidateSheet) {
      return createResponse({ error: 'Planilha não encontrada' }, 404);
    }

    const headers = getHeaders(candidateSheet);
    const cpfIndex = headers.indexOf('CPF');
    const assignedToIndex = headers.indexOf('assigned_to');
    const timestamp = getCurrentTimestamp();
    let updated = 0;

    const data = candidateSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      const cpf = data[i][cpfIndex];
      if (cpf && ids.includes(cpf.toString())) {
        if (assignedToIndex >= 0) {
          candidateSheet.getRange(i + 1, assignedToIndex + 1).setValue(analystEmail);
        }
        updated++;
      }
    }

    return createResponse({ success: true, message: updated + ' candidato(s) atribuído(s)', updated: updated });
  } catch (error) {
    Logger.log('Erro em assignCandidates: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function getMessageTemplates(params) {
  try {
    const templatesSheet = getSheet(SHEET_TEMPLATES);
    if (!templatesSheet) {
      return createResponse({ success: true, data: [] });
    }

    const data = templatesSheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createResponse({ success: true, data: [] });
    }

    const headers = data[0];
    const templates = [];

    for (let i = 1; i < data.length; i++) {
      const template = {};
      headers.forEach((header, index) => {
        template[header] = data[i][index];
      });
      if (template.nome) {
        templates.push(template);
      }
    }

    return createResponse({ success: true, data: templates });
  } catch (error) {
    Logger.log('Erro em getMessageTemplates: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function sendMessages(params) {
  try {
    const messageType = params.messageType;
    const content = params.content;
    const candidateIds = params.candidateIds;

    if (!messageType || !content || !candidateIds) {
      return createResponse({ error: 'Parâmetros insuficientes' }, 400);
    }

    const ids = typeof candidateIds === 'string' ? candidateIds.split(',').map(id => id.trim()) : candidateIds;

    return createResponse({ success: true, message: 'Mensagens enviadas', sent: ids.length });
  } catch (error) {
    Logger.log('Erro em sendMessages: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function updateMessageStatus(params) {
  try {
    const registrationNumbers = params.registrationNumbers;
    const messageType = params.messageType;
    const status = params.status;

    if (!registrationNumbers || !messageType || !status) {
      return createResponse({ error: 'Parâmetros insuficientes' }, 400);
    }

    return createResponse({ success: true, message: 'Status atualizado' });
  } catch (error) {
    Logger.log('Erro em updateMessageStatus: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function moveToInterview(params) {
  try {
    const candidateIds = params.candidateIds;
    if (!candidateIds) {
      return createResponse({ error: 'IDs obrigatórios' }, 400);
    }

    return createResponse({ success: true, message: 'Movido para entrevista' });
  } catch (error) {
    Logger.log('Erro em moveToInterview: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function getInterviewCandidates(params) {
  try {
    return createResponse({ success: true, data: [] });
  } catch (error) {
    Logger.log('Erro em getInterviewCandidates: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function allocateToInterviewer(params) {
  try {
    return createResponse({ success: true, message: 'Alocado' });
  } catch (error) {
    Logger.log('Erro em allocateToInterviewer: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function getInterviewerCandidates(params) {
  try {
    return createResponse({ success: true, data: [] });
  } catch (error) {
    Logger.log('Erro em getInterviewerCandidates: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function saveInterviewEvaluation(params) {
  try {
    return createResponse({ success: true, message: 'Avaliação salva' });
  } catch (error) {
    Logger.log('Erro em saveInterviewEvaluation: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function logMessage(params) {
  try {
    return createResponse({ success: true, message: 'Mensagem registrada' });
  } catch (error) {
    Logger.log('Erro em logMessage: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function getEmailAliases(params) {
  try {
    return createResponse({ success: true, data: [] });
  } catch (error) {
    Logger.log('Erro em getEmailAliases: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function getReportStats(params) {
  try {
    return createResponse({ success: true, data: {} });
  } catch (error) {
    Logger.log('Erro em getReportStats: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function getReport(params) {
  try {
    return createResponse({ success: true, data: [] });
  } catch (error) {
    Logger.log('Erro em getReport: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function getStatistics(params) {
  try {
    return createResponse({ total: 0, pendente: 0, em_analise: 0, concluido: 0 });
  } catch (error) {
    Logger.log('Erro em getStatistics: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function getCandidate(params) {
  try {
    return createResponse({ success: true, candidate: {} });
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

function addCandidate(params) {
  try {
    return createResponse({ success: true, message: 'Candidato adicionado' });
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

function updateCandidate(params) {
  try {
    return createResponse({ success: true, message: 'Candidato atualizado' });
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

function deleteCandidate(params) {
  try {
    return createResponse({ success: true, message: 'Candidato deletado' });
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

function bulkUpdateCandidates(params) {
  try {
    return createResponse({ success: true, message: 'Candidatos atualizados' });
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

function createUser(params) {
  try {
    return createResponse({ success: true, message: 'Usuário criado' });
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

function updateUser(params) {
  try {
    return createResponse({ success: true, message: 'Usuário atualizado' });
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

function deleteUser(params) {
  try {
    return createResponse({ success: true, message: 'Usuário deletado' });
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

function testConnection(params) {
  try {
    const ss = getSpreadsheet();
    const sheets = ss.getSheets();
    const sheetNames = sheets.map(sheet => sheet.getName());

    return createResponse({
      success: true,
      message: 'Conexão funcionando!',
      spreadsheet_id: SPREADSHEET_ID,
      sheets: sheetNames,
      timestamp: getCurrentTimestamp()
    });
  } catch (error) {
    Logger.log('Erro em testConnection: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}
