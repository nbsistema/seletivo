/*
  # Add Screening and Messaging System

  ## Tables Created
  1. disqualification_reasons - Motivos de desclassificação
  2. messages_templates - Templates de mensagens (SMS e Email)
  3. candidates_messages - Histórico de mensagens enviadas

  ## Modifications to Candidates Table
  - status_triagem: 'Classificado', 'Desclassificado', 'Revisar'
  - disqualification_reason_id: Motivo da desclassificação
  - screening_notes: Observações da triagem
  - screened_by: Analista que fez a triagem
  - screened_at: Data/hora da triagem

  ## Security
  - RLS habilitado em todas as tabelas
  - Políticas de acesso para usuários autenticados
*/

-- Tabela de motivos de desclassificação
CREATE TABLE IF NOT EXISTS disqualification_reasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reason text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE disqualification_reasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view disqualification reasons"
  ON disqualification_reasons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage disqualification reasons"
  ON disqualification_reasons FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- Tabela de templates de mensagens
CREATE TABLE IF NOT EXISTS messages_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL,
  message_type text NOT NULL CHECK (message_type IN ('sms', 'email')),
  subject text,
  content text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE messages_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view message templates"
  ON messages_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage message templates"
  ON messages_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- Tabela de mensagens enviadas
CREATE TABLE IF NOT EXISTS candidates_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  message_type text NOT NULL CHECK (message_type IN ('sms', 'email')),
  recipient text NOT NULL,
  subject text,
  content text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  sent_by uuid REFERENCES users(id),
  status text DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'failed'))
);

ALTER TABLE candidates_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage messages"
  ON candidates_messages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Adicionar colunas de triagem na tabela candidates
ALTER TABLE candidates
  ADD COLUMN IF NOT EXISTS status_triagem text CHECK (status_triagem IN ('Classificado', 'Desclassificado', 'Revisar')),
  ADD COLUMN IF NOT EXISTS disqualification_reason_id uuid REFERENCES disqualification_reasons(id),
  ADD COLUMN IF NOT EXISTS screening_notes text,
  ADD COLUMN IF NOT EXISTS screened_by uuid REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS screened_at timestamptz;

-- Inserir motivos padrão de desclassificação
INSERT INTO disqualification_reasons (reason, is_active) VALUES
  ('Documentação incompleta', true),
  ('Não atende aos requisitos mínimos da vaga', true),
  ('Formação incompatível com a vaga', true),
  ('Experiência insuficiente', true),
  ('Documentos ilegíveis ou com qualidade inadequada', true),
  ('Dados inconsistentes ou contraditórios', true),
  ('Não apresentou documentos obrigatórios', true),
  ('Fora do prazo de inscrição', true),
  ('Outros motivos', true)
ON CONFLICT DO NOTHING;

-- Inserir templates padrão de mensagens
INSERT INTO messages_templates (template_name, message_type, subject, content, is_active) VALUES
  ('Classificado - Email', 'email', 'Processo Seletivo - Você foi classificado!', 
   'Prezado(a) [NOME],\n\nParabéns! Você foi classificado(a) no processo seletivo para a vaga de [CARGO] na área [AREA].\n\nEm breve entraremos em contato com informações sobre as próximas etapas do processo.\n\nAtenciosamente,\nEquipe de Recrutamento e Seleção', 
   true),
  ('Classificado - SMS', 'sms', NULL, 
   'Parabéns [NOME]! Você foi classificado no processo seletivo para [CARGO]. Aguarde contato para próximas etapas.', 
   true),
  ('Desclassificado - Email', 'email', 'Processo Seletivo - Resultado da Análise', 
   'Prezado(a) [NOME],\n\nAgradecemos seu interesse em fazer parte da nossa equipe.\n\nInfelizmente, nesta etapa do processo seletivo, seu perfil não foi selecionado para a vaga de [CARGO].\n\nDesejamos muito sucesso em sua jornada profissional.\n\nAtenciosamente,\nEquipe de Recrutamento e Seleção', 
   true),
  ('Em Revisão - Email', 'email', 'Processo Seletivo - Análise em Andamento', 
   'Prezado(a) [NOME],\n\nSeu cadastro para a vaga de [CARGO] está sendo revisado pela nossa equipe de análise.\n\nEm breve daremos retorno sobre o andamento do seu processo seletivo.\n\nAtenciosamente,\nEquipe de Recrutamento e Seleção', 
   true)
ON CONFLICT DO NOTHING;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_candidates_status_triagem ON candidates(status_triagem);
CREATE INDEX IF NOT EXISTS idx_candidates_screened_by ON candidates(screened_by);
CREATE INDEX IF NOT EXISTS idx_candidates_screened_at ON candidates(screened_at);
CREATE INDEX IF NOT EXISTS idx_candidates_messages_candidate_id ON candidates_messages(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidates_messages_sent_at ON candidates_messages(sent_at);