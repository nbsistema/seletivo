// ============================================
// FUNÇÃO PARA ADICIONAR AO GOOGLE APPS SCRIPT
// ============================================
//
// INSTRUÇÕES:
// 1. Adicione 'saveScreening' nas rotas (linha ~64):
//    'saveScreening': saveScreening,
//
// 2. Cole esta função APÓS a função updateCandidateStatus
//    e ANTES da função getCandidatesByStatus
// ============================================

function saveScreening(params) {
  try {
    Logger.log('🔵 saveScreening - Parâmetros recebidos: ' + JSON.stringify(params));

    const candidateId = params.candidateId;
    const registrationNumber = params.registrationNumber || params.CPF;
    const status = params.status;
    const documents = params.documents || {};
    const capacidade_tecnica = params.capacidade_tecnica || 0;
    const experiencia = params.experiencia || 0;
    const total_score = params.total_score || 0;
    const notes = params.notes || '';
    const analystEmail = params.analystEmail;
    const screenedAt = params.screenedAt || getCurrentTimestamp();

    if (!registrationNumber) {
      return createResponse({ error: 'Número de registro ou CPF é obrigatório' }, 400);
    }

    if (!status) {
      return createResponse({ error: 'Status é obrigatório' }, 400);
    }

    const candidateSheet = getSheet(SHEET_CANDIDATOS);
    if (!candidateSheet) {
      return createResponse({ error: 'Planilha de candidatos não encontrada' }, 404);
    }

    const rowIndex = findRowByValue(candidateSheet, 'CPF', registrationNumber);
    if (rowIndex === -1) {
      return createResponse({ error: 'Candidato não encontrado com CPF: ' + registrationNumber }, 404);
    }

    const headers = getHeaders(candidateSheet);
    const timestamp = getCurrentTimestamp();

    Logger.log('📝 Atualizando candidato na linha: ' + rowIndex);

    // Atualizar status de triagem
    const statusTriagemIndex = headers.indexOf('status_triagem');
    if (statusTriagemIndex >= 0) {
      candidateSheet.getRange(rowIndex, statusTriagemIndex + 1).setValue(status);
      Logger.log('✅ Status atualizado: ' + status);
    }

    // Atualizar data e hora da triagem
    const dataTriagemIndex = headers.indexOf('data_hora_triagem');
    if (dataTriagemIndex >= 0) {
      candidateSheet.getRange(rowIndex, dataTriagemIndex + 1).setValue(screenedAt);
    }

    // Atualizar analista responsável
    const analistaTriagemIndex = headers.indexOf('analista_triagem');
    if (analistaTriagemIndex >= 0 && analystEmail) {
      candidateSheet.getRange(rowIndex, analistaTriagemIndex + 1).setValue(analystEmail);
    }

    // Salvar verificação de documentos
    for (let i = 1; i <= 5; i++) {
      const docKey = 'documento_' + i;
      if (documents[docKey]) {
        const docIndex = headers.indexOf(docKey);
        if (docIndex >= 0) {
          candidateSheet.getRange(rowIndex, docIndex + 1).setValue(documents[docKey]);
        }
      }
    }

    // Salvar pontuações (apenas para classificados)
    if (status === 'Classificado') {
      const capacidadeTecnicaIndex = headers.indexOf('capacidade_tecnica');
      if (capacidadeTecnicaIndex >= 0) {
        candidateSheet.getRange(rowIndex, capacidadeTecnicaIndex + 1).setValue(capacidade_tecnica);
      }

      const experienciaIndex = headers.indexOf('experiencia');
      if (experienciaIndex >= 0) {
        candidateSheet.getRange(rowIndex, experienciaIndex + 1).setValue(experiencia);
      }

      const totalScoreIndex = headers.indexOf('pontuacao_total');
      if (totalScoreIndex >= 0) {
        candidateSheet.getRange(rowIndex, totalScoreIndex + 1).setValue(total_score);
      }
    }

    // Salvar observações
    if (notes) {
      const notesIndex = headers.indexOf('observacoes_triagem');
      if (notesIndex >= 0) {
        candidateSheet.getRange(rowIndex, notesIndex + 1).setValue(notes);
      }
    }

    // Atualizar timestamp de atualização
    const updatedAtIndex = headers.indexOf('updated_at');
    if (updatedAtIndex >= 0) {
      candidateSheet.getRange(rowIndex, updatedAtIndex + 1).setValue(timestamp);
    }

    Logger.log('✅ Triagem salva com sucesso');

    return createResponse({
      success: true,
      message: 'Triagem salva com sucesso'
    });
  } catch (error) {
    Logger.log('❌ Erro em saveScreening: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}
