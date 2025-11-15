# CORRELAÇÃO COMPLETA DO SISTEMA - APLICAÇÃO OPERACIONAL

Este documento descreve como todos os componentes do sistema estão correlacionados e funcionando.

## 📋 ESTRUTURA DO SISTEMA

### 1. GOOGLE APPS SCRIPT (Backend)

**Arquivo:** `google-apps-script-OPERACIONAL-COMPLETO.js`

O script contém TODAS as funções necessárias para:

#### 1.1 Autenticação e Usuários
- `getUserRole()` - Autentica usuário no login
- `getAllUsers()` - Lista todos os usuários
- `getAnalysts()` - **CORRIGIDO** - Retorna analistas para alocação
- `getInterviewers()` - Retorna entrevistadores
- `createUser()`, `updateUser()`, `deleteUser()` - Gerenciamento de usuários

#### 1.2 Gerenciamento de Candidatos
- `getCandidates()` - Lista todos os candidatos
- `getCandidate()` - Busca candidato por ID/CPF
- `addCandidate()`, `updateCandidate()`, `deleteCandidate()` - CRUD de candidatos
- `assignCandidates()` - Aloca candidatos para analistas
- `updateCandidateStatus()` - Atualiza status de triagem
- **`getCandidatesByStatus()`** - **NOVA** - Filtra candidatos por status de triagem
- **`saveScreening()`** - **NOVA** - Salva triagem completa com documentos e pontuação

#### 1.3 Processo de Entrevista
- `moveToInterview()` - Move candidatos classificados para entrevista
- `getInterviewCandidates()` - Lista candidatos aguardando entrevista
- `allocateToInterviewer()` - Aloca candidatos para entrevistadores
- `getInterviewerCandidates()` - Busca candidatos de um entrevistador
- `saveInterviewEvaluation()` - Salva avaliação da entrevista

#### 1.4 Mensagens (Email e SMS)
- `sendMessages()` - Envia mensagens em lote
- `logMessage()` - Registra mensagens enviadas
- `updateMessageStatus()` - **CORRIGIDA** - Atualiza status email_sent/sms_sent
- `getMessageTemplates()` - Busca templates de mensagens
- `getEmailAliases()` - Busca aliases de email configurados

#### 1.5 Relatórios
- `getStatistics()` - Estatísticas gerais
- `getReportStats()` - Estatísticas para relatórios
- `getReport()` - Gera relatórios com filtros
- `getDisqualificationReasons()` - Busca motivos de desclassificação

---

## 🔄 FLUXO COMPLETO DO SISTEMA

### FASE 1: LOGIN E AUTENTICAÇÃO

**Frontend:** `LoginPage.tsx` → **Service:** `AuthContext.tsx` → **Backend:** `getUserRole()`

```javascript
// Usuário digita email e senha
// AuthContext chama getUserRole(email, password)
// Script retorna: { email, nome, role, ativo, success: true }
// Sistema redireciona para dashboard baseado no role
```

**Roles disponíveis:**
- `admin` → AdminDashboard
- `analista` → AnalystDashboard
- `entrevistador` → InterviewerDashboard

---

### FASE 2: PAINEL ADMIN - ALOCAÇÃO DE CANDIDATOS

**Frontend:** `AdminDashboard.tsx` → `AssignmentPanel.tsx` → **Service:** `userService.ts` → **Backend:** `assignCandidates()`

**Fluxo:**
1. Admin vê lista de candidatos pendentes
2. Seleciona candidatos (checkbox)
3. Escolhe analista da lista (busca com `getAnalysts()`)
4. Clica em "Alocar"
5. Sistema chama `assignCandidates(candidateIds, analystEmail, adminEmail)`
6. Script atualiza:
   - `assigned_to` = email do analista
   - `assigned_by` = email do admin
   - `assigned_at` = timestamp
   - `Status` = "em_analise"
   - `updated_at` = timestamp

---

### FASE 3: PAINEL ANALISTA - TRIAGEM

**Frontend:** `AnalystDashboard.tsx` → `ScreeningModal.tsx` → **Service:** `googleSheets.ts` → **Backend:** `saveScreening()`

**Fluxo da Triagem:**

#### 3.1 Lista de Candidatos
- Analista vê apenas candidatos alocados para ele (`assigned_to = email`)
- Lista mostra: Nome, CPF, Status
- Estatísticas: Total, Pendente, Em Análise, Concluído

#### 3.2 Triagem Completa (Modal de Triagem)
**Componente:** `ScreeningModal.tsx`

**Step 1 - Documentos:**
- 5 documentos obrigatórios
- Opções: Conforme | Não Conforme | Não se Aplica
- Se algum documento "Não Conforme" → Desclassificado automaticamente
- Campo de observações

**Step 2 - Avaliação Técnica (apenas para classificados):**
- **Capacidade Técnica** (0, 3, 7, 10 pontos)
  - Currículo, pós-graduação, cursos profissionalizantes
- **Experiência** (0, 3, 7, 10 pontos)
  - Experiência conforme currículo
- **Total:** até 20 pontos

**Step 3 - Envio:**
```javascript
saveScreening({
  registrationNumber: CPF,
  status: 'Classificado' | 'Desclassificado',
  documents: { documento_1: 'conforme', ... },
  capacidade_tecnica: 10,
  experiencia: 7,
  total_score: 17,
  notes: 'observações...',
  analystEmail: 'analista@email.com'
})
```

Script atualiza na planilha:
- `status_triagem` = Classificado/Desclassificado
- `data_hora_triagem` = timestamp
- `analista_triagem` = email do analista
- `documento_1` a `documento_5` = conforme/nao_conforme/nao_se_aplica
- `capacidade_tecnica`, `experiencia`, `pontuacao_total` (apenas classificados)
- `observacoes_triagem`

#### 3.3 Triagem Rápida (Botões)
- **Classificar** → Chama `updateCandidateStatus(CPF, 'Classificado')`
- **Desclassificar** → Abre modal para escolher motivo
- **Revisar** → Marca para revisão posterior

---

### FASE 4: ENVIO DE MENSAGENS

**Frontend:** `MessagingModal.tsx` → **Service:** `googleSheets.ts` → **Backend:** `sendMessages()` + `updateMessageStatus()`

**Fluxo:**
1. Admin/Analista seleciona candidatos
2. Abre modal de mensagens
3. Escolhe:
   - Tipo: Email ou SMS
   - Template (carrega de `TEMPLATES`)
   - Alias de email (carrega de `ALIAS`) - obrigatório para emails
   - Assunto (apenas email)
   - Conteúdo (variáveis: [NOME], [CARGO], [AREA])
4. Clica em "Enviar"
5. Sistema:
   - Chama `sendMessages()` para enviar
   - Registra na aba `MENSAGENS`
   - **Chama `updateMessageStatus()`** para marcar:
     - `email_sent` = 'Sim' (se email)
     - `sms_sent` = 'Sim' (se SMS)

---

### FASE 5: ALOCAÇÃO PARA ENTREVISTA

**Frontend:** `ClassifiedCandidatesList.tsx` → `InterviewCandidatesList.tsx` → **Backend:** `moveToInterview()` + `allocateToInterviewer()`

**Fluxo:**
1. Admin vê lista de **Classificados** (status_triagem = 'Classificado')
2. Seleciona candidatos
3. Clica em "Mover para Entrevista"
4. Script atualiza:
   - `status_entrevista` = 'Aguardando Entrevista'

5. Na aba **Entrevista**, Admin:
   - Vê candidatos com status 'Aguardando Entrevista'
   - Seleciona candidatos
   - Escolhe entrevistador
   - Clica em "Alocar"

6. Script atualiza:
   - `entrevistador` = email do entrevistador
   - `entrevistador_by` = email do admin
   - `entrevistador_at` = timestamp
   - `status_entrevista` = 'Em Entrevista'

---

### FASE 6: ENTREVISTA

**Frontend:** `InterviewerDashboard.tsx` → `InterviewEvaluationForm.tsx` → **Backend:** `saveInterviewEvaluation()`

**Fluxo:**
1. Entrevistador vê lista de candidatos alocados para ele
2. Clica em "Avaliar"
3. Formulário com 12 critérios (0-10 pontos cada):
   - **Formação (30 pontos max)**
     - Formação adequada ao cargo (10)
     - Graduações e competências (10)
     - Descrição de processos (10)

   - **Comunicação (30 pontos max)**
     - Terminologia técnica (10)
     - Calma e clareza (10)
     - Escalas flexíveis (10)

   - **Adaptabilidade (30 pontos max)**
     - Adaptabilidade a mudanças (10)
     - Ajustes de emergência (10)
     - Residência (10)

   - **Trabalho em Equipe (30 pontos max)**
     - Resolução de conflitos (10)
     - Colaboração em equipe (10)
     - Adaptação a perfis (10)

4. **Total máximo:** 120 pontos
5. Campo de observações
6. Resultado: Classificado/Desclassificado

7. Sistema salva:
   - Todas as pontuações individuais
   - `interview_score` = soma total
   - `interview_result` = Classificado/Desclassificado
   - `interview_notes` = observações
   - `interview_completed_at` = timestamp
   - `status_entrevista` = 'Entrevista Concluída'

---

### FASE 7: RELATÓRIOS

**Frontend:** `ReportsPage.tsx` → **Service:** `googleSheets.ts` → **Backend:** `getReport()` + `getReportStats()`

**Tipos de Relatórios:**

1. **Classificados - Triagem**
   - Filtro por analista
   - Colunas: Nome, CPF, Telefone, Cargo, PCD, Analista

2. **Desclassificados - Triagem**
   - Filtro por analista
   - Colunas: Nome, CPF, Telefone, Cargo, Motivo, PCD, Analista

3. **Classificados - Entrevista**
   - Filtro por entrevistador
   - Colunas: Nome, CPF, Telefone, Cargo, Pontuação, PCD, Entrevistador

4. **Desclassificados - Entrevista**
   - Filtro por entrevistador
   - Colunas: Nome, CPF, Telefone, Cargo, Pontuação, PCD, Entrevistador

**Exportação:**
- PDF (print)
- Excel (CSV)
- CSV

---

## 📊 ESTRUTURA DA PLANILHA GOOGLE SHEETS

### ABA: USUARIOS
```
Email | Nome | Role | Ativo | Password
```

### ABA: CANDIDATOS
```
CPF | NOMECOMPLETO | NOMESOCIAL | TELEFONE | EMAIL | CARGOPRETENDIDO |
VAGAPCD | AREAATUACAO | CURRICULOVITAE | DOCUMENTOSPESSOAIS |
DOCUMENTOSPROFISSIONAIS | DIPLOMACERTIFICADO | DOCUMENTOSCONSELHO |
ESPECIALIZACOESCURSOS | Status | assigned_to | assigned_by | assigned_at |
status_triagem | data_hora_triagem | analista_triagem |
documento_1 | documento_2 | documento_3 | documento_4 | documento_5 |
capacidade_tecnica | experiencia | pontuacao_total | observacoes_triagem |
motivo_desclassificacao | status_entrevista | entrevistador |
entrevistador_by | entrevistador_at | formacao_adequada | graduacoes_competencias |
descricao_processos | terminologia_tecnica | calma_clareza | escalas_flexiveis |
adaptabilidade_mudancas | ajustes_emergencia | residencia | resolucao_conflitos |
colaboracao_equipe | adaptacao_perfis | interview_score | interview_result |
interview_notes | interview_completed_at | email_sent | sms_sent |
created_at | updated_at
```

### ABA: MOTIVOS
```
id | motivo | descricao
```

### ABA: MENSAGENS
```
timestamp | registration_number | message_type | recipient | subject |
content | sent_by | status
```

### ABA: TEMPLATES
```
id | nome | tipo | assunto | conteudo
```

### ABA: ALIAS
```
email | nome | ativo
```

---

## 🔧 CONFIGURAÇÃO DO SISTEMA

### 1. Configurar Google Apps Script

1. Abra o Google Sheets com suas planilhas
2. Vá em **Extensões** → **Apps Script**
3. Cole TODO o conteúdo de `google-apps-script-OPERACIONAL-COMPLETO.js`
4. Na linha 18, altere o `SPREADSHEET_ID` para o ID da sua planilha
5. Salve o script
6. Clique em **Implantar** → **Nova implantação**
7. Escolha **Aplicativo da Web**
8. Configure:
   - Executar como: **Eu**
   - Quem tem acesso: **Qualquer pessoa**
9. Clique em **Implantar**
10. Copie a URL da Web App

### 2. Configurar Aplicação Frontend

1. No arquivo `.env` do projeto, adicione:
```
VITE_GOOGLE_SCRIPT_URL=URL_COPIADA_DO_PASSO_10
```

2. Execute:
```bash
npm install
npm run build
```

3. Deploy no Netlify:
```bash
netlify deploy --prod --dir=dist
```

---

## ✅ SISTEMA 100% OPERACIONAL

### Funcionalidades Implementadas:

✅ **Login** - Com validação de usuário e senha
✅ **Dashboard Admin** - Alocação, importação, visualização
✅ **Dashboard Analista** - Triagem completa com documentos e pontuação
✅ **Dashboard Entrevistador** - Avaliação com 12 critérios
✅ **Envio de Mensagens** - Email e SMS com templates e aliases
✅ **Relatórios** - 4 tipos com filtros e exportação
✅ **Listas Filtradas** - Classificados, Desclassificados, À Revisar, Entrevista

### Fluxo Completo:
1. **Import** → CSV/Excel para planilha
2. **Alocar** → Admin aloca para analista
3. **Triar** → Analista avalia documentos e capacidade técnica
4. **Enviar Mensagens** → Email/SMS para candidatos
5. **Mover para Entrevista** → Candidatos classificados
6. **Alocar Entrevistador** → Admin aloca para entrevista
7. **Entrevistar** → Entrevistador avalia 12 critérios
8. **Relatórios** → Exportar resultados com filtros

---

## 🐛 PROBLEMAS CORRIGIDOS

1. ✅ `getCandidatesByStatus()` não existia → **CRIADA**
2. ✅ `saveScreening()` não existia → **CRIADA**
3. ✅ `updateMessageStatus()` não atualizava planilha → **CORRIGIDA**
4. ✅ `getAnalysts()` retornava estrutura errada → **CORRIGIDA**
5. ✅ Correlação entre frontend e backend → **DOCUMENTADA**

---

## 📞 SUPORTE

Se alguma função não estiver funcionando:

1. Verifique os **logs do Google Apps Script**:
   - Extensões → Apps Script → Execuções

2. Verifique o **console do navegador** (F12):
   - Procure por erros em vermelho

3. Verifique se a **URL do script está correta** no `.env`

4. Verifique se todas as **abas da planilha existem**:
   - USUARIOS, CANDIDATOS, MOTIVOS, MENSAGENS, TEMPLATES, ALIAS

---

**Sistema 100% operacional e pronto para uso!** 🚀
