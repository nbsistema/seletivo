import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  to: string;
  subject: string;
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
    const { to, subject, content, candidateId, sentBy }: EmailRequest = await req.json();

    console.log('📧 Enviando email para:', to);
    console.log('📝 Assunto:', subject);

    if (!to || !subject || !content) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email, assunto e conteúdo são obrigatórios",
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

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Formato de email inválido",
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

    // Usar Resend para enviar o email
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY não configurada");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Serviço de email não configurado",
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

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Processo Seletivo <noreply@seudominio.com>",
        to: [to],
        subject: subject,
        html: content.replace(/\n/g, "<br>"),
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      console.error("❌ Erro ao enviar email via Resend:", error);
      throw new Error(`Erro ao enviar email: ${error}`);
    }

    const resendData = await resendResponse.json();
    console.log("✅ Email enviado com sucesso:", resendData);

    // Registrar no Google Sheets
    const GOOGLE_SCRIPT_URL = Deno.env.get("GOOGLE_SCRIPT_URL");

    if (GOOGLE_SCRIPT_URL) {
      const params = new URLSearchParams({
        action: "logMessage",
        registrationNumber: candidateId,
        messageType: "email",
        recipient: to,
        subject: subject,
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
        message: "Email enviado com sucesso",
        messageId: resendData.id,
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
        error: error instanceof Error ? error.message : "Erro ao enviar email",
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
