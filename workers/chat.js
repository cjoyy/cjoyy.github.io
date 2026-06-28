const TOPICS = [
  'calvin','joy','tarigan','cjoyy','chevin',
  'universitas indonesia','ui','fasilkom','computer science',
  'machine learning','deep learning','reinforcement learning',
  'pytorch','tensorflow','scikit-learn','lstm','rnn','gru','tcn','neural network',
  'pca','k-means','smote','classification','regression','forecasting','ablation',
  'python','java','javascript','typescript','spring boot','django','next.js',
  'rest api','docker','kubernetes','postgresql','git','gitlab','github actions',
  'full stack','backend','frontend','web','mobile','flutter','react native',
  'vacuum cleaning','mdp','gym','stable-baselines3','idx','forecasting',
  'support agent','ops agent','langgraph','chromadb','rag','gemini',
  'smart garden','esp32','xmega','trashmate','uiux','ux research',
  'sisidang','court scheduling','jira','sonarqube','owasp',
  'little margo','catapult','umkm',
  'rewear','rewear+','fashion marketplace',
  'eventsphere','healthmate','sizopi','zoo management','dinepasar',
  'agentveil','polkavm','zk proofs','polkadot','protocol design',
  'nusawallet','multicurrency','hackathon digdaya',
  'teaching assistant','coordinator','mentor','programming fundamentals',
  'software security','discrete mathematics','bem fasilkom',
  'email','linkedin','github','kaggle','contact',
  'coursera','deeplearning.ai','credential','certification',
  'bakti bca','bank indonesia','genbi','scholarship',
  'depok','indonesia',
  'experience','project','skills','portfolio','resume','cv',
  'internship','collaboration','open source','freelance','data science',
  'ai/ml','software engineer','student','silver medal','competition',
];

const SYSTEM_PROMPT = `You are CBot, an AI assistant for Calvin Joy Tarigan's portfolio. Answer ONLY from the info below.

BIO: Calvin Joy Tarigan — AI/ML & Software Engineer. CS student at Universitas Indonesia (2023-2027). cjoyy.dev.

SKILLS: PyTorch, TensorFlow, scikit-learn, Python, Java, TypeScript, Spring Boot, Django, Next.js, Docker, K8s, PostgreSQL, GitLab CI/CD, Jira, LangGraph, Gemini API, ChromaDB, Flutter, React Native.

PROJECTS:
- Support Agent (2026): AI customer support agent built from scratch with native tool-calling loop, RAG via ChromaDB and Voyage AI embeddings, 4 tool functions with guardrails. 85.7% tool-call success rate. Circuit-breaker failover to Groq. CI/CD with 13 pytest cases, Docker, deployed on Hugging Face Spaces.
- Ops Agent (2026): Multi-agent orchestration with LangGraph (supervisor/router pattern). HITL approval, RAG runbook retrieval, persistent checkpointing. 90% routing accuracy on 30-ticket benchmark.
- IDX Multi-Asset Forecasting (2026): End-to-end DL pipeline forecasting 15-min log returns for 100 Indonesian stocks. Compared GRU, LSTM, TCN architectures. Best 2-layer GRU: RMSE 0.006184. Systematic ablation studies.
- Vacuum Cleaning Robots MDP (2026): Gym-based RL framework benchmarking 6 algorithms (PPO, TRPO, DQN, A2C, SAC). PPO best: 89.6% clean-cell ratio, 71.7% success rate. LaTeX paper.
- AgentVeil (2026): Privacy-preserving decentralized payment protocol for AI agents using ZK proofs on PolkaVM. Confidential invoicing and verifiable payments on Polkadot.
- NusaWallet (2026): Semifinalist Hackathon Digdaya BI. Multi-currency mobile app for digital export services. Django + React Native (Expo) + Frankfurter FX API.
- Smart Garden (2025): Soil moisture monitoring on AVR XMEGA A3BU. ESP32-based soil moisture and automated lighting controller.
- Trashmate (2025): UI/UX research case study for integrated waste management. End-to-end: user research, persona, prototyping, usability evaluation.
- SiSidang (2026): University court-scheduling system. 7-member Scrum team, 4 sprints. Django/PostgreSQL + Next.js. Jira, GitLab CI/CD, SonarQube, New Relic, OWASP ZAP.
- Rewear+ (2026): Silver Medal — Ignite Future Fest. Business plan + Next.js/TypeScript prototype for fashion resale marketplace.
- Little Margo Catapult (2025): Company profile website for local UMKM. Next.js + TypeScript, deployed on Vercel.
- EventSphere (2025): Event management platform. Java Spring Boot backend + Next.js frontend + PostgreSQL.
- HealthMate (2025): Healthcare management. Django monolith + 2 microservices (OTP, verify). K8s deployment.
- SIZOPI (2025): Django zoo management system with PostgreSQL.
- Dinepasar (2024): Restaurant discovery in Denpasar. Django web + Flutter mobile.

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

    const keyGroq = env.GROQ_API_KEY;
    if (!keyGroq) {
      return new Response(JSON.stringify({ fromAI: false, answer: 'AI service not configured.' }), {
        status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    try {
      const body = {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: question },
        ],
        temperature: 0.3,
        max_tokens: 200,
      };

      const res = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${keyGroq}`,
          },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();
      const answer = data?.choices?.[0]?.message?.content
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
