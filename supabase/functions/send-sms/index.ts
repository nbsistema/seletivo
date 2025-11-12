import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SMSRequest {
  to: string;
  content: string;
  candidateId: string;
  sentBy: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { to, content, candidateId, sentBy }: SMSRequest = await req.json();

    console.log('📱 Enviando SMS para:', to);
    console.log('📝 Conteúdo:', content);

    if (!to || !content) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Telefone e conteúdo são obrigatórios",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Obter credenciais do Twilio
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error("❌ Credenciais do Twilio não configuradas");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Serviço de SMS não configurado",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Formatar número de telefone para o padrão E.164 (+55XXXXXXXXXXX)
    let formattedPhone = to.replace(/\D/g, ""); // Remove tudo que não é dígito

    // Adicionar código do Brasil se não tiver
    if (!formattedPhone.startsWith("55")) {
      formattedPhone = "55" + formattedPhone;
    }

    // Adicionar o sinal de + no início
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+" + formattedPhone;
    }

    console.log('📱 Número formatado:', formattedPhone);

    // Validar número (deve ter 13 dígitos: +55 + DDD (2) + número (9))
    if (formattedPhone.length < 12 || formattedPhone.length > 14) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Formato de telefone inválido. Use: (XX) XXXXX-XXXX ou XXXXXXXXXXX",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Criar autenticação Basic para Twilio
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    // Enviar SMS via Twilio API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    const formData = new URLSearchParams({
      To: formattedPhone,
      From: TWILIO_PHONE_NUMBER,
      Body: content,
    });

    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
      body: formData.toString(),
    });

    if (!twilioResponse.ok) {
      const error = await twilioResponse.text();
      console.error("❌ Erro ao enviar SMS via Twilio:", error);
      throw new Error(`Erro ao enviar SMS: ${error}`);
    }

    const twilioData = await twilioResponse.json();
    console.log("✅ SMS enviado com sucesso:", twilioData.sid);

    // Registrar no Google Sheets
    const GOOGLE_SCRIPT_URL = Deno.env.get("GOOGLE_SCRIPT_URL");

    if (GOOGLE_SCRIPT_URL) {
      const params = new URLSearchParams({
        action: "logMessage",
        registrationNumber: candidateId,
        messageType: "sms",
        recipient: to,
        subject: "",
        content: content,
        sentBy: sentBy,
      });

      const logResponse = await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`, {
        method: "GET",
      });

      if (logResponse.ok) {
        console.log("✅ Mensagem registrada no Google Sheets");
      } else {
        console.warn("⚠️ Falha ao registrar mensagem no Google Sheets");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "SMS enviado com sucesso",
        messageSid: twilioData.sid,
        status: twilioData.status,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("❌ Erro ao processar requisição:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Erro ao enviar SMS",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
