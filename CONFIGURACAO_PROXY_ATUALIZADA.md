# Configuração do Proxy Atualizada - Sistema Completo

## Resumo das Alterações

O sistema foi configurado para usar o **proxy Netlify** que se comunica com o Google Apps Script. Todas as requisições passam pelo proxy para evitar problemas de CORS.

## URL do Google Apps Script

```
https://script.google.com/macros/s/AKfycbxfl0gWq3-dnZmYcz5AIHkpOyC1XdRb8QdaMRQTQZnn5sqyQZvV3qhCevhXuFHGYBk0/exec
```

## Arquitetura do Sistema

```
Frontend (React)
    ↓ POST /action + data
Netlify Proxy (/.netlify/functions/google-sheets-proxy)
    ↓ POST com payload
Google Apps Script
    ↓ JSON Response
Netlify Proxy
    ↓ JSON Response
Frontend (React)
```

## Arquivos Atualizados

### 1. `.env`
Adicionada a variável de ambiente:
```env
VITE_GOOGLE_SCRIPT_URL=/.netlify/functions/google-sheets-proxy
```

### 2. `netlify/functions/google-sheets-proxy.js`
- Configurado com o novo URL do Google Apps Script
- Método: POST
- Suporta CORS completo
- Repassa todas as requisições para o Google Script

### 3. `src/services/googleSheets.ts`
- Atualizado para usar POST em vez de GET
- Payload enviado: `{ action, ...params }`
- Logs detalhados de requisições e respostas

### 4. `src/services/candidateService.ts`
- Atualizado para usar o proxy
- Método POST com payload estruturado
- URL padrão: `/.netlify/functions/google-sheets-proxy`

### 5. `src/services/userService.ts`
- Atualizado para usar o proxy
- Método POST com payload estruturado
- Logs detalhados por serviço

### 6. `src/contexts/AuthContext.tsx`
- Atualizado para usar o proxy
- Método POST com payload estruturado
- URL padrão: `/.netlify/functions/google-sheets-proxy`

## Formato das Requisições

### Frontend → Proxy
```javascript
// Método: POST
// URL: /.netlify/functions/google-sheets-proxy
// Body:
{
  "action": "getCandidates",
  "status": "pendente",
  // outros parâmetros...
}
```

### Proxy → Google Script
```javascript
// Método: POST
// URL: https://script.google.com/macros/s/AKfycbx.../exec
// Body: (mesmo payload do frontend)
{
  "action": "getCandidates",
  "status": "pendente"
}
```

## Logs e Debug

Todos os serviços agora possuem logs detalhados:

- `[googleSheets]` - Requisições do googleSheets.ts
- `[candidateService]` - Requisições do candidateService.ts
- `[UserService]` - Requisições do userService.ts
- `[AuthContext]` - Requisições do AuthContext.tsx

Exemplo de log:
```
📤 [googleSheets] Enviando requisição: getCandidates
📦 [googleSheets] Payload: { action: 'getCandidates', status: 'pendente' }
📡 [googleSheets] Status da resposta: 200
✅ [googleSheets] Resposta recebida: { success: true, data: [...] }
```

## Ações Suportadas

O Google Apps Script suporta as seguintes ações:

### Usuários
- `getUserRole` - Buscar usuário por email
- `getAllUsers` - Listar todos os usuários
- `getAnalysts` - Listar analistas
- `getInterviewers` - Listar entrevistadores
- `createUser` - Criar usuário
- `updateUser` - Atualizar usuário
- `deleteUser` - Deletar usuário

### Candidatos
- `getCandidates` - Listar candidatos
- `getCandidate` - Buscar candidato por ID
- `addCandidate` - Adicionar candidato
- `updateCandidate` - Atualizar candidato
- `deleteCandidate` - Deletar candidato
- `assignCandidates` - Atribuir candidatos a analista
- `bulkUpdateCandidates` - Atualizar múltiplos candidatos
- `updateCandidateStatus` - Atualizar status
- `getCandidatesByStatus` - Buscar por status
- `saveScreening` - Salvar triagem

### Entrevistas
- `moveToInterview` - Mover para entrevista
- `getInterviewCandidates` - Listar candidatos em entrevista
- `allocateToInterviewer` - Alocar para entrevistador
- `getInterviewerCandidates` - Buscar candidatos do entrevistador
- `saveInterviewEvaluation` - Salvar avaliação

### Mensagens
- `sendMessages` - Enviar mensagens
- `logMessage` - Registrar mensagem
- `updateMessageStatus` - Atualizar status de mensagem
- `getMessageTemplates` - Buscar templates
- `getEmailAliases` - Buscar aliases de email

### Relatórios
- `getStatistics` - Buscar estatísticas
- `getReportStats` - Buscar estatísticas de relatório
- `getReport` - Gerar relatório

### Motivos
- `getDisqualificationReasons` - Buscar motivos de desclassificação

### Teste
- `test` - Testar conexão

## Verificação de Funcionamento

Para verificar se tudo está funcionando:

1. Abra o console do navegador (F12)
2. Faça login no sistema
3. Observe os logs:
   ```
   🔄 [AuthContext] Chamando proxy: getUserRole
   📦 [AuthContext] Payload: { action: 'getUserRole', email: '...' }
   📡 [AuthContext] Resposta recebida - Status: 200
   ✅ [AuthContext] Dados recebidos: { ... }
   ```

## Próximos Passos

1. ✅ Configuração do proxy - CONCLUÍDO
2. ✅ Atualização de todos os serviços - CONCLUÍDO
3. ✅ Build do projeto - CONCLUÍDO
4. 🔄 Deploy no Netlify
5. 🔄 Teste completo do sistema em produção

## Notas Importantes

- O proxy Netlify é necessário porque o Google Apps Script tem limitações de CORS
- Todas as requisições devem passar pelo proxy
- O Google Script está configurado para aceitar requisições POST
- O formato do payload é consistente em todo o sistema
