const TOPICS = [
  'calvin','joy','tarigan','cjoyy','chevin',
  'universitas indonesia','ui','fasilkom','computer science',
  'machine learning','deep learning','reinforcement learning',
  'pytorch','tensorflow','scikit-learn','lstm','rnn','neural network',
  'pca','k-means','smote','classification','regression','forecasting',
  'python','java','javascript','typescript','spring boot','django',
  'next.js','rest api','docker','kubernetes','postgresql','git',
  'full stack','backend','frontend','web',
  'vacuum cleaning','mdp','idx','ufc','fight analytics',
  'support agent','ops agent','langgraph','smart garden','esp32',
  'little margo','rewear plus','healthmate','eventsphere','sizopi','dinepasar',
  'hackathon','nusawallet',
  'teaching assistant','coordinator','mentor','programming fundamentals',
  'software security','discrete mathematics','bem fasilkom',
  'email','linkedin','github','kaggle','phone','contact',
  'coursera','deeplearning.ai','credential','certification',
  'bakti bca','bank indonesia','genbi','scholarship',
  'depok','indonesia',
  'experience','project','skills','portfolio','resume','cv',
  'internship','collaboration','open source','freelance','data science',
  'ml engineer','ai builder','student',
];

const SYSTEM_PROMPT = `You are CalvinBot, an AI assistant for Calvin Joy Tarigan's portfolio. Answer ONLY from the info below.

BIO: Calvin Joy Tarigan — ML Engineer, AI Builder. CS student at Universitas Indonesia (2023-2027).

SKILLS: PyTorch, TensorFlow, scikit-learn, Python, Java, TS, Spring Boot, Django, Next.js, Docker, K8s, PostgreSQL, RL, PCA, K-Means, SMOTE.

PROJECTS:
- Vacuum Cleaning Robots MDP (2026): RL framework in Python
- IDX Multi-Asset Forecasting (2026): Custom RNN/LSTM in PyTorch
- UFC Fight Analytics (2025): End-to-end ML pipeline
- Support Agent (2026): No-framework AI agent with Gemini API
- Ops Agent (2026): Multi-agent system with LangGraph
- Smart Garden (2026): IoT plant care (ESP32, FreeRTOS)
- Little Margo Catapult (2026): Community website
- Rewear Plus (2026): Sustainable fashion web platform
- HealthMate (2025): Healthcare mgmt with K8s
- EventSphere (2025): Spring Boot + Next.js event platform
- SIZOPI (2025): Django zoo mgmt system
- Dinepasar (2024): Bali restaurant discovery platform

EXPERIENCE:
- TA: Intro to Software Security (Jan 2026-Present)
- Coordinator TA: Discrete Math 1 (Aug 2025-Jan 2026)
- Programming Mentor (Apr 2024-Sep 2024)
- Staff Sports Dept, BEM Fasilkom UI (Jan 2024-Dec 2024)

EDUCATION: Universitas Indonesia, Bachelor of CS. Scholarships: BAKTI BCA 2025, Bank Indonesia (GenBI) 2026.

CERTS: Supervised ML (DeepLearning.AI), Custom TF Models (DeepLearning.AI) — May 2026.

CONTACT: joycalvin1604@gmail.com | linkedin.com/in/calvin-joy-tarigan | github.com/cjoyy | kaggle.com/chevin77 | Depok, Indonesia.

LANGUAGES: Indonesian (Native), English (Professional).

Keep answers 2-3 sentences, friendly, concise.`;

function isRelevant(q) {
  if (q.length < 3) return false;
  for (const t of TOPICS) { if (q.includes(t)) return true; }
  const words = q.split(/\s+/).filter(w => w.length > 2);
  const topicWords = new Set(TOPICS.flatMap(t => t.split(/\s+/)));
  return words.filter(w => topicWords.has(w)).length >= 2;
}

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const key = `rl:${ip}`;

    // Rate limit check via env counter (per-worker in-memory fallback)
    const now = Date.now();
    const rlData = await env.CHAT_KV?.get(key, 'json').catch(() => null) || {};
    if (rlData.count && now - rlData.start < 60000) {
      if (rlData.count >= 10) {
        return new Response(JSON.stringify({ fromAI: false, answer: 'Too fast — wait a minute and try again!' }), {
          status: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      rlData.count++;
    } else {
      rlData.count = 1;
      rlData.start = now;
    }
    if (env.CHAT_KV) await env.CHAT_KV.put(key, JSON.stringify(rlData), { expirationTtl: 120 }).catch(() => {});

    const { question } = await request.json().catch(() => ({}));
    if (!question || typeof question !== 'string' || !question.trim()) {
      return new Response(JSON.stringify({ fromAI: false, answer: 'Please ask a question.' }), {
        status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!isRelevant(question.toLowerCase().trim())) {
      return new Response(JSON.stringify({
        fromAI: false,
        answer: "That's outside what I can answer — try asking about Calvin's projects, skills, experience, or contact info!",
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const keyGemini = env.GEMINI_API_KEY;
    if (!keyGemini) {
      return new Response(JSON.stringify({ fromAI: false, answer: 'AI service not configured.' }), {
        status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    try {
      const body = {
        contents: [{ role: 'user', parts: [{ text: question }] }],
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: { temperature: 0.3, maxOutputTokens: 200 },
      };

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${keyGemini}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      );

      const data = await res.json();
      const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text
        || 'Sorry, could not generate an answer.';

      return new Response(JSON.stringify({ fromAI: true, answer }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (err) {
      return new Response(JSON.stringify({ fromAI: false, answer: 'AI service unavailable — try again later.' }), {
        status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  },
};
