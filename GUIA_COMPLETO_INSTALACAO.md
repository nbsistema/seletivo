# 🚀 GUIA COMPLETO DE INSTALAÇÃO - VERSÃO FINAL

## ✅ ARQUIVO CORRETO A USAR

**USE ESTE ARQUIVO:** `google-apps-script-FINAL-COM-CORS.js`

Este arquivo contém:
- ✅ **1600+ linhas** de código completo
- ✅ Todas as 31 funções do sistema
- ✅ Headers CORS configurados corretamente
- ✅ Suporte completo a todas as features da aplicação

---

## 📋 PASSO A PASSO COMPLETO

### 1️⃣ Abrir Google Apps Script

1. Acesse: https://script.google.com
2. Se já existe projeto: abra-o
3. Se não existe: clique em "Novo projeto"

### 2️⃣ Copiar o Código Completo

**CRÍTICO**: O arquivo tem mais de 1600 linhas!

1. Abra o arquivo: `google-apps-script-FINAL-COM-CORS.js`
2. Selecione **TODO** o conteúdo (Ctrl+A)
3. Copie (Ctrl+C)
4. No Google Apps Script:
   - **DELETE** todo código existente
   - **COLE** o novo código (Ctrl+V)
5. **VERIFIQUE** se copiou tudo:
   - Role até o final do arquivo
   - Deve terminar com a função `testConnection`
   - Última linha deve ter `}`

### 3️⃣ Configurar SPREADSHEET_ID

Linha 15 do script:
```javascript
const SPREADSHEET_ID = '1iQSQ06P_OXkqxaGWN3uG5jRYFBKyjWqQyvzuGk2EplY';
```

- ✅ Se este é o ID correto, mantenha
- ⚠️ Se não, substitua pelo ID da sua planilha

**Como encontrar o ID da planilha:**
A URL da planilha é assim:
```
https://docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit
```
Copie apenas a parte `SEU_ID_AQUI`

### 4️⃣ Salvar o Projeto

1. Clique no ícone de disquete ou Ctrl+S
2. Dê um nome ao projeto (ex: "Sistema Triagem Hospital")
3. Aguarde salvar

### 5️⃣ Criar Nova Implantação

**IMPORTANTE**: Se já existe uma implantação antiga, você DEVE criar uma NOVA:

1. Clique em **"Implantar"** (canto superior direito)
2. Selecione **"Nova implantação"**
3. Clique no ícone de engrenagem ao lado de "Selecionar tipo"
4. Escolha **"Aplicativo da Web"**
5. Configure:
   - **Descrição**: "Versão com CORS completo"
   - **Execute como**: **Eu (seu email)**
   - **Quem tem acesso**: **Qualquer pessoa**
6. Clique em **"Implantar"**
7. **Autorize** o acesso quando solicitado
8. **COPIE** a URL completa que aparece

A URL será algo como:
```
https://script.google.com/macros/s/AKfycby.../exec
```

### 6️⃣ Atualizar URL na Aplicação

Edite o arquivo: `src/contexts/AuthContext.tsx`

**Localize a linha 131:**
```typescript
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx...';
```

**Substitua** pela URL que você copiou no passo 5.

**Exemplo:**
```typescript
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyNOVA_URL_AQUI/exec';
```

### 7️⃣ Verificar Estrutura da Planilha

Sua planilha Google Sheets DEVE ter estas abas:

- **USUARIOS** - com colunas: Email, Nome, Role, Ativo, Password
- **CANDIDATOS** - com todas as colunas de candidatos
- **MOTIVOS** - motivos de desclassificação
- **MENSAGENS** - log de mensagens enviadas
- **TEMPLATES** - templates de mensagens
- **ALIAS** - aliases de email

### 8️⃣ Testar a Conexão

1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Recarregue a aplicação (F5)
3. Abra o Console (F12)
4. Tente fazer login
5. Verifique os logs no console

**O que você DEVE ver:**
```
📤 [AuthContext] Enviando requisição: getUserRole
📦 [AuthContext] Payload: {...}
📡 [AuthContext] Resposta recebida - Status: 200
✅ [AuthContext] Dados recebidos: {...}
```

**O que você NÃO deve ver:**
```
❌ CORS policy: No 'Access-Control-Allow-Origin' header
```

---

## 🔍 CHECKLIST DE VERIFICAÇÃO

Antes de usar, verifique:

- [ ] Arquivo `google-apps-script-FINAL-COM-CORS.js` copiado completamente
- [ ] SPREADSHEET_ID configurado corretamente
- [ ] Projeto salvo no Google Apps Script
- [ ] Nova implantação criada (não gerenciar implantação antiga)
- [ ] Configurado como "Aplicativo da Web"
- [ ] "Execute como: Eu"
- [ ] "Quem tem acesso: Qualquer pessoa"
- [ ] URL copiada corretamente
- [ ] URL atualizada em `src/contexts/AuthContext.tsx` linha 131
- [ ] Planilha tem todas as abas necessárias
- [ ] Aba USUARIOS tem pelo menos um usuário teste
- [ ] Cache do navegador limpo

---

## 📊 FUNCIONALIDADES INCLUÍDAS

O script completo inclui:

### Gestão de Usuários (7 funções)
- ✅ getUserRole - Autenticação
- ✅ getAllUsers - Listar todos
- ✅ getAnalysts - Listar analistas
- ✅ getInterviewers - Listar entrevistadores
- ✅ createUser - Criar usuário
- ✅ updateUser - Atualizar usuário
- ✅ deleteUser - Deletar usuário

### Gestão de Candidatos (9 funções)
- ✅ getCandidates - Listar todos
- ✅ getCandidate - Buscar um
- ✅ addCandidate - Adicionar
- ✅ updateCandidate - Atualizar
- ✅ deleteCandidate - Deletar
- ✅ assignCandidates - Alocar para analista
- ✅ bulkUpdateCandidates - Atualização em massa
- ✅ updateCandidateStatus - Atualizar status triagem
- ✅ getCandidatesByStatus - Filtrar por status
- ✅ saveScreening - Salvar avaliação completa

### Sistema de Entrevistas (5 funções)
- ✅ moveToInterview - Mover para entrevista
- ✅ getInterviewCandidates - Listar candidatos em entrevista
- ✅ allocateToInterviewer - Alocar para entrevistador
- ✅ getInterviewerCandidates - Candidatos do entrevistador
- ✅ saveInterviewEvaluation - Salvar avaliação de entrevista

### Sistema de Mensagens (5 funções)
- ✅ sendMessages - Enviar mensagens
- ✅ logMessage - Registrar envio
- ✅ updateMessageStatus - Atualizar status de envio
- ✅ getMessageTemplates - Buscar templates
- ✅ getEmailAliases - Buscar aliases de email

### Relatórios (4 funções)
- ✅ getStatistics - Estatísticas gerais
- ✅ getReportStats - Estatísticas detalhadas
- ✅ getReport - Gerar relatório
- ✅ getDisqualificationReasons - Motivos de desclassificação

### Utilitários
- ✅ testConnection - Testar conexão

**TOTAL: 31 funções completas**

---

## 🛠️ DIFERENÇAS DO SCRIPT ANTERIOR

### ❌ Versão Antiga (google-apps-script-CORS-COMPLETO.js)
- Apenas ~800 linhas
- Funções simplificadas/stub
- Muitas funções apenas retornavam dados vazios

### ✅ Versão Nova (google-apps-script-FINAL-COM-CORS.js)
- Mais de 1600 linhas
- Todas as funções implementadas completamente
- Lógica completa de negócio
- Manipulação real dos dados da planilha
- Headers CORS em todas as respostas

---

## 🆘 TROUBLESHOOTING

### Erro: "Usuário não encontrado"

1. Verifique a aba USUARIOS na planilha
2. Confirme que tem estes campos:
   - Email: seu@email.com
   - Nome: Seu Nome
   - Role: admin (ou analista, ou entrevistador)
   - Ativo: TRUE
   - Password: (pode deixar vazio)

### Erro CORS persiste

1. Certifique-se que criou **NOVA** implantação
2. **NÃO** use "Gerenciar implantações"
3. Use sempre "Nova implantação"
4. Confirme "Quem tem acesso: Qualquer pessoa"
5. Copie a URL NOVA gerada

### Script não executa

1. Verifique o SPREADSHEET_ID
2. Confirme que você tem acesso à planilha
3. Teste executar a função `testConnection` no editor do Google Apps Script
4. Veja os logs em "Execuções"

### Dados não aparecem

1. Abra o Google Apps Script
2. Vá em "Execuções" (menu lateral)
3. Veja os logs de execução
4. Procure por erros

---

## ✅ CONFIRMAÇÃO DE SUCESSO

Quando tudo estiver funcionando, você verá:

1. **Login funciona** sem erros CORS
2. **Console mostra logs** de sucesso
3. **Dashboard carrega** com dados
4. **Candidatos aparecem** na lista
5. **Todas as ações funcionam** (alocar, classificar, etc)

---

## 📝 RESUMO EXECUTIVO

1. Use o arquivo: **`google-apps-script-FINAL-COM-CORS.js`**
2. Copie **TODO** o código (1600+ linhas)
3. Crie **NOVA** implantação
4. Copie a **URL completa**
5. Atualize em `src/contexts/AuthContext.tsx` linha 131
6. Limpe o cache e teste

Se seguir exatamente estes passos, o sistema funcionará! 🎉
