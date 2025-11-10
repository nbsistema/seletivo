// ============================================
// GOOGLE APPS SCRIPT - SISTEMA DE TRIAGEM ATUALIZADO
// ============================================

const SPREADSHEET_ID = '1iQSQ06P_OXkqxaGWN3uG5jRYFBKyjWqQyvzuGk2EplY';
const SHEET_USUARIOS = 'USUARIOS';
const SHEET_CANDIDATOS = 'CANDIDATOS';
const SHEET_MOTIVOS = 'MOTIVOS';
const SHEET_MENSAGENS = 'MENSAGENS';
const SHEET_TEMPLATES = 'TEMPLATES';

// ============================================
// FUNÇÕES PRINCIPAIS DE ENTRADA
// ============================================

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

// ============================================
// ROTEAMENTO DE REQUISIÇÕES
// ============================================

function handleRequest(e) {
  try {
    let action, params;

    if (e.postData) {
      const data = JSON.parse(e.postData.contents);
      action = data.action;
      params = data;
    } else {
      action = e.parameter.action;
      params = e.parameter;
    }

    const actions = {
      'getUserRole': () => getUserRole(params),
      'getCandidates': () => getCandidates(params),
      'updateCandidateStatus': () => updateCandidateStatus(params),
      'getCandidatesByStatus': () => getCandidatesByStatus(params),
      'logMessage': () => logMessage(params),
      'getDisqualificationReasons': () => getDisqualificationReasons(),
      'getMessageTemplates': () => getMessageTemplates(params),
      'test': () => testConnection()
    };

    if (actions[action]) {
      return createResponse({ success: true, data: actions[action]() });
    } else {
      return createResponse({ success: false, error: 'Ação não encontrada: ' + action });
    }
  } catch (error) {
    Logger.log('Erro no handleRequest: ' + error.toString());
    return createResponse({ success: false, error: error.toString() });
  }
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function createResponse(data) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setContent(JSON.stringify(data));
  return output;
}

function getCurrentTimestamp() {
  return new Date().toISOString();
}

// ============================================
// FUNÇÕES DE USUÁRIOS
// ============================================

function getUserRole(params) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_USUARIOS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === params.email) {
      return {
        email: data[i][0],
        name: data[i][1],
        role: data[i][2],
        id: data[i][3] || data[i][0]
      };
    }
  }
  return null;
}

// ============================================
// FUNÇÕES DE CANDIDATOS
// ============================================

function getCandidates(params) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_CANDIDATOS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const candidates = [];
  for (let i = 1; i < data.length; i++) {
    const candidate = {};
    for (let j = 0; j < headers.length; j++) {
      candidate[headers[j]] = data[i][j];
    }
    candidates.push(candidate);
  }

  return candidates;
}

function updateCandidateStatus(params) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_CANDIDATOS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const statusCol = headers.indexOf('Status');
  const regNumCol = headers.indexOf('Número de Inscrição') || headers.indexOf('NUMEROINSCRICAO');
  const analystCol = headers.indexOf('Analista') || headers.indexOf('assigned_to');
  const dateCol = headers.indexOf('Data Triagem') || headers.indexOf('data_hora_triagem');
  const reasonCol = headers.indexOf('Motivo Desclassificação');
  const notesCol = headers.indexOf('Observações') || headers.indexOf('screening_notes');

  for (let i = 1; i < data.length; i++) {
    if (data[i][regNumCol] === params.registrationNumber) {
      if (statusCol >= 0) sheet.getRange(i + 1, statusCol + 1).setValue(params.statusTriagem);
      if (analystCol >= 0 && params.analystEmail) sheet.getRange(i + 1, analystCol + 1).setValue(params.analystEmail);
      if (dateCol >= 0) sheet.getRange(i + 1, dateCol + 1).setValue(getCurrentTimestamp());
      if (reasonCol >= 0 && params.reasonId) {
        const reason = getDisqualificationReasonById(params.reasonId);
        sheet.getRange(i + 1, reasonCol + 1).setValue(reason);
      }
      if (notesCol >= 0 && params.notes) sheet.getRange(i + 1, notesCol + 1).setValue(params.notes);
      return true;
    }
  }

  throw new Error('Candidato não encontrado');
}

function getCandidatesByStatus(params) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_CANDIDATOS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const statusCol = headers.indexOf('Status');
  const candidates = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][statusCol] === params.status) {
      const candidate = {};
      for (let j = 0; j < headers.length; j++) {
        candidate[headers[j]] = data[i][j];
      }
      candidates.push(candidate);
    }
  }

  return candidates;
}

// ============================================
// FUNÇÕES DE MOTIVOS DE DESCLASSIFICAÇÃO
// ============================================

function initMotivosSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_MOTIVOS);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_MOTIVOS);
    sheet.getRange('A1:C1').setValues([['ID', 'Motivo', 'Ativo']]);

    const motivos = [
      ['M001', 'Documentação incompleta', 'Sim'],
      ['M002', 'Não atende aos requisitos mínimos da vaga', 'Sim'],
      ['M003', 'Formação incompatível com a vaga', 'Sim'],
      ['M004', 'Experiência insuficiente', 'Sim'],
      ['M005', 'Documentos ilegíveis ou com qualidade inadequada', 'Sim'],
      ['M006', 'Dados inconsistentes ou contraditórios', 'Sim'],
      ['M007', 'Não apresentou documentos obrigatórios', 'Sim'],
      ['M008', 'Fora do prazo de inscrição', 'Sim'],
      ['M009', 'Outros motivos', 'Sim']
    ];

    sheet.getRange(2, 1, motivos.length, 3).setValues(motivos);
  }

  return sheet;
}

function getDisqualificationReasons() {
  const sheet = initMotivosSheet();
  const data = sheet.getDataRange().getValues();
  const reasons = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === 'Sim') {
      reasons.push({
        id: data[i][0],
        reason: data[i][1],
        is_active: true
      });
    }
  }

  return reasons;
}

function getDisqualificationReasonById(reasonId) {
  const sheet = initMotivosSheet();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === reasonId) {
      return data[i][1];
    }
  }

  return 'Motivo não especificado';
}

// ============================================
// FUNÇÕES DE MENSAGENS
// ============================================

function initMensagensSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_MENSAGENS);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_MENSAGENS);
    sheet.getRange('A1:G1').setValues([
      ['Data/Hora', 'Número Inscrição', 'Tipo', 'Destinatário', 'Assunto', 'Conteúdo', 'Enviado Por']
    ]);
  }

  return sheet;
}

function logMessage(params) {
  const sheet = initMensagensSheet();
  const newRow = [
    getCurrentTimestamp(),
    params.registrationNumber,
    params.messageType,
    params.recipient,
    params.subject || '',
    params.content,
    params.sentBy
  ];

  sheet.appendRow(newRow);
  return true;
}

// ============================================
// FUNÇÃO DE TESTE
// ============================================

function testConnection() {
  return {
    status: 'OK',
    timestamp: getCurrentTimestamp(),
    spreadsheetId: SPREADSHEET_ID
  };
}

// ============================================
// FUNÇÕES DE TEMPLATES DE MENSAGENS
// ============================================

function initTemplatesSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_TEMPLATES);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_TEMPLATES);
    sheet.getRange('A1:E1').setValues([['ID', 'Nome', 'Tipo', 'Assunto', 'Conteúdo']]);

    const templates = [
      ['T001', 'Classificado - Email', 'email', 'Processo Seletivo - Você foi classificado!',
       'Prezado(a) [NOME],\n\nParabéns! Você foi classificado(a) no processo seletivo para a vaga de [CARGO] na área [AREA].\n\nEm breve entraremos em contato com informações sobre as próximas etapas do processo.\n\nAtenciosamente,\nEquipe de Recrutamento e Seleção'],
      ['T002', 'Classificado - SMS', 'sms', '',
       'Parabéns [NOME]! Você foi classificado no processo seletivo para [CARGO]. Aguarde contato para próximas etapas.'],
      ['T003', 'Desclassificado - Email', 'email', 'Processo Seletivo - Resultado da Análise',
       'Prezado(a) [NOME],\n\nAgradecemos seu interesse em fazer parte da nossa equipe.\n\nInfelizmente, nesta etapa do processo seletivo, seu perfil não foi selecionado para a vaga de [CARGO].\n\nDesejamos muito sucesso em sua jornada profissional.\n\nAtenciosamente,\nEquipe de Recrutamento e Seleção'],
      ['T004', 'Em Revisão - Email', 'email', 'Processo Seletivo - Análise em Andamento',
       'Prezado(a) [NOME],\n\nSeu cadastro para a vaga de [CARGO] está sendo revisado pela nossa equipe de análise.\n\nEm breve daremos retorno sobre o andamento do seu processo seletivo.\n\nAtenciosamente,\nEquipe de Recrutamento e Seleção']
    ];

    sheet.getRange(2, 1, templates.length, 5).setValues(templates);
  }

  return sheet;
}

function getMessageTemplates(params) {
  const sheet = initTemplatesSheet();
  const data = sheet.getDataRange().getValues();
  const templates = [];

  for (let i = 1; i < data.length; i++) {
    const messageType = params && params.messageType ? params.messageType : null;

    if (!messageType || data[i][2] === messageType) {
      templates.push({
        id: data[i][0],
        template_name: data[i][1],
        message_type: data[i][2],
        subject: data[i][3],
        content: data[i][4]
      });
    }
  }

  return templates;
}

// ============================================
// FUNÇÃO PARA ADICIONAR COLUNA STATUS
// ============================================

function addStatusColumnIfNotExists() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_CANDIDATOS);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const requiredColumns = [
    'Status',
    'Motivo Desclassificação',
    'Observações',
    'Data Triagem',
    'Analista'
  ];

  requiredColumns.forEach(colName => {
    if (headers.indexOf(colName) === -1) {
      const lastCol = sheet.getLastColumn();
      sheet.getRange(1, lastCol + 1).setValue(colName);
    }
  });
}
