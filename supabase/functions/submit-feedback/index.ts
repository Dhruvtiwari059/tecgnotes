import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface FeedbackRequest {
  name: string;
  email?: string;
  message: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Parse request body
    const body: FeedbackRequest = await req.json();
    const { name, email, message } = body;

    if (!name?.trim() || !message?.trim()) {
      return new Response(
        JSON.stringify({ error: "Name and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                     req.headers.get("x-real-ip") ||
                     "unknown";

    // Check rate limit: max 5 submissions per IP per day
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const countResponse = await fetch(
      `${supabaseUrl}/rest/v1/feedback?select=id&ip_address=eq.${encodeURIComponent(clientIP)}&created_at=gte.${oneDayAgo}`,
      {
        headers: {
          "apikey": supabaseServiceKey,
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const existingFeedback = await countResponse.json();
    if (Array.isArray(existingFeedback) && existingFeedback.length >= 5) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please try again tomorrow.",
          message: "You have reached the maximum number of feedback submissions for today."
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert feedback
    const insertResponse = await fetch(
      `${supabaseUrl}/rest/v1/feedback`,
      {
        method: "POST",
        headers: {
          "apikey": supabaseServiceKey,
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email?.trim() || null,
          message: message.trim(),
          ip_address: clientIP,
          user_agent: req.headers.get("user-agent") || null,
        }),
      }
    );

    if (!insertResponse.ok) {
      const error = await insertResponse.text();
      console.error("Insert error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to submit feedback" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
