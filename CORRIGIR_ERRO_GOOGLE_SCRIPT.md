# 🔧 Guia para Corrigir Erro no Google Apps Script

## ❌ Erro Atual
```
O usuário tentou executar a função _ss, mas ela foi excluída.
```

Este erro geralmente ocorre quando há problemas de sintaxe ou o código não foi salvo corretamente.

## ✅ Solução: Adicionar a Função saveScreening Manualmente

### Passo 1: Adicionar a Rota

No seu arquivo Google Apps Script, procure a seção `const routes = {` (aproximadamente linha 44-89).

**Encontre esta linha:**
```javascript
'getCandidatesByStatus': getCandidatesByStatus,
```

**Adicione logo APÓS ela:**
```javascript
'saveScreening': saveScreening,
```

**Resultado final deve ficar assim:**
```javascript
const routes = {
  // Usuários
  'getUserRole': getUserRole,
  'getAllUsers': getAllUsers,
  'getAnalysts': getAnalysts,
  'getInterviewers': getInterviewers,
  'createUser': createUser,
  'updateUser': updateUser,
  'deleteUser': deleteUser,

  // Candidatos
  'getCandidates': getCandidates,
  'getCandidate': getCandidate,
  'addCandidate': addCandidate,
  'updateCandidate': updateCandidate,
  'deleteCandidate': deleteCandidate,
  'assignCandidates': assignCandidates,
  'bulkUpdateCandidates': bulkUpdateCandidates,
  'updateCandidateStatus': updateCandidateStatus,
  'getCandidatesByStatus': getCandidatesByStatus,
  'saveScreening': saveScreening,  // <-- ADICIONE ESTA LINHA

  // Entrevistas
  'moveToInterview': moveToInterview,
  // ... resto do código
};
```

### Passo 2: Adicionar a Função saveScreening

Procure a função `updateCandidateStatus`. Ela termina com:

```javascript
  } catch (error) {
    Logger.log('Erro em updateCandidateStatus: ' + error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}
```

**Logo APÓS o fechamento dessa função (após o `}`), e ANTES da função `getCandidatesByStatus`, adicione:**

Copie TODO o conteúdo do arquivo: `google-apps-script-SAVE-SCREENING-FUNCTION.js`

### Passo 3: Salvar e Implantar

1. **Salve o script**: Ctrl+S ou Cmd+S
2. **Implante novamente**:
   - Clique em "Implantar" > "Gerenciar implantações"
   - Clique no ícone de lápis (editar) na implantação ativa
   - Em "Nova versão", clique em "Nova versão"
   - Clique em "Implantar"

### Passo 4: Testar

Execute o teste básico no Google Apps Script:
```javascript
function testarSaveScreening() {
  const params = {
    CPF: '123.456.789-00', // Use um CPF que existe na sua planilha
    status: 'Classificado',
    documents: {
      documento_1: 'conforme',
      documento_2: 'conforme'
    },
    capacidade_tecnica: 8,
    experiencia: 7,
    total_score: 15,
    notes: 'Teste de triagem',
    analystEmail: 'analista@teste.com',
    screenedAt: new Date().toISOString()
  };

  const result = saveScreening(params);
  Logger.log('Resultado: ' + JSON.stringify(result));
}
```

## 🔍 Checklist de Verificação

- [ ] A rota `'saveScreening': saveScreening,` foi adicionada no objeto routes
- [ ] A função `saveScreening` foi adicionada no código
- [ ] Não há vírgulas faltando ou extras no objeto routes
- [ ] O código foi salvo (Ctrl+S)
- [ ] Uma nova versão foi implantada
- [ ] As colunas necessárias existem na planilha CANDIDATOS:
  - [ ] status_triagem
  - [ ] data_hora_triagem
  - [ ] analista_triagem
  - [ ] documento_1 até documento_5
  - [ ] capacidade_tecnica
  - [ ] experiencia
  - [ ] pontuacao_total
  - [ ] observacoes_triagem
  - [ ] updated_at

## ⚠️ Problemas Comuns

### Erro: "Syntax error"
- Verifique se não esqueceu uma vírgula na lista de rotas
- Certifique-se de que todas as chaves `{}` e parênteses `()` estão fechados

### Erro: "Cannot find function saveScreening"
- A função não foi colada corretamente
- Verifique se está ANTES de `getCandidatesByStatus`

### Erro: "Candidato não encontrado"
- O CPF não existe na planilha
- Verifique se a coluna CPF tem o mesmo valor que está sendo enviado

### Dados não aparecem na planilha
- As colunas não existem na planilha CANDIDATOS
- Adicione os cabeçalhos das colunas na linha 1 da aba CANDIDATOS

## 📞 Suporte

Se o erro persistir:
1. Copie o log completo do erro
2. Verifique se todas as funções auxiliares existem: `getSheet`, `findRowByValue`, `getHeaders`, `getCurrentTimestamp`, `createResponse`
3. Teste com um CPF que você sabe que existe na planilha
