// ═══════════════════════════════════════════════════════════════
// GOOGLE APPS SCRIPT — Backend para "Crianças no Mundo da Lua?"
// Autoria: Joana Miguel & Joana Carvalho
// NID — Núcleo de Investigação e Desenvolvimento
// ═══════════════════════════════════════════════════════════════
//
// INSTRUÇÕES DE CONFIGURAÇÃO:
// 1. Criar uma Google Sheet com o nome "CriancasLua_Dados"
// 2. Ir a Extensões > Apps Script
// 3. Colar este código inteiro
// 4. Criar as folhas (separadores) listadas abaixo
// 5. Fazer Deploy > Nova implementação > App Web
//    - Executar como: Eu
//    - Acesso: Qualquer pessoa
// 6. Copiar o URL gerado e colocar na app React (variável SCRIPT_URL)
//
// FOLHAS NECESSÁRIAS (criar manualmente ou executar setupSheets()):
// - Professores
// - Questionario_Investigacao
// - Conhecimento_Previo
// - Autoeficacia
// - Estrategias_Usadas
// - Vinhetas
// - Alunos_Rastreio
// - Respostas_Itens
// - Perfis_Calculados
// ═══════════════════════════════════════════════════════════════

const SHEET_NAME = "CriancasLua_Dados";

// ─── SETUP INICIAL ───────────────────────────────────────────

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const sheets = {
    "Professores": [
      "ID_Professor", "Timestamp", "Distrito", "Ciclo", "Anos_Experiencia",
      "Faixa_Etaria", "Genero", "Habilitacoes", "Formacao_NEE"
    ],
    "Questionario_Investigacao": [
      "ID_Professor", "Timestamp",
      "VF_01", "VF_02", "VF_03", "VF_04", "VF_05", "VF_06",
      "VF_07", "VF_08", "VF_09", "VF_10", "VF_11", "VF_12",
      "VF_13", "VF_14", "VF_15", "VF_16",
      "Eficacia_1", "Eficacia_2", "Eficacia_3", "Eficacia_4", "Eficacia_5"
    ],
    "Estrategias_Usadas": [
      "ID_Professor", "Timestamp",
      "S1_Instrucoes_curtas", "S2_Confirmar_compreensao", "S3_Dividir_tarefas",
      "S4_Supervisao_frequente", "S5_Feedback_imediato",
      "S6_Posicionamento", "S7_Pausas_motoras", "S8_Sinais_nao_verbais",
      "S9_Reforco_positivo", "S10_Contrato_comportamental",
      "S11_Simplificar_linguagem", "S12_Apoios_visuais", "S13_Repeticao_reformulacao",
      "S14_Verificacao_compreensao", "S15_Modelar_frases", "S16_Sequenciacao_narrativa"
    ],
    "Vinhetas": [
      "ID_Professor", "Timestamp",
      "V1_Encaminhar", "V1_Para_quem", "V1_Hipotese", "V1_Estrategias",
      "V2_Encaminhar", "V2_Para_quem", "V2_Hipotese", "V2_Estrategias"
    ],
    "Alunos_Rastreio": [
      "ID_Registo", "ID_Professor", "Timestamp",
      "Iniciais_Aluno", "Idade", "Ciclo", "Diagnostico_Conhecido"
    ],
    "Respostas_Itens": [
      "ID_Registo", "Timestamp",
      "Inat_1", "Inat_2", "Inat_3", "Inat_4", "Inat_5", "Inat_6", "Inat_7",
      "Hiper_1", "Hiper_2", "Hiper_3", "Hiper_4", "Hiper_5", "Hiper_6", "Hiper_7",
      "Comp_1", "Comp_2", "Comp_3", "Comp_4", "Comp_5", "Comp_6",
      "Expr_1", "Expr_2", "Expr_3", "Expr_4", "Expr_5", "Expr_6",
      "Prag_1", "Prag_2", "Prag_3", "Prag_4", "Prag_5",
      "Imp_1", "Imp_2", "Imp_3", "Imp_4", "Imp_5"
    ],
    "Perfis_Calculados": [
      "ID_Registo", "Timestamp",
      "Score_Desatencao", "Score_Hiperatividade", "Score_Compreensao",
      "Score_Expressao", "Score_Pragmatica", "Score_Impacto",
      "Score_Atencao_Total", "Score_Linguagem_Total",
      "Perfil", "Decisao"
    ]
  };

  Object.entries(sheets).forEach(([name, headers]) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    // Escrever cabeçalhos
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    // Formatar cabeçalhos
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#4A7C6F")
      .setFontColor("#FFFFFF")
      .setHorizontalAlignment("center");
    // Congelar primeira linha
    sheet.setFrozenRows(1);
    // Auto-ajustar colunas
    headers.forEach((_, i) => sheet.autoResizeColumn(i + 1));
  });

  // Remover Sheet1 default se existir
  const defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Folha1");
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  SpreadsheetApp.getUi().alert("✅ Folhas criadas com sucesso!");
}

// ─── WEB APP ENDPOINTS ──────────────────────────────────────

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    switch (action) {
      case "submitResearch":
        return handleResearchSubmission(data);
      case "submitScreening":
        return handleScreeningSubmission(data);
      default:
        return jsonResponse({ success: false, error: "Ação desconhecida" });
    }
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

function doGet(e) {
  const action = e.parameter.action;
  
  switch (action) {
    case "getStudents":
      return handleGetStudents(e.parameter.teacherId);
    case "getDashboard":
      return handleGetDashboard(e.parameter.teacherId);
    default:
      return jsonResponse({ success: true, message: "API Crianças no Mundo da Lua ativa" });
  }
}

// ─── HANDLERS ────────────────────────────────────────────────

function handleResearchSubmission(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const teacherId = "PROF-" + Utilities.getUuid().substring(0, 8).toUpperCase();
  const timestamp = new Date().toISOString();

  // 1. Dados do Professor
  const profSheet = ss.getSheetByName("Professores");
  profSheet.appendRow([
    teacherId, timestamp,
    data.demo.distrito, data.demo.cycle, data.demo.yearsExp,
    data.demo.age, data.demo.gender, data.demo.education, data.demo.specialNeeds
  ]);

  // 2. Conhecimento + Autoeficácia
  const questSheet = ss.getSheetByName("Questionario_Investigacao");
  questSheet.appendRow([
    teacherId, timestamp,
    ...data.knowledge,
    ...data.efficacy
  ]);

  // 3. Estratégias usadas
  const stratSheet = ss.getSheetByName("Estrategias_Usadas");
  const stratValues = [];
  for (let i = 1; i <= 16; i++) {
    stratValues.push(data.strategyUse[`s${i}`] ?? "");
  }
  stratSheet.appendRow([teacherId, timestamp, ...stratValues]);

  // 4. Vinhetas
  const vigSheet = ss.getSheetByName("Vinhetas");
  vigSheet.appendRow([
    teacherId, timestamp,
    data.vignetteResp.v1.refer, data.vignetteResp.v1.referTo,
    data.vignetteResp.v1.hypothesis, data.vignetteResp.v1.strategies,
    data.vignetteResp.v2.refer, data.vignetteResp.v2.referTo,
    data.vignetteResp.v2.hypothesis, data.vignetteResp.v2.strategies
  ]);

  return jsonResponse({ 
    success: true, 
    teacherId: teacherId,
    message: "Questionário de investigação submetido com sucesso" 
  });
}

function handleScreeningSubmission(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const recordId = "ALU-" + Utilities.getUuid().substring(0, 8).toUpperCase();
  const timestamp = new Date().toISOString();

  // 1. Dados do Aluno
  const alunoSheet = ss.getSheetByName("Alunos_Rastreio");
  alunoSheet.appendRow([
    recordId, data.teacherId, timestamp,
    data.studentInfo.initials, data.studentInfo.age,
    data.studentInfo.cycle, data.studentInfo.knownDx
  ]);

  // 2. Respostas aos itens
  const respSheet = ss.getSheetByName("Respostas_Itens");
  const allResponses = [
    ...(data.responses.inattention || []),
    ...(data.responses.hyperactivity || []),
    ...(data.responses.comprehension || []),
    ...(data.responses.expression || []),
    ...(data.responses.pragmatics || []),
    ...(data.responses.impact || [])
  ];
  respSheet.appendRow([recordId, timestamp, ...allResponses]);

  // 3. Calcular e guardar perfil
  const scores = calculateScores(data.responses);
  const profile = classifyProfile(scores);
  
  const perfilSheet = ss.getSheetByName("Perfis_Calculados");
  perfilSheet.appendRow([
    recordId, timestamp,
    scores.inattention, scores.hyperactivity,
    scores.comprehension, scores.expression, scores.pragmatics,
    scores.impact,
    scores.attention_total, scores.language_total,
    profile.label, profile.decision
  ]);

  return jsonResponse({
    success: true,
    recordId: recordId,
    scores: scores,
    profile: profile.label,
    decision: profile.decision,
    strategies: profile.strategies
  });
}

function handleGetStudents(teacherId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const alunoSheet = ss.getSheetByName("Alunos_Rastreio");
  const perfilSheet = ss.getSheetByName("Perfis_Calculados");
  
  const alunoData = alunoSheet.getDataRange().getValues();
  const perfilData = perfilSheet.getDataRange().getValues();

  const students = [];
  for (let i = 1; i < alunoData.length; i++) {
    if (alunoData[i][1] === teacherId) {
      const recordId = alunoData[i][0];
      const perfil = perfilData.find(row => row[0] === recordId);
      students.push({
        id: recordId,
        initials: alunoData[i][3],
        age: alunoData[i][4],
        cycle: alunoData[i][5],
        date: alunoData[i][2],
        profile: perfil ? perfil[10] : "—",
        decision: perfil ? perfil[11] : "—"
      });
    }
  }

  return jsonResponse({ success: true, students: students });
}

function handleGetDashboard(teacherId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const perfilSheet = ss.getSheetByName("Perfis_Calculados");
  const alunoSheet = ss.getSheetByName("Alunos_Rastreio");
  
  const allRecords = alunoSheet.getDataRange().getValues();
  const allProfiles = perfilSheet.getDataRange().getValues();
  
  // Filtrar por professor se fornecido
  let teacherRecords = [];
  for (let i = 1; i < allRecords.length; i++) {
    if (!teacherId || allRecords[i][1] === teacherId) {
      teacherRecords.push(allRecords[i][0]); // record IDs
    }
  }
  
  const counts = { attention: 0, language: 0, mixed: 0, low: 0 };
  const scoresSums = { inattention: 0, hyperactivity: 0, comprehension: 0, expression: 0, pragmatics: 0, impact: 0 };
  let total = 0;

  for (let i = 1; i < allProfiles.length; i++) {
    if (teacherRecords.includes(allProfiles[i][0])) {
      total++;
      const profile = allProfiles[i][10];
      if (profile.includes("Atenção")) counts.attention++;
      else if (profile.includes("Linguagem")) counts.language++;
      else if (profile.includes("Misto")) counts.mixed++;
      else counts.low++;

      scoresSums.inattention += allProfiles[i][2];
      scoresSums.hyperactivity += allProfiles[i][3];
      scoresSums.comprehension += allProfiles[i][4];
      scoresSums.expression += allProfiles[i][5];
      scoresSums.pragmatics += allProfiles[i][6];
      scoresSums.impact += allProfiles[i][7];
    }
  }

  const avgs = {};
  if (total > 0) {
    Object.keys(scoresSums).forEach(k => avgs[k] = scoresSums[k] / total);
  }

  return jsonResponse({ success: true, total, counts, averages: avgs });
}

// ─── CÁLCULOS ────────────────────────────────────────────────

function calculateScores(responses) {
  function mean(arr) {
    const valid = (arr || []).filter(v => v !== null && v !== undefined && v !== "");
    return valid.length > 0 ? valid.reduce((a, b) => a + Number(b), 0) / valid.length : 0;
  }

  const scores = {
    inattention: mean(responses.inattention),
    hyperactivity: mean(responses.hyperactivity),
    comprehension: mean(responses.comprehension),
    expression: mean(responses.expression),
    pragmatics: mean(responses.pragmatics),
    impact: mean(responses.impact)
  };

  scores.attention_total = (scores.inattention + scores.hyperactivity) / 2;
  scores.language_total = (scores.comprehension + scores.expression + scores.pragmatics) / 3;

  return scores;
}

function classifyProfile(scores) {
  const ATT_CUT = 1.5;
  const LANG_CUT = 1.5;

  const attRisk = scores.attention_total >= ATT_CUT;
  const langRisk = scores.language_total >= LANG_CUT;

  let label, strategies = [];
  
  if (attRisk && langRisk) {
    label = "Misto (Atenção + Linguagem)";
    strategies = ["attention", "language"];
  } else if (attRisk) {
    label = "Predominância Atenção/Comportamento";
    strategies = ["attention"];
  } else if (langRisk) {
    label = "Predominância Linguagem";
    strategies = ["language"];
  } else {
    label = "Risco Baixo";
    strategies = ["general"];
  }

  // Decisão
  const maxScore = Math.max(scores.attention_total, scores.language_total);
  const impactHigh = scores.impact >= 2;
  let decision;

  if (maxScore >= 2.0 && impactHigh) {
    decision = "Encaminhar";
  } else if (maxScore >= 1.5 || (maxScore >= 1.0 && impactHigh)) {
    decision = "Monitorizar";
  } else {
    decision = "Implementar estratégias e reavaliar";
  }

  return { label, decision, strategies };
}

// ─── UTILIDADES ──────────────────────────────────────────────

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── EXPORTAÇÃO PARA R ───────────────────────────────────────
// Função para gerar CSV limpo para análise no R

function exportForR() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const folder = DriveApp.getRootFolder();
  
  const sheetsToExport = [
    "Professores",
    "Questionario_Investigacao",
    "Estrategias_Usadas",
    "Vinhetas",
    "Alunos_Rastreio",
    "Respostas_Itens",
    "Perfis_Calculados"
  ];

  sheetsToExport.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) return;
    
    const data = sheet.getDataRange().getValues();
    let csv = "";
    data.forEach(row => {
      csv += row.map(cell => {
        const str = String(cell);
        return str.includes(",") || str.includes('"') || str.includes('\n')
          ? '"' + str.replace(/"/g, '""') + '"'
          : str;
      }).join(",") + "\n";
    });

    const blob = Utilities.newBlob(csv, "text/csv", `${name}.csv`);
    folder.createFile(blob);
  });

  SpreadsheetApp.getUi().alert(
    "✅ CSVs exportados para o Google Drive!\n\n" +
    "Ficheiros criados:\n" +
    sheetsToExport.map(s => `- ${s}.csv`).join("\n")
  );
}

// ─── MENU PERSONALIZADO ─────────────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🌙 Crianças no Mundo da Lua")
    .addItem("📋 Configurar folhas", "setupSheets")
    .addItem("📊 Exportar CSVs para R", "exportForR")
    .addItem("🔢 Recalcular todos os perfis", "recalculateAllProfiles")
    .addToUi();
}

// ─── RECALCULAR PERFIS ──────────────────────────────────────

function recalculateAllProfiles() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const respSheet = ss.getSheetByName("Respostas_Itens");
  const perfilSheet = ss.getSheetByName("Perfis_Calculados");
  
  const respData = respSheet.getDataRange().getValues();
  
  // Limpar perfis (manter cabeçalho)
  if (perfilSheet.getLastRow() > 1) {
    perfilSheet.deleteRows(2, perfilSheet.getLastRow() - 1);
  }

  for (let i = 1; i < respData.length; i++) {
    const row = respData[i];
    const recordId = row[0];
    const timestamp = row[1];
    
    // Reconstruir respostas por domínio
    const responses = {
      inattention: row.slice(2, 9),      // 7 itens
      hyperactivity: row.slice(9, 16),    // 7 itens
      comprehension: row.slice(16, 22),   // 6 itens
      expression: row.slice(22, 28),      // 6 itens
      pragmatics: row.slice(28, 33),      // 5 itens
      impact: row.slice(33, 38)           // 5 itens
    };

    const scores = calculateScores(responses);
    const profile = classifyProfile(scores);

    perfilSheet.appendRow([
      recordId, timestamp,
      scores.inattention, scores.hyperactivity,
      scores.comprehension, scores.expression, scores.pragmatics,
      scores.impact,
      scores.attention_total, scores.language_total,
      profile.label, profile.decision
    ]);
  }

  SpreadsheetApp.getUi().alert(
    `✅ ${respData.length - 1} perfis recalculados com sucesso!`
  );
}
