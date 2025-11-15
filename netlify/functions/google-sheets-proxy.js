exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz6BmO1rhI8LTRNzakiQ8ryL1cO2tAaNSFfWx9fh0ZFHqZ0b2FgW4WJxg19B8VC5WkH/exec';

    let action, data;

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      action = body.action;
      data = body.data;
    } else {
      action = event.queryStringParameters?.action;
      const dataParam = event.queryStringParameters?.data;
      data = dataParam ? JSON.parse(dataParam) : null;
    }

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, data })
    });

    const result = await response.text();

    return {
      statusCode: 200,
      headers,
      body: result
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
