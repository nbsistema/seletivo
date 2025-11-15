const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Lidar com preflight CORS
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
    
    // Parse do body baseado no método
    if (event.httpMethod === 'POST' && event.body) {
      try {
        requestBody = JSON.parse(event.body);
      } catch (parseError) {
        console.error('Erro ao parsear body:', parseError);
      }
    } else if (event.httpMethod === 'GET') {
      // Para GET, usar query parameters
      requestBody = event.queryStringParameters || {};
    }

    console.log('📤 Forwarding request to Google Script:', {
      action: requestBody.action,
      method: event.httpMethod
    });

    // Fazer a requisição para o Google Apps Script
    const googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST', // Sempre POST para o Google Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: requestBody.action,
        data: requestBody.data || null,
        // Incluir todos os parâmetros adicionais
        ...requestBody
      })
    });

    if (!googleResponse.ok) {
      throw new Error(`Google Script returned ${googleResponse.status}: ${googleResponse.statusText}`);
    }

    const resultText = await googleResponse.text();
    
    let resultData;
    try {
      resultData = JSON.parse(resultText);
    } catch (e) {
      // Se não for JSON, retornar como texto
      resultData = { response: resultText };
    }

    console.log('✅ Resposta recebida do Google Script');

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
        error: 'Erro na comunicação com o Google Apps Script',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};
