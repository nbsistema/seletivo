const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Configuração CORS para preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: ''
    };
  }

  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz6BmO1rhI8LTRNzakiQ8ryL1cO2tAaNSFfWx9fh0ZFHqZ0b2FgW4WJxg19B8VC5WkH/exec';
  
  try {
    let requestBody = {};
    
    // Parse do body baseado no método HTTP
    if (event.httpMethod === 'POST' && event.body) {
      try {
        requestBody = JSON.parse(event.body);
      } catch (parseError) {
        console.error('❌ Erro ao parsear body:', parseError);
        return errorResponse('Formato JSON inválido no body');
      }
    } else if (event.httpMethod === 'GET') {
      // Para GET, usar query parameters
      requestBody = event.queryStringParameters || {};
    }

    const action = requestBody.action;
    
    if (!action) {
      return errorResponse('Parâmetro "action" é obrigatório');
    }

    console.log('📤 Proxy - Ação:', action, 'Método:', event.httpMethod);

    // Preparar dados para o Google Apps Script
    const payload = {
      action: action
    };

    // Incluir todos os outros parâmetros (exceto action)
    Object.keys(requestBody).forEach(key => {
      if (key !== 'action') {
        payload[key] = requestBody[key];
      }
    });

    // Fazer a requisição para o Google Apps Script
    const googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST', // Sempre POST para o Google Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!googleResponse.ok) {
      throw new Error(`Google Script retornou ${googleResponse.status}: ${googleResponse.statusText}`);
    }

    const resultText = await googleResponse.text();
    
    let resultData;
    try {
      resultData = JSON.parse(resultText);
    } catch (e) {
      // Se não for JSON válido, retornar como texto
      console.warn('⚠️ Resposta não é JSON válido, retornando como texto');
      resultData = { response: resultText };
    }

    console.log('✅ Proxy - Resposta recebida para ação:', action);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resultData)
    };

  } catch (error) {
    console.error('❌ Erro no proxy:', error);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Erro na comunicação com o Google Apps Script',
        message: error.message
      })
    };
  }
};

function errorResponse(message) {
  return {
    statusCode: 400,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: false,
      error: message
    })
  };
}
