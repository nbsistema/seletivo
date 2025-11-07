import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwRZ7vLEm4n8iha2GJSnIfCEjhHejRLme-OkIkp_qu6/dev';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const params = url.searchParams;
    
    const scriptUrl = new URL(SCRIPT_URL);
    params.forEach((value, key) => {
      scriptUrl.searchParams.append(key, value);
    });

    const response = await fetch(scriptUrl.toString(), {
      method: 'GET',
      redirect: 'follow'
    });

    const data = await response.text();
    
    return new Response(data, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erro ao chamar Google Apps Script:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao comunicar com o servidor' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
