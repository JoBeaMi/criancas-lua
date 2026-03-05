import { useState, useEffect, useCallback, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════
// "CRIANÇAS NO MUNDO DA LUA?" — App de Rastreio
// CAIDI · Centro de Apoio e Intervenção no Desenvolvimento Infantil
// ═══════════════════════════════════════════════════════════════

// ─── DADOS DO INSTRUMENTO ────────────────────────────────────

const LIKERT_LABELS = ["Nunca", "Raramente", "Frequentemente", "Sempre"];
const LIKERT_VALUES = [0, 1, 2, 3];

const IMPACT_LABELS = ["Sem impacto", "Impacto ligeiro", "Impacto moderado", "Impacto grave"];

const EFFICACY_LABELS = ["Nada capaz", "Pouco capaz", "Moderadamente capaz", "Bastante capaz", "Totalmente capaz"];

const ITEMS = {
  inattention: {
    label: "Desatenção",
    icon: "🔍",
    items: [
      "Distrai-se facilmente com estímulos irrelevantes (ruídos, movimentos de colegas)",
      "Tem dificuldade em manter a atenção em tarefas ou atividades prolongadas",
      "Parece não ouvir quando se lhe fala diretamente",
      "Não segue instruções até ao fim e não termina trabalhos",
      "Tem dificuldade em organizar tarefas e materiais",
      "Evita ou resiste a tarefas que exigem esforço mental sustentado",
      "Perde materiais necessários para as atividades (lápis, cadernos, fichas)",
    ],
  },
  hyperactivity: {
    label: "Hiperatividade / Impulsividade",
    icon: "⚡",
    items: [
      "Mexe-se excessivamente na cadeira ou levanta-se quando deveria estar sentado/a",
      "Corre ou trepa em situações inapropriadas",
      "Tem dificuldade em brincar ou realizar atividades calmamente",
      "Fala excessivamente",
      "Responde antes de a pergunta ser completada",
      "Tem dificuldade em esperar pela sua vez",
      "Interrompe ou intromete-se nas atividades dos outros",
    ],
  },
  comprehension: {
    label: "Compreensão de Instruções e Linguagem Académica",
    icon: "👂",
    items: [
      "Tem dificuldade em seguir instruções com mais de dois passos",
      "Necessita de exemplos concretos/demonstrações para compreender o que é pedido",
      "A compreensão melhora claramente quando a instrução é reformulada com linguagem mais simples",
      "Confunde relações temporais, causais ou condicionais (antes/depois, se…então, porque…)",
      "Tem dificuldade em compreender linguagem figurada ou expressões idiomáticas",
      "Parece «desligar» mas consegue realizar a tarefa quando vê um modelo/exemplo",
    ],
  },
  expression: {
    label: "Expressão Oral e Organização Verbal",
    icon: "💬",
    items: [
      "Tem dificuldade em explicar o que fez ou como resolveu uma tarefa",
      "Produz narrativas desorganizadas (salta passos, omite informação essencial)",
      "Usa vocabulário limitado ou impreciso para a idade",
      "Tem dificuldade em justificar respostas ou argumentar",
      "Utiliza poucos conectores (e depois… e depois…) em vez de estruturas mais complexas",
      "Sabe a resposta mas tem dificuldade em expressá-la verbalmente",
    ],
  },
  pragmatics: {
    label: "Pragmática e Uso Social da Linguagem",
    icon: "🤝",
    items: [
      "Interpreta mensagens de forma demasiado literal",
      "Tem dificuldade em compreender intenções implícitas (ironia, sarcasmo, indiretas)",
      "Tem dificuldade na gestão de turnos de conversa (por razões comunicativas, não impulsivas)",
      "Não adapta o discurso ao interlocutor ou contexto",
      "Tem dificuldade em manter o tópico de conversa",
    ],
  },
  impact: {
    label: "Impacto Funcional",
    icon: "📊",
    items: [
      "Impacto na aprendizagem académica",
      "Impacto nas relações com pares",
      "Impacto nas relações com adultos",
      "Impacto na autonomia nas tarefas",
      "Impacto na participação em atividades de grupo",
    ],
  },
};

const STRATEGIES_LIST = [
  { id: "s1", cat: "attention", text: "Instruções curtas, passo a passo" },
  { id: "s2", cat: "attention", text: "Confirmar compreensão (pedir para repetir)" },
  { id: "s3", cat: "attention", text: "Dividir tarefas em blocos pequenos" },
  { id: "s4", cat: "attention", text: "Supervisão frequente" },
  { id: "s5", cat: "attention", text: "Feedback imediato" },
  { id: "s6", cat: "hyperactivity", text: "Posicionamento estratégico na sala" },
  { id: "s7", cat: "hyperactivity", text: "Pausas motoras estruturadas" },
  { id: "s8", cat: "hyperactivity", text: "Sinais não-verbais combinados" },
  { id: "s9", cat: "hyperactivity", text: "Reforço positivo imediato e claro" },
  { id: "s10", cat: "hyperactivity", text: "Contrato comportamental simples" },
  { id: "s11", cat: "language", text: "Simplificar a linguagem utilizada" },
  { id: "s12", cat: "language", text: "Apoios visuais (imagens, esquemas)" },
  { id: "s13", cat: "language", text: "Repetição com reformulação" },
  { id: "s14", cat: "language", text: "Verificação ativa da compreensão" },
  { id: "s15", cat: "language", text: "Modelar estruturas frásicas" },
  { id: "s16", cat: "language", text: "Trabalhar sequenciação narrativa" },
];

const STRATEGY_FREQ = ["Nunca usei", "Raramente", "Às vezes", "Frequentemente"];

const VIGNETTES = [
  {
    id: "v1",
    title: "Caso A — O Miguel",
    text: `O Miguel tem 7 anos e está no 2.º ano. A professora diz que ele "está sempre no mundo da lua". Quando lhe dão instruções, parece não ouvir. Muitas vezes começa as tarefas de forma errada ou fica parado sem saber o que fazer. No entanto, quando a professora se senta ao lado dele e explica com frases mais curtas e exemplos concretos, o Miguel consegue realizar as tarefas. Nas conversas com os colegas, usa frases simples e tem dificuldade em contar o que fez no fim de semana de forma organizada. Os pais dizem que em casa "percebe tudo", mas na escola o desempenho é fraco.`,
    // Perfil predominantemente linguístico que "parece" desatenção
  },
  {
    id: "v2",
    title: "Caso B — A Leonor",
    text: `A Leonor tem 8 anos e está no 3.º ano. É muito irrequieta: levanta-se constantemente, fala sem parar e interrompe os colegas e a professora. Tem dificuldade em esperar pela sua vez e reage impulsivamente quando contrariada. No entanto, quando motivada por uma atividade do seu interesse, a Leonor expressa-se muito bem oralmente, conta histórias com detalhe e vocabulário rico, e compreende instruções complexas sem dificuldade. Consegue seguir conversas longas e percebe ironias e piadas. O problema principal é que não consegue estar parada e desorganiza o funcionamento da turma.`,
    // Perfil predominantemente PHDA com linguagem aparentemente adequada
  },
];

// ─── ALGORITMO DE PERFIL ─────────────────────────────────────

function computeProfile(responses) {
  const mean = (domain) => {
    const vals = (responses[domain] || []).filter((v) => v !== null && v !== undefined);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  const scores = {
    inattention: mean("inattention"),
    hyperactivity: mean("hyperactivity"),
    comprehension: mean("comprehension"),
    expression: mean("expression"),
    pragmatics: mean("pragmatics"),
    impact: mean("impact"),
  };

  scores.attention_total = (scores.inattention + scores.hyperactivity) / 2;
  scores.language_total = (scores.comprehension + scores.expression + scores.pragmatics) / 3;

  // Cut-offs (escala 0-3): ≥1.5 = zona de risco
  const ATT_CUT = 1.5;
  const LANG_CUT = 1.5;

  const attRisk = scores.attention_total >= ATT_CUT;
  const langRisk = scores.language_total >= LANG_CUT;

  let profile, profileColor, profileIcon;
  if (attRisk && langRisk) {
    profile = "Misto (Atenção + Linguagem)";
    profileColor = "#8B5CF6";
    profileIcon = "🔄";
  } else if (attRisk) {
    profile = "Predominância Atenção/Comportamento";
    profileColor = "#EF4444";
    profileIcon = "⚡";
  } else if (langRisk) {
    profile = "Predominância Linguagem";
    profileColor = "#3B82F6";
    profileIcon = "💬";
  } else {
    profile = "Risco Baixo";
    profileColor = "#10B981";
    profileIcon = "✅";
  }

  // Decisão de ação
  const maxScore = Math.max(scores.attention_total, scores.language_total);
  const impactHigh = scores.impact >= 2;
  let decision, decisionColor;

  if (maxScore >= 2.0 && impactHigh) {
    decision = "Encaminhar";
    decisionColor = "#DC2626";
  } else if (maxScore >= 1.5 || (maxScore >= 1.0 && impactHigh)) {
    decision = "Monitorizar";
    decisionColor = "#F59E0B";
  } else {
    decision = "Implementar estratégias e reavaliar";
    decisionColor = "#059669";
  }

  // Estratégias recomendadas
  const strategies = [];
  if (attRisk) {
    if (scores.inattention >= ATT_CUT) strategies.push(...STRATEGIES_LIST.filter((s) => s.cat === "attention"));
    if (scores.hyperactivity >= ATT_CUT) strategies.push(...STRATEGIES_LIST.filter((s) => s.cat === "hyperactivity"));
  }
  if (langRisk) {
    strategies.push(...STRATEGIES_LIST.filter((s) => s.cat === "language"));
  }
  if (strategies.length === 0) {
    strategies.push(...STRATEGIES_LIST.slice(0, 5));
  }

  return { scores, profile, profileColor, profileIcon, decision, decisionColor, strategies };
}

// ─── COMPONENTES UI ──────────────────────────────────────────

const colors = {
  bg: "#FAFAF8",
  surface: "#FFFFFF",
  surfaceAlt: "#F5F3EE",
  border: "#E8E4DC",
  borderFocus: "#7C9A92",
  primary: "#4A7C6F",
  primaryDark: "#3A6359",
  primaryLight: "#E8F0ED",
  accent: "#D4956A",
  accentLight: "#FDF0E7",
  text: "#2D3436",
  textMuted: "#6B7280",
  textLight: "#9CA3AF",
  danger: "#DC2626",
  warning: "#F59E0B",
  success: "#059669",
  info: "#3B82F6",
};

function LikertScale({ value, onChange, labels = LIKERT_LABELS }) {
  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
      {labels.map((label, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          style={{
            padding: "6px 14px",
            borderRadius: "20px",
            border: `1.5px solid ${value === i ? colors.primary : colors.border}`,
            background: value === i ? colors.primary : colors.surface,
            color: value === i ? "#fff" : colors.text,
            fontSize: "13px",
            fontWeight: value === i ? 600 : 400,
            cursor: "pointer",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function ItemBlock({ item, index, value, onChange, labels }) {
  return (
    <div
      style={{
        padding: "16px 20px",
        background: index % 2 === 0 ? colors.surface : colors.surfaceAlt,
        borderRadius: "10px",
        border: `1px solid ${colors.border}`,
        marginBottom: "8px",
      }}
    >
      <p style={{ fontSize: "14px", color: colors.text, marginBottom: "10px", lineHeight: 1.5 }}>
        <span style={{ color: colors.textMuted, fontWeight: 600, marginRight: "8px" }}>{index + 1}.</span>
        {item}
      </p>
      <LikertScale value={value} onChange={onChange} labels={labels} />
    </div>
  );
}

function SectionHeader({ icon, title, subtitle, count }) {
  return (
    <div style={{ marginBottom: "16px", paddingBottom: "12px", borderBottom: `2px solid ${colors.primary}` }}>
      <h3 style={{ fontSize: "18px", fontWeight: 700, color: colors.primaryDark, margin: 0 }}>
        {icon} {title}
        {count !== undefined && (
          <span style={{ fontSize: "13px", fontWeight: 400, color: colors.textMuted, marginLeft: "8px" }}>
            ({count} itens)
          </span>
        )}
      </h3>
      {subtitle && <p style={{ fontSize: "13px", color: colors.textMuted, marginTop: "4px" }}>{subtitle}</p>}
    </div>
  );
}

function ProgressBar({ current, total, label }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "12px", color: colors.textMuted, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: "12px", color: colors.primary, fontWeight: 600 }}>{pct}%</span>
      </div>
      <div style={{ height: "6px", background: colors.border, borderRadius: "3px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
            borderRadius: "3px",
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

function ScoreBar({ label, score, maxScore = 3, color }) {
  const pct = (score / maxScore) * 100;
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "13px", color: colors.text, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: "13px", fontWeight: 700, color }}>{score.toFixed(2)}</span>
      </div>
      <div style={{ height: "8px", background: colors.surfaceAlt, borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "4px", transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: colors.surface,
        borderRadius: "14px",
        border: `1px solid ${colors.border}`,
        padding: "24px",
        marginBottom: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Button({ children, onClick, variant = "primary", disabled = false, style = {} }) {
  const variants = {
    primary: { bg: colors.primary, color: "#fff", border: colors.primary },
    secondary: { bg: colors.surface, color: colors.primary, border: colors.primary },
    accent: { bg: colors.accent, color: "#fff", border: colors.accent },
    ghost: { bg: "transparent", color: colors.textMuted, border: "transparent" },
  };
  const v = variants[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 24px",
        borderRadius: "10px",
        border: `1.5px solid ${v.border}`,
        background: disabled ? colors.border : v.bg,
        color: disabled ? colors.textMuted : v.color,
        fontSize: "14px",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ─── PARTE 1: QUESTIONÁRIO DE INVESTIGAÇÃO ───────────────────

function ResearchQuestionnaire({ onComplete, teacherData, setTeacherData }) {
  const [step, setStep] = useState(0);
  const [demo, setDemo] = useState({
    distrito: "",
    cycle: "",
    yearsExp: "",
    age: "",
    gender: "",
    education: "",
    specialNeeds: "",
  });
  const [consent, setConsent] = useState(false);
  const [knowledge, setKnowledge] = useState(Array(16).fill(null));
  const [efficacy, setEfficacy] = useState(Array(5).fill(null));
  const [strategyUse, setStrategyUse] = useState({});
  const [vignetteResp, setVignetteResp] = useState({
    v1: { refer: null, referTo: "", hypothesis: "", strategies: "" },
    v2: { refer: null, referTo: "", hypothesis: "", strategies: "" },
  });

  // 16 itens V/F: 3 PHDA, 5 Linguagem, 8 Cruzados
  // Equilíbrio: 8 Verdadeiro, 8 Falso — ordem intercalada para evitar viés de resposta
  // Fontes: De Bree & van den Boer (2024), Rodrigues & Horta/Lourenço (2009),
  //         Méndez-Freije et al. (2024), Parks et al. (2024)
  const knowledgeVF = [
    { statement: "A PHDA é mais frequente nos rapazes do que nas raparigas.", correct: true, domain: "phda" },
    { statement: "A PHDA desaparece habitualmente na adolescência.", correct: false, domain: "phda" },
    { statement: "A maioria das crianças que começam a falar tarde (late talkers) acabam por desenvolver linguagem dentro dos parâmetros normais.", correct: true, domain: "lang" },
    { statement: "O excesso de tempo de ecrã (televisão, tablets) é uma causa direta da PHDA.", correct: false, domain: "phda" },
    { statement: "Crianças com perturbação da linguagem têm habitualmente uma inteligência abaixo da média.", correct: false, domain: "lang" },
    { statement: "Dificuldades de atenção e dificuldades de linguagem podem manifestar-se de forma semelhante em sala de aula.", correct: true, domain: "cross" },
    { statement: "Uma criança que não segue instruções na sala de aula tem necessariamente um problema de atenção.", correct: false, domain: "cross" },
    { statement: "A perturbação da linguagem é tão comum em idade escolar como a PHDA.", correct: true, domain: "lang" },
    { statement: "A PHDA e a perturbação da linguagem raramente coexistem na mesma criança.", correct: false, domain: "cross" },
    { statement: "A forma como uma criança responde a adaptações na sala de aula pode ajudar a distinguir entre dificuldades de atenção e de linguagem.", correct: true, domain: "cross" },
    { statement: "É aconselhável educar crianças com perturbação da linguagem apenas numa língua (monolingue).", correct: false, domain: "lang" },
    { statement: "Uma criança pode expressar-se bem oralmente e ainda assim ter uma perturbação da linguagem.", correct: true, domain: "cross" },
    { statement: "Uma perturbação da linguagem é geralmente identificada antes da entrada no 1.º ciclo.", correct: false, domain: "lang" },
    { statement: "Uma criança com bom vocabulário pode, ainda assim, ter uma perturbação da linguagem.", correct: true, domain: "cross" },
    { statement: "O treino de memória de trabalho é uma intervenção recomendada para melhorar as competências linguísticas.", correct: false, domain: "cross" },
    { statement: "Dificuldades na linguagem oral podem ser um fator de risco para dificuldades na leitura.", correct: true, domain: "cross" },
  ];

  const efficacyItems = [
    "Sinto-me capaz de gerir comportamentos de desatenção na sala",
    "Sinto-me capaz de adaptar a minha comunicação a crianças com dificuldades de linguagem",
    "Sinto-me capaz de implementar estratégias diferenciadas conforme o perfil da criança",
    "Sinto-me capaz de colaborar com outros profissionais (terapeutas, psicólogos) no apoio à criança",
    "Sinto-me capaz de monitorizar e avaliar a eficácia das estratégias que implemento",
  ];

  const steps = [
    { label: "Consentimento", icon: "✓" },
    { label: "Perfil", icon: "👤" },
    { label: "Conhecimento", icon: "📚" },
    { label: "Autoeficácia", icon: "💪" },
    { label: "Estratégias", icon: "🛠️" },
    { label: "Caso A", icon: "📖" },
    { label: "Caso B", icon: "📖" },
  ];

  const renderConsent = () => (
    <Card>
      <SectionHeader icon="🌙" title="Bem-vindo/a!" subtitle="" />
      <div
        style={{
          background: colors.primaryLight,
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
          lineHeight: 1.7,
          fontSize: "14px",
          color: colors.text,
          borderLeft: `4px solid ${colors.primary}`,
        }}
      >
        <p style={{ margin: "0 0 12px", fontWeight: 600, fontSize: "15px" }}>
          Esta ferramenta foi feita para si.
        </p>
        <p style={{ margin: "0 0 12px", fontSize: "12px", color: colors.textMuted, textAlign: "center", fontStyle: "italic" }}>
          Joana Miguel &amp; Joana Carvalho · NID — Núcleo de Investigação e Desenvolvimento
        </p>
        <p style={{ margin: "0 0 10px" }}>
          Criámos esta aplicação para o/a apoiar no dia-a-dia da sala de aula, ajudando a identificar mais cedo crianças com dificuldades de <strong>atenção</strong> e de <strong>linguagem</strong> — e a saber o que fazer em cada caso.
        </p>
        <p style={{ margin: "0 0 10px" }}>
          A ferramenta é <strong>totalmente gratuita</strong> e assim vai continuar. Vamos melhorando as estratégias e as funcionalidades ao longo do tempo, também com base no que nos disser e sugerir.
        </p>
        <p style={{ margin: "0 0 10px" }}>
          Para podermos melhorar continuamente, pedimos-lhe que preencha uma breve secção inicial com algumas informações gerais e anónimas sobre a sua experiência. Estes dados <strong>não identificam quem é</strong> (não recolhemos nome nem escola) e poderão ser utilizados para produzir conhecimento que ajude cada vez mais crianças.
        </p>
        <p style={{ margin: "0", fontSize: "13px", color: colors.textMuted }}>
          A utilização desta ferramenta implica a aceitação dos termos acima.
        </p>
      </div>

      <div
        onClick={() => setConsent(!consent)}
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          padding: "16px",
          borderRadius: "10px",
          border: `1.5px solid ${consent ? colors.primary : colors.border}`,
          background: consent ? colors.primaryLight : colors.surface,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        <div
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "6px",
            border: `2px solid ${consent ? colors.primary : colors.border}`,
            background: consent ? colors.primary : colors.surface,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: "1px",
            transition: "all 0.2s",
          }}
        >
          {consent && <span style={{ color: "#fff", fontSize: "14px", fontWeight: 700 }}>✓</span>}
        </div>
        <span style={{ fontSize: "14px", color: colors.text, lineHeight: 1.5 }}>
          Li e aceito. Compreendo que as minhas respostas anónimas poderão ser utilizadas para melhorar esta ferramenta e contribuir para o apoio a crianças com dificuldades de atenção e linguagem.
        </span>
      </div>
    </Card>
  );

  const renderDemographics = () => (
    <Card>
      <SectionHeader icon="👤" title="Sobre si" subtitle="Dados gerais e anónimos — ajudam-nos a compreender melhor quem utiliza esta ferramenta" />
      {[
        {
          key: "distrito",
          label: "Distrito / Região",
          type: "select",
          options: [
            "", "Aveiro", "Beja", "Braga", "Bragança", "Castelo Branco",
            "Coimbra", "Évora", "Faro", "Guarda", "Leiria", "Lisboa",
            "Portalegre", "Porto", "Santarém", "Setúbal", "Viana do Castelo",
            "Vila Real", "Viseu", "Região Autónoma dos Açores", "Região Autónoma da Madeira"
          ],
        },
        {
          key: "cycle",
          label: "Ciclo de ensino",
          type: "select",
          options: ["", "Pré-escolar", "1.º Ciclo", "2.º Ciclo", "3.º Ciclo"],
        },
        {
          key: "yearsExp",
          label: "Anos de experiência docente",
          type: "select",
          options: ["", "0-5", "6-10", "11-20", "21-30", "30+"],
        },
        {
          key: "age",
          label: "Faixa etária",
          type: "select",
          options: ["", "20-29", "30-39", "40-49", "50-59", "60+"],
        },
        {
          key: "gender",
          label: "Género",
          type: "select",
          options: ["", "Feminino", "Masculino", "Outro", "Prefiro não responder"],
        },
        {
          key: "education",
          label: "Habilitações académicas",
          type: "select",
          options: ["", "Licenciatura", "Pós-graduação", "Mestrado", "Doutoramento"],
        },
        {
          key: "specialNeeds",
          label: "Já recebeu formação sobre Necessidades Educativas Especiais?",
          type: "select",
          options: ["", "Sim, formação específica", "Sim, integrada noutras formações", "Não"],
        },
      ].map(({ key, label, placeholder, type, options }) => (
        <div key={key} style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: colors.text, marginBottom: "6px" }}>
            {label}
          </label>
          {type === "select" ? (
            <select
              value={demo[key]}
              onChange={(e) => setDemo({ ...demo, [key]: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: `1.5px solid ${colors.border}`,
                fontSize: "14px",
                background: colors.surface,
                color: colors.text,
              }}
            >
              {options.map((o) => (
                <option key={o} value={o}>
                  {o || "— Selecione —"}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={demo[key]}
              placeholder={placeholder}
              onChange={(e) => setDemo({ ...demo, [key]: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: `1.5px solid ${colors.border}`,
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          )}
        </div>
      ))}
    </Card>
  );

  const renderKnowledge = () => (
    <Card>
      <SectionHeader
        icon="📚"
        title="O que sabe sobre atenção e linguagem"
        subtitle="Para cada afirmação, indique se considera Verdadeiro ou Falso"
        count={knowledgeVF.length}
      />
      {knowledgeVF.map((item, i) => (
        <div
          key={i}
          style={{
            padding: "16px 20px",
            background: i % 2 === 0 ? colors.surface : colors.surfaceAlt,
            borderRadius: "10px",
            border: `1px solid ${colors.border}`,
            marginBottom: "8px",
          }}
        >
          <p style={{ fontSize: "14px", color: colors.text, marginBottom: "10px", lineHeight: 1.5 }}>
            <span style={{ color: colors.textMuted, fontWeight: 600, marginRight: "8px" }}>{i + 1}.</span>
            {item.statement}
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            {["Verdadeiro", "Falso"].map((opt, oi) => (
              <button
                key={opt}
                onClick={() => {
                  const n = [...knowledge];
                  n[i] = oi === 0 ? true : false;
                  setKnowledge(n);
                }}
                style={{
                  padding: "8px 24px",
                  borderRadius: "20px",
                  border: `1.5px solid ${
                    knowledge[i] === (oi === 0 ? true : false) ? (oi === 0 ? "#059669" : "#DC2626") : colors.border
                  }`,
                  background:
                    knowledge[i] === (oi === 0 ? true : false)
                      ? oi === 0
                        ? "#ECFDF5"
                        : "#FEF2F2"
                      : colors.surface,
                  color:
                    knowledge[i] === (oi === 0 ? true : false)
                      ? oi === 0
                        ? "#059669"
                        : "#DC2626"
                      : colors.text,
                  fontSize: "13px",
                  fontWeight: knowledge[i] === (oi === 0 ? true : false) ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  minWidth: "100px",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
    </Card>
  );

  const renderEfficacy = () => (
    <Card>
      <SectionHeader
        icon="💪"
        title="Como se sente no dia-a-dia"
        subtitle="Quão preparado/a se sente para lidar com estas situações?"
        count={efficacyItems.length}
      />
      {efficacyItems.map((item, i) => (
        <ItemBlock
          key={i}
          item={item}
          index={i}
          value={efficacy[i]}
          onChange={(v) => {
            const n = [...efficacy];
            n[i] = v;
            setEfficacy(n);
          }}
          labels={EFFICACY_LABELS}
        />
      ))}
    </Card>
  );

  const renderStrategies = () => (
    <Card>
      <SectionHeader
        icon="🛠️"
        title="O que já faz"
        subtitle="Que estratégias utiliza atualmente com os seus alunos?"
        count={STRATEGIES_LIST.length}
      />
      {STRATEGIES_LIST.map((s, i) => (
        <ItemBlock
          key={s.id}
          item={s.text}
          index={i}
          value={strategyUse[s.id] ?? null}
          onChange={(v) => setStrategyUse({ ...strategyUse, [s.id]: v })}
          labels={STRATEGY_FREQ}
        />
      ))}
    </Card>
  );

  const renderVignette = (vIndex) => {
    const v = VIGNETTES[vIndex];
    const key = v.id;
    const resp = vignetteResp[key];
    return (
      <Card>
        <SectionHeader icon="📖" title={v.title} />
        <div
          style={{
            background: colors.surfaceAlt,
            padding: "16px 20px",
            borderRadius: "10px",
            marginBottom: "20px",
            textAlign: "center",
            border: `1.5px dashed ${colors.border}`,
          }}
        >
          <span style={{ fontSize: "20px", marginRight: "8px" }}>🎤</span>
          <span style={{ fontSize: "14px", color: colors.textMuted, fontStyle: "italic" }}>
            Caso apresentado oralmente — responda abaixo com base no que ouviu
          </span>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>
            Encaminharia esta criança para avaliação especializada?
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            {["Sim", "Não", "Não tenho a certeza"].map((opt) => (
              <button
                key={opt}
                onClick={() => setVignetteResp({ ...vignetteResp, [key]: { ...resp, refer: opt } })}
                style={{
                  padding: "8px 20px",
                  borderRadius: "20px",
                  border: `1.5px solid ${resp.refer === opt ? colors.primary : colors.border}`,
                  background: resp.refer === opt ? colors.primary : colors.surface,
                  color: resp.refer === opt ? "#fff" : colors.text,
                  fontSize: "13px",
                  fontWeight: resp.refer === opt ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {resp.refer === "Sim" && (
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
              Para quem encaminharia?
            </label>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {["Psicólogo/a", "Terapeuta da fala", "Pediatra", "Neuropediatra", "Equipa multidisciplinar", "Outro"].map(
                (opt) => (
                  <button
                    key={opt}
                    onClick={() => setVignetteResp({ ...vignetteResp, [key]: { ...resp, referTo: opt } })}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      border: `1.5px solid ${resp.referTo === opt ? colors.accent : colors.border}`,
                      background: resp.referTo === opt ? colors.accentLight : colors.surface,
                      color: resp.referTo === opt ? colors.accent : colors.text,
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    {opt}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>
            Qual a sua principal hipótese sobre as dificuldades desta criança?
          </label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              "Principalmente atenção/comportamento",
              "Principalmente linguagem",
              "Ambos (atenção e linguagem)",
              "Nenhuma dificuldade significativa",
            ].map((opt) => (
              <button
                key={opt}
                onClick={() => setVignetteResp({ ...vignetteResp, [key]: { ...resp, hypothesis: opt } })}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: `1.5px solid ${resp.hypothesis === opt ? colors.primary : colors.border}`,
                  background: resp.hypothesis === opt ? colors.primaryLight : colors.surface,
                  color: resp.hypothesis === opt ? colors.primaryDark : colors.text,
                  fontSize: "13px",
                  fontWeight: resp.hypothesis === opt ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
            Que estratégias implementaria primeiro? (descreva até 3)
          </label>
          <textarea
            value={resp.strategies}
            onChange={(e) => setVignetteResp({ ...vignetteResp, [key]: { ...resp, strategies: e.target.value } })}
            placeholder="Ex: Sentá-lo mais perto, usar apoios visuais, simplificar instruções..."
            rows={3}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              border: `1.5px solid ${colors.border}`,
              fontSize: "14px",
              resize: "vertical",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>
      </Card>
    );
  };

  const answered = () => {
    const total =
      knowledgeVF.length +
      efficacyItems.length +
      STRATEGIES_LIST.length +
      2; // vignettes
    const filled =
      knowledge.filter((v) => v !== null).length +
      efficacy.filter((v) => v !== null).length +
      Object.values(strategyUse).filter((v) => v !== null).length +
      (vignetteResp.v1.hypothesis ? 1 : 0) +
      (vignetteResp.v2.hypothesis ? 1 : 0);
    return { filled, total };
  };

  const { filled, total } = answered();

  const content = [
    renderConsent,
    renderDemographics,
    renderKnowledge,
    renderEfficacy,
    renderStrategies,
    () => renderVignette(0),
    () => renderVignette(1),
  ];

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "12px" }}>
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: `1.5px solid ${step === i ? colors.primary : colors.border}`,
                background: step === i ? colors.primary : i < step ? colors.primaryLight : colors.surface,
                color: step === i ? "#fff" : colors.text,
                fontSize: "12px",
                fontWeight: step === i ? 600 : 400,
                cursor: "pointer",
              }}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
        <ProgressBar current={filled} total={total} label="Progresso" />
      </div>

      {content[step]()}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
        <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          ← Anterior
        </Button>
        {step < steps.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} disabled={step === 0 && !consent}>
            {step === 0 && !consent ? "Aceite para continuar" : "Seguinte →"}
          </Button>
        ) : (
          <Button
            variant="accent"
            onClick={() => {
              const data = { demo, knowledge, efficacy, strategyUse, vignetteResp, timestamp: new Date().toISOString() };
              setTeacherData(data);
              onComplete(data);
            }}
          >
            ✓ Concluir
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── PARTE 2: RASTREIO DE ALUNOS ─────────────────────────────

function StudentScreening({ students, setStudents }) {
  const [mode, setMode] = useState("list"); // list | new | result
  const [currentStudent, setCurrentStudent] = useState(null);
  const [studentInfo, setStudentInfo] = useState({ initials: "", age: "", cycle: "", knownDx: "" });
  const [responses, setResponses] = useState({});
  const [screenStep, setScreenStep] = useState(0);
  const [result, setResult] = useState(null);

  const domains = ["inattention", "hyperactivity", "comprehension", "expression", "pragmatics", "impact"];

  const totalItems = domains.reduce((acc, d) => acc + ITEMS[d].items.length, 0);
  const answeredItems = Object.values(responses).flat().filter((v) => v !== null && v !== undefined).length;

  const startNew = () => {
    setStudentInfo({ initials: "", age: "", cycle: "", knownDx: "" });
    setResponses({});
    domains.forEach((d) => {
      responses[d] = Array(ITEMS[d].items.length).fill(null);
    });
    setResponses({ ...responses });
    setScreenStep(0);
    setMode("new");
    setResult(null);
  };

  const handleSubmitScreening = () => {
    const profile = computeProfile(responses);
    const record = {
      id: `ALU-${Date.now().toString(36).toUpperCase()}`,
      ...studentInfo,
      responses: { ...responses },
      ...profile,
      date: new Date().toLocaleDateString("pt-PT"),
    };
    setStudents([...students, record]);
    setResult(record);
    setMode("result");
  };

  if (mode === "result" && result) {
    return (
      <div>
        <Card style={{ borderTop: `4px solid ${result.profileColor}` }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "8px" }}>{result.profileIcon}</div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: result.profileColor, margin: "0 0 4px" }}>
              {result.profile}
            </h3>
            <p style={{ fontSize: "14px", color: colors.textMuted }}>
              {result.initials} · {result.age} anos · {result.date}
            </p>
          </div>

          <div
            style={{
              background: result.decisionColor + "15",
              border: `1.5px solid ${result.decisionColor}`,
              borderRadius: "10px",
              padding: "14px 20px",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            <span style={{ fontSize: "13px", color: colors.textMuted, fontWeight: 500 }}>Decisão recomendada</span>
            <p style={{ fontSize: "18px", fontWeight: 700, color: result.decisionColor, margin: "4px 0 0" }}>
              {result.decision}
            </p>
          </div>

          <h4 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px" }}>Pontuações por domínio</h4>

          <ScoreBar label="Desatenção" score={result.scores.inattention} color="#EF4444" />
          <ScoreBar label="Hiperatividade/Impulsividade" score={result.scores.hyperactivity} color="#F97316" />
          <ScoreBar label="Compreensão" score={result.scores.comprehension} color="#3B82F6" />
          <ScoreBar label="Expressão/Organização" score={result.scores.expression} color="#6366F1" />
          <ScoreBar label="Pragmática" score={result.scores.pragmatics} color="#8B5CF6" />
          <ScoreBar label="Impacto funcional" score={result.scores.impact} color="#64748B" />

          <div style={{ marginTop: "20px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px" }}>📋 Estratégias recomendadas</h4>
            {result.strategies.map((s, i) => (
              <div
                key={s.id}
                style={{
                  padding: "10px 14px",
                  background: colors.surfaceAlt,
                  borderRadius: "8px",
                  marginBottom: "6px",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: colors.primary,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                {s.text}
              </div>
            ))}
          </div>
        </Card>

        <div
          style={{
            background: "#FEF3C7",
            border: "1.5px solid #F59E0B",
            borderRadius: "10px",
            padding: "14px 18px",
            marginBottom: "12px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "20px", flexShrink: 0 }}>⚠️</span>
          <div style={{ fontSize: "13px", lineHeight: 1.6, color: "#92400E" }}>
            <strong>Grave os resultados antes de sair!</strong><br />
            Faça uma captura de ecrã (screenshot) desta página ou anote os dados do aluno. Se fechar ou atualizar a aplicação, os resultados serão perdidos.
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Button onClick={startNew}>+ Novo rastreio</Button>
          <Button variant="secondary" onClick={() => setMode("list")}>
            Ver todos
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "new") {
    const domain = domains[screenStep];

    return (
      <div>
        <ProgressBar current={answeredItems} total={totalItems} label={`Itens respondidos: ${answeredItems}/${totalItems}`} />

        {screenStep === 0 && (
          <Card style={{ marginBottom: "16px" }}>
            <SectionHeader icon="👧" title="Dados do Aluno" subtitle="Informação mínima para identificação" />
            {[
              { key: "initials", label: "Iniciais do aluno", placeholder: "Ex: MF" },
              { key: "age", label: "Idade (anos)", placeholder: "Ex: 7" },
              {
                key: "cycle",
                label: "Ciclo",
                type: "select",
                options: ["", "Pré-escolar", "1.º Ciclo", "2.º Ciclo"],
              },
              {
                key: "knownDx",
                label: "Diagnóstico conhecido?",
                type: "select",
                options: ["", "Nenhum", "PHDA", "Perturbação da linguagem", "Outro", "Em avaliação"],
              },
            ].map(({ key, label, placeholder, type, options }) => (
              <div key={key} style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: colors.text, marginBottom: "4px" }}>
                  {label}
                </label>
                {type === "select" ? (
                  <select
                    value={studentInfo[key]}
                    onChange={(e) => setStudentInfo({ ...studentInfo, [key]: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: `1.5px solid ${colors.border}`,
                      fontSize: "14px",
                    }}
                  >
                    {options.map((o) => (
                      <option key={o} value={o}>{o || "— Selecione —"}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={studentInfo[key]}
                    placeholder={placeholder}
                    onChange={(e) => setStudentInfo({ ...studentInfo, [key]: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: `1.5px solid ${colors.border}`,
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                )}
              </div>
            ))}
          </Card>
        )}

        <Card>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "16px" }}>
            {domains.map((d, i) => (
              <button
                key={d}
                onClick={() => setScreenStep(i)}
                style={{
                  padding: "5px 10px",
                  borderRadius: "6px",
                  border: `1px solid ${screenStep === i ? colors.primary : colors.border}`,
                  background: screenStep === i ? colors.primary : colors.surface,
                  color: screenStep === i ? "#fff" : colors.textMuted,
                  fontSize: "11px",
                  cursor: "pointer",
                  fontWeight: screenStep === i ? 600 : 400,
                }}
              >
                {ITEMS[d].icon} {ITEMS[d].label.split(" ")[0]}
              </button>
            ))}
          </div>

          <SectionHeader
            icon={ITEMS[domain].icon}
            title={ITEMS[domain].label}
            count={ITEMS[domain].items.length}
          />

          {ITEMS[domain].items.map((item, i) => (
            <ItemBlock
              key={`${domain}-${i}`}
              item={item}
              index={i}
              value={(responses[domain] || [])[i]}
              onChange={(v) => {
                const r = { ...responses };
                if (!r[domain]) r[domain] = Array(ITEMS[domain].items.length).fill(null);
                r[domain][i] = v;
                setResponses(r);
              }}
              labels={domain === "impact" ? IMPACT_LABELS : LIKERT_LABELS}
            />
          ))}
        </Card>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
          <Button
            variant="ghost"
            onClick={() => (screenStep > 0 ? setScreenStep(screenStep - 1) : setMode("list"))}
          >
            ← {screenStep > 0 ? "Anterior" : "Cancelar"}
          </Button>
          {screenStep < domains.length - 1 ? (
            <Button onClick={() => setScreenStep(screenStep + 1)}>Seguinte →</Button>
          ) : (
            <Button variant="accent" onClick={handleSubmitScreening} disabled={answeredItems < totalItems * 0.8}>
              ✓ Calcular perfil
            </Button>
          )}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: colors.text, margin: 0 }}>
          Alunos rastreados ({students.length})
        </h3>
        <Button onClick={startNew}>+ Novo rastreio</Button>
      </div>

      {students.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>📝</div>
          <p style={{ fontSize: "16px", color: colors.textMuted, margin: 0 }}>
            Ainda não há alunos rastreados.
          </p>
          <p style={{ fontSize: "13px", color: colors.textLight, marginTop: "8px" }}>
            Clique em «+ Novo rastreio» para começar.
          </p>
        </Card>
      ) : (
        students.map((s) => (
          <Card
            key={s.id}
            style={{ cursor: "pointer", borderLeft: `4px solid ${s.profileColor}` }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "16px", fontWeight: 700, color: colors.text }}>
                  {s.profileIcon} {s.initials}
                </span>
                <span style={{ fontSize: "13px", color: colors.textMuted, marginLeft: "8px" }}>
                  {s.age} anos · {s.cycle} · {s.date}
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    background: s.profileColor + "20",
                    color: s.profileColor,
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  {s.profile}
                </span>
                <div style={{ fontSize: "11px", color: s.decisionColor, marginTop: "4px", fontWeight: 600 }}>
                  {s.decision}
                </div>
              </div>
            </div>
          </Card>
        ))
      )}

      {students.length > 0 && (
        <div
          style={{
            background: "#FEF3C7",
            border: "1.5px solid #F59E0B",
            borderRadius: "10px",
            padding: "14px 18px",
            marginTop: "12px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "20px", flexShrink: 0 }}>⚠️</span>
          <div style={{ fontSize: "13px", lineHeight: 1.6, color: "#92400E" }}>
            <strong>Grave os resultados antes de sair!</strong><br />
            Faça uma captura de ecrã (screenshot) desta página. Se fechar ou atualizar a aplicação, todos os dados dos alunos serão perdidos.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PARTE 3: PAINEL DE RESULTADOS ───────────────────────────

function Dashboard({ students, teacherData }) {
  const profileCounts = useMemo(() => {
    const counts = { attention: 0, language: 0, mixed: 0, low: 0 };
    students.forEach((s) => {
      if (s.profile.includes("Atenção")) counts.attention++;
      else if (s.profile.includes("Linguagem")) counts.language++;
      else if (s.profile.includes("Misto")) counts.mixed++;
      else counts.low++;
    });
    return counts;
  }, [students]);

  const avgScores = useMemo(() => {
    if (students.length === 0) return null;
    const keys = ["inattention", "hyperactivity", "comprehension", "expression", "pragmatics", "impact"];
    const avgs = {};
    keys.forEach((k) => {
      avgs[k] = students.reduce((acc, s) => acc + s.scores[k], 0) / students.length;
    });
    return avgs;
  }, [students]);

  const StatBox = ({ label, value, color, icon }) => (
    <div
      style={{
        flex: "1 1 120px",
        background: color + "12",
        border: `1.5px solid ${color}30`,
        borderRadius: "12px",
        padding: "16px",
        textAlign: "center",
        minWidth: "120px",
      }}
    >
      <div style={{ fontSize: "28px", marginBottom: "4px" }}>{icon}</div>
      <div style={{ fontSize: "28px", fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: "11px", color: colors.textMuted, fontWeight: 500, marginTop: "2px" }}>{label}</div>
    </div>
  );

  return (
    <div>
      <Card>
        <SectionHeader icon="📊" title="Resumo Geral" subtitle={`${students.length} aluno(s) rastreado(s)`} />
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <StatBox label="Atenção" value={profileCounts.attention} color="#EF4444" icon="⚡" />
          <StatBox label="Linguagem" value={profileCounts.language} color="#3B82F6" icon="💬" />
          <StatBox label="Misto" value={profileCounts.mixed} color="#8B5CF6" icon="🔄" />
          <StatBox label="Baixo risco" value={profileCounts.low} color="#10B981" icon="✅" />
        </div>
      </Card>

      {avgScores && (
        <Card>
          <SectionHeader icon="📈" title="Médias dos Domínios" subtitle="Valores médios de todos os alunos rastreados" />
          <ScoreBar label="Desatenção" score={avgScores.inattention} color="#EF4444" />
          <ScoreBar label="Hiperatividade" score={avgScores.hyperactivity} color="#F97316" />
          <ScoreBar label="Compreensão" score={avgScores.comprehension} color="#3B82F6" />
          <ScoreBar label="Expressão" score={avgScores.expression} color="#6366F1" />
          <ScoreBar label="Pragmática" score={avgScores.pragmatics} color="#8B5CF6" />
          <ScoreBar label="Impacto" score={avgScores.impact} color="#64748B" />
        </Card>
      )}

      {teacherData && (
        <Card>
          <SectionHeader icon="👤" title="O Seu Perfil" subtitle="Dados configurados" />
          <div style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.6 }}>
            <p>✅ Perfil configurado em {new Date(teacherData.timestamp).toLocaleDateString("pt-PT")}</p>
            <p>Distrito: {teacherData.demo?.distrito || "—"}</p>
            <p>Ciclo: {teacherData.demo?.cycle || "—"}</p>
            <p>Experiência: {teacherData.demo?.yearsExp || "—"} anos</p>
          </div>
        </Card>
      )}

      {students.length === 0 && (
        <Card style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>🌙</div>
          <p style={{ color: colors.textMuted, fontSize: "14px" }}>
            Sem dados ainda. Utilize a secção «Rastreio» para começar a avaliar alunos.
          </p>
        </Card>
      )}

      {students.length > 0 && (
        <div
          style={{
            background: "#FEF3C7",
            border: "1.5px solid #F59E0B",
            borderRadius: "10px",
            padding: "14px 18px",
            marginTop: "12px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "20px", flexShrink: 0 }}>⚠️</span>
          <div style={{ fontSize: "13px", lineHeight: 1.6, color: "#92400E" }}>
            <strong>Grave os resultados antes de sair!</strong><br />
            Faça uma captura de ecrã (screenshot) desta página. Se fechar ou atualizar a aplicação, todos os dados dos alunos serão perdidos.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── APP PRINCIPAL ───────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState(0);
  const [students, setStudents] = useState([]);
  const [teacherData, setTeacherData] = useState(null);
  const [showIntro, setShowIntro] = useState(true);

  const tabs = [
    { label: "O Meu Perfil", icon: "👤", desc: "Configuração inicial" },
    { label: "Rastreio", icon: "🔍", desc: "Avaliação de alunos" },
    { label: "Painel", icon: "📊", desc: "Resultados e resumos" },
  ];

  if (showIntro) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.bg} 50%, ${colors.accentLight} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          fontFamily: "'Nunito', 'Segoe UI', sans-serif",
        }}
      >
        <div style={{ maxWidth: "520px", textAlign: "center" }}>
          <div
            style={{
              fontSize: "64px",
              marginBottom: "12px",
              filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.1))",
            }}
          >
            🌙
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: colors.primaryDark, margin: "0 0 4px", letterSpacing: "-0.5px" }}>
            Crianças no Mundo da Lua?
          </h1>
          <p style={{ fontSize: "14px", color: colors.accent, fontWeight: 600, marginBottom: "8px" }}>
            Ferramenta de Rastreio · Atenção e Linguagem
          </p>
          <p style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "4px" }}>
            Joana Miguel &amp; Joana Carvalho
          </p>
          <p style={{ fontSize: "11px", color: colors.textMuted, marginBottom: "24px", fontStyle: "italic" }}>
            NID — Núcleo de Investigação e Desenvolvimento
          </p>

          <Card>
            <p style={{ fontSize: "14px", color: colors.text, lineHeight: 1.7, margin: "0 0 16px", textAlign: "left" }}>
              Esta aplicação foi desenvolvida para apoiar educadores e professores na identificação precoce de dificuldades de{" "}
              <strong style={{ color: colors.primary }}>atenção</strong> e{" "}
              <strong style={{ color: colors.accent }}>linguagem</strong> nos seus alunos, fornecendo estratégias práticas de intervenção.
            </p>

            <div style={{ textAlign: "left", marginBottom: "16px" }}>
              {[
                { icon: "👤", text: "Configure o seu perfil (breve e anónimo)" },
                { icon: "🔍", text: "Rastreio rápido com perfil automático do aluno" },
                { icon: "📊", text: "Painel com resumo dos alunos avaliados" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 0",
                    borderBottom: i < 2 ? `1px solid ${colors.border}` : "none",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>{item.icon}</span>
                  <span style={{ fontSize: "13px", color: colors.text }}>{item.text}</span>
                </div>
              ))}
            </div>
          </Card>

          <Button onClick={() => setShowIntro(false)} style={{ width: "100%", padding: "14px", fontSize: "16px", marginTop: "8px" }}>
            Começar →
          </Button>

          <p style={{ fontSize: "11px", color: colors.textLight, marginTop: "16px" }}>
            CAIDI · Centro de Apoio e Intervenção no Desenvolvimento Infantil
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: colors.surface,
          borderBottom: `1px solid ${colors.border}`,
          padding: "12px 20px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "22px" }}>🌙</span>
              <div>
                <h1 style={{ fontSize: "15px", fontWeight: 700, color: colors.primaryDark, margin: 0, lineHeight: 1.2 }}>
                  Crianças no Mundo da Lua?
                </h1>
                <span style={{ fontSize: "10px", color: colors.textMuted }}>J. Miguel & J. Carvalho · NID</span>
              </div>
            </div>
            {teacherData && (
              <span style={{ fontSize: "10px", color: colors.success, fontWeight: 600, padding: "3px 8px", background: "#ECFDF5", borderRadius: "10px" }}>
                ✓ Perfil configurado
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: "4px" }}>
            {tabs.map((t, i) => {
              const locked = i > 0 && !teacherData;
              return (
              <button
                key={i}
                onClick={() => !locked && setTab(i)}
                style={{
                  flex: 1,
                  padding: "8px 4px",
                  borderRadius: "8px",
                  border: "none",
                  background: tab === i ? colors.primary : "transparent",
                  color: locked ? colors.textLight : tab === i ? "#fff" : colors.textMuted,
                  fontSize: "12px",
                  fontWeight: tab === i ? 700 : 500,
                  cursor: locked ? "not-allowed" : "pointer",
                  opacity: locked ? 0.5 : 1,
                  transition: "all 0.2s",
                }}
                title={locked ? "Preencha o seu perfil primeiro" : ""}
              >
                {locked ? "🔒" : t.icon} {t.label}
              </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "20px 16px 80px" }}>
        {tab === 0 && (
          teacherData ? (
            <Card style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ fontSize: "48px", marginBottom: "8px" }}>✅</div>
              <h3 style={{ fontSize: "18px", color: colors.success, margin: "0 0 8px" }}>Perfil configurado!</h3>
              <p style={{ fontSize: "13px", color: colors.textMuted }}>
                Obrigado/a! Pode agora utilizar a ferramenta de rastreio para avaliar os seus alunos.
              </p>
              <Button variant="secondary" onClick={() => setTab(1)} style={{ marginTop: "16px" }}>
                Ir para Rastreio →
              </Button>
            </Card>
          ) : (
            <ResearchQuestionnaire
              onComplete={(data) => {
                setTeacherData(data);
                setTab(1);
              }}
              teacherData={teacherData}
              setTeacherData={setTeacherData}
            />
          )
        )}

        {tab === 1 && <StudentScreening students={students} setStudents={setStudents} />}

        {tab === 2 && <Dashboard students={students} teacherData={teacherData} />}
      </div>
    </div>
  );
}
