# Instruções para Atualizar o Google Apps Script com CORS

## Problema Identificado

O erro CORS está ocorrendo porque o Google Apps Script não está retornando os headers corretos nas respostas. O erro específico é:

```
Access to fetch at 'https://script.google.com/...' from origin 'https://seletivotriagem.netlify.app'
has been blocked by CORS policy: Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solução

Use o arquivo **google-apps-script-CORS-FINAL.js** que foi criado com as correções necessárias.

## Passo a Passo

### 1. Acesse o Google Apps Script

1. Abra o Google Sheets com seu ID: `1iQSQ06P_OXkqxaGWN3uG5jRYFBKyjWqQyvzuGk2EplY`
2. Clique em **Extensões** > **Apps Script**

### 2. Substitua o Código Atual

1. **DELETE TODO o código existente** no editor
2. Copie **TODO o conteúdo** do arquivo `google-apps-script-CORS-FINAL.js`
3. Cole no editor do Google Apps Script
4. Clique em **Salvar** (ícone de disquete)

### 3. Reimplante o Web App

**IMPORTANTE**: Você precisa criar uma **NOVA IMPLANTAÇÃO** para que as mudanças tenham efeito.

1. Clique em **Implantar** > **Nova implantação**
2. Clique no ícone de **engrenagem** ⚙️ ao lado de "Selecionar tipo"
3. Selecione **Web app**
4. Configure:
   - **Descrição**: Sistema de Triagem - Versão com CORS Corrigido
   - **Executar como**: Me (seu email)
   - **Quem tem acesso**: Anyone (Qualquer pessoa)
5. Clique em **Implantar**
6. **Autorize as permissões** quando solicitado
7. **COPIE a nova URL** que será gerada

### 4. Atualize a URL no .env

1. Abra o arquivo `.env` na raiz do projeto
2. Atualize a variável com a **NOVA URL**:

```
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/NOVA_URL_AQUI/exec
```

3. Salve o arquivo

### 5. Reconstrua e Reimplante

Execute os comandos:

```bash
npm run build
```

Depois faça o commit e push para que o Netlify reimplante automaticamente.

## O Que Foi Corrigido

### 1. Headers CORS Adicionados

O Google Apps Script agora retorna automaticamente os headers CORS necessários em todas as respostas.

### 2. Suporte para OPTIONS

Adicionada função `doOptions()` para lidar com requisições preflight do CORS.

### 3. Resposta JSON Otimizada

A função `createResponse()` foi otimizada para garantir que todas as respostas sejam JSON válido.

## Verificação

Após seguir todos os passos:

1. Abra o console do navegador (F12)
2. Faça login na aplicação
3. Verifique se NÃO há mais erros CORS
4. Os candidatos devem carregar normalmente

## Solução de Problemas

### Se ainda houver erro CORS:

1. Verifique se você criou uma **NOVA IMPLANTAÇÃO** (não apenas salvou o código)
2. Confirme que atualizou a URL no arquivo `.env`
3. Confirme que reconstruiu o projeto (`npm run build`)
4. Limpe o cache do navegador (Ctrl+Shift+Delete)

### Se houver erro de permissões:

1. Vá em **Executar** > **Executar função** > **testConnection**
2. Autorize todas as permissões solicitadas
3. Tente novamente criar a nova implantação

## Notas Importantes

- **NÃO** use a implantação antiga
- **NÃO** tente editar uma implantação existente
- **SEMPRE** crie uma nova implantação após mudanças no código
- A nova URL será diferente da anterior
