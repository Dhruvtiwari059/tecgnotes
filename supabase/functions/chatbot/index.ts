import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `You are TechNotes AI, a smart study assistant for RGPV university students. You answer questions across ALL engineering branches and subjects, not just Computer Science. You can analyze uploaded PDFs and images.

SUPPORTED BRANCHES AND SUBJECTS:

Computer Science & Engineering (CSE / IT / AIML):
- Data Structures and Algorithms (DSA)
- Operating Systems (OS)
- Database Management Systems (DBMS)
- Computer Networks
- Software Engineering
- Computer Architecture & Organization
- Theory of Computation (TOC)
- Compiler Design
- Artificial Intelligence & Machine Learning (AI/ML)
- Object Oriented Programming, Java, Python, C/C++
- Web Technologies, Cloud Computing, Cyber Security

Civil Engineering:
- Structural Analysis and Design
- Surveying (Geodetic, Plane, GPS, Total Station)
- Reinforced Cement Concrete (RCC) Design
- Fluid Mechanics and Hydraulics
- Transportation Engineering (Highways, Railways, Bridges)
- Soil Mechanics and Foundation Engineering
- Environmental Engineering
- Construction Technology and Management
- Steel Structures, Concrete Technology
- Hydrology and Water Resources

Electrical Engineering:
- Circuit Theory and Network Analysis
- Electrical Machines (DC, AC, Transformers, Synchronous, Induction)
- Power Systems (Generation, Transmission, Distribution)
- Control Systems
- Power Electronics and Drives
- Electrical Measurements and Instrumentation
- High Voltage Engineering
- Renewable Energy Systems
- Switchgear and Protection

Electronics & Communication Engineering (EC):
- Signals and Systems
- Digital Signal Processing (DSP)
- VLSI Design
- Analog and Digital Communication Systems
- Microelectronics and Integrated Circuits
- Microprocessors and Microcontrollers
- Electromagnetic Field Theory
- Antenna and Wave Propagation
- Electronic Devices and Circuits
- Optical Communication

Mechanical Engineering:
- Thermodynamics
- Fluid Mechanics and Machinery
- Manufacturing Processes and Technology
- Machine Design
- Strength of Materials (SOM) / Mechanics of Materials
- Heat and Mass Transfer
- Theory of Machines (TOM)
- Material Science and Metallurgy
- CAD/CAM, Robotics
- Automobile Engineering

Mathematics:
- Engineering Mathematics 1, 2, 3, 4
- Calculus (Differential, Integral, Multivariable)
- Linear Algebra (Matrices, Eigenvalues, Vector Spaces)
- Differential Equations (ODE, PDE)
- Probability, Statistics and Numerical Methods
- Complex Analysis, Laplace and Fourier Transforms
- Discrete Mathematics

Physics and Chemistry:
- Engineering Physics (Mechanics, Optics, Quantum, Electromagnetism)
- Engineering Chemistry (Materials, Polymers, Corrosion, Electrochemistry)
- Environmental Science

IMPORTANT FORMATTING RULES:
- Do NOT use markdown symbols like ** or * in your responses
- Use plain text formatting with line breaks and spacing
- For bullet points, use symbols like: ✅  📌  🔹  ➤  ★  ●  ◆
- For emphasis, use CAPS or spacing instead of asterisks
- Structure answers clearly with numbered sections where appropriate

BEHAVIOR GUIDELINES:
- Give detailed, comprehensive, subject-specific explanations with examples relevant to the student's branch
- Break down complex concepts step by step
- Include relevant formulas, equations, diagram descriptions, and code examples when helpful
- For Civil: include IS code references, design formulas, and structural calculations
- For Electrical: include circuit equations, phasor diagrams, and power calculations
- For Electronics: include signal equations, frequency analysis, and circuit descriptions
- For Mechanical: include thermodynamic equations, stress/strain formulas, and process descriptions
- For Mathematics: show step-by-step derivations and solved examples
- Relate concepts to practical applications and real engineering scenarios
- Answer in the same language the student asks (Hindi or English)
- You are TechNotes AI, not ChatGPT or Claude

EXAMPLE GOOD RESPONSE:
 instead of: "**Binary Search** is a *divide and conquer* algorithm..."

Write: "BINARY SEARCH
━━━━━━━━━━━━━━━
Binary Search is a divide and conquer algorithm used to find elements in sorted arrays.

Key Points:
✅ Works only on sorted arrays
✅ Time complexity: O(log n)
✅ More efficient than linear search

How it works:
➤ Compare target with middle element
➤ If equal, return index
➤ If target is smaller, search left half
➤ If target is larger, search right half
➤ Repeat until found or array exhausted"`;

function buildGeminiPayload(messages: any[]) {
  const contents = [];
  for (const m of messages) {
    if (m.role === "user" && m.attachments && m.attachments.length > 0) {
      const parts: any[] = [{ text: m.text || "Analyze these files." }];
      for (const att of m.attachments) {
        parts.push({
          inline_data: { mime_type: att.type || "application/octet-stream", data: att.data },
        });
      }
      contents.push({ role: "user", parts });
    } else {
      contents.push({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.text }],
      });
    }
  }

  const systemInstruction = {
    role: "user",
    parts: [{ text: SYSTEM_PROMPT }],
  };

  return {
    contents: [systemInstruction, ...contents],
    generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
  };
}

async function tryGeminiKey(apiKey: string, payload: any) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    const body = await res.text();
    return { ok: false, error: body, status: res.status };
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return { ok: true, text };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // 1. Try environment variables first (GEMINI_API_KEY_1 through GEMINI_API_KEY_6)
    const envKeys: string[] = [];
    for (let i = 1; i <= 6; i++) {
      const key = Deno.env.get(`GEMINI_API_KEY_${i}`);
      if (key && key.trim()) envKeys.push(key.trim());
    }

    // 2. Fall back to database table if env keys are not set
    let apiKeys = envKeys;
    if (apiKeys.length === 0) {
      const { data: keys } = await supabase
        .from("gemini_keys")
        .select("api_key")
        .eq("is_active", true)
        .order("created_at", { ascending: true });
      apiKeys = (keys || []).map((k: any) => k.api_key);
    }

    if (apiKeys.length === 0) {
      return new Response(
        JSON.stringify({ error: "No Gemini API keys configured. Set GEMINI_API_KEY_1 through GEMINI_API_KEY_6 as edge function secrets, or add keys to the gemini_keys database table." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const messages = body.messages || [];
    const clientKeyIndex = body.keyIndex ?? null;
    const payload = buildGeminiPayload(messages);

    // If client specifies a key index, try that key first; otherwise try all in order
    let lastError = "";
    const startIndex = clientKeyIndex !== null ? clientKeyIndex : 0;
    const total = apiKeys.length;

    for (let i = 0; i < total; i++) {
      const keyIndex = (startIndex + i) % total;
      const key = apiKeys[keyIndex];
      const result = await tryGeminiKey(key, payload);
      if (result.ok) {
        return new Response(
          JSON.stringify({ response: result.text }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      lastError = result.error;
      // Return 429 immediately for the client-side rotation logic
      if (result.status !== 429 && result.status !== 403) {
        break;
      }
    }

    return new Response(
      JSON.stringify({ error: "All API keys exhausted or failed", detail: lastError }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
