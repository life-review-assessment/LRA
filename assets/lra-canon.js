import { LEGACY_CANON, LEGACY_CANON_VERSION } from './legacy-canon.js';
import { LEGACY_14_SHEETS, LEGACY_SHEET_SCHEMA_VERSION } from './legacy-sheet-schema.js';
import { LEGACY_REPORT_ASSETS } from './legacy-report-assets.js';

export const LRA_CANON=Object.freeze({
  purpose:'意思決定支援。診断・採点・性格分類ではない。',
  roles:Object.freeze({web:'観測装置',inference:'ChatGPT＝外部推論装置',canon:'LRA正本＝判断基準',decision:'利用者＝最終意思決定者'}),
  flow:Object.freeze(['CORE SCAN','ADAPTIVE SCAN','EVENT TRACE','REFLECTION','ANALYSIS PACKET','STRUCTURE ANALYSIS','SHORT TERM OBSERVATION','RE-ANALYSIS']),
  questionTypes:Object.freeze(['FACT','EVENT','COMPARE','COUNTERFACTUAL','PROTECT']),
  analysis:Object.freeze(['STRUCTURE NODE','CHAIN','LOOP','MULTIPLE HYPOTHESES','SUPPORTING EVIDENCE','COUNTEREVIDENCE','CONTRADICTIONS','EXCEPTIONS','TIMELINE','INTERACTIONS','CONFIDENCE','PERSONAL BASELINE','LEVERAGE POINT','INTERVENTION CANDIDATES','PRIORITY','SHORT TERM OBSERVATION','RE-ANALYSIS']),
  evaluation:Object.freeze(['PROBLEM','IMPACT','FREQUENCY','PERSISTENCE','TREND','CONTROL','EXTERNAL','BUFFER','COST','PROTECTION RISK','LEVERAGE','CONFIDENCE']),
  confidence:Object.freeze(['HIGH','MEDIUM','LOW','INSUFFICIENT']),
  internalConfidence:Object.freeze({min:0,max:1,additionalObservationBelow:0.65,additionalObservationWhenHypothesesCompete:true}),
  minimumHypotheses:2,
  hypothesisState:Object.freeze(['NEW','SUPPORTED','WEAKENED','REJECTED','UNRESOLVED']),
  interventionCompare:Object.freeze(['EXPECTED IMPACT','LEVERAGE','FEASIBILITY','CONFIDENCE','REVERSIBILITY','COST','PROTECTION RISK']),
  safetyLevels:Object.freeze(['NONE','ATTENTION','CONSULT','PRIORITY','URGENT']),
  currentStateFields:Object.freeze(['currentStateSummary','attentionFlags','safetyFlags']),
  outputOrder:Object.freeze(['現在の生活構造','最大ボトルネック','CHAIN/LOOP','主要仮説','根拠','反証・不確実性','機能している部分','保護対象','資源','レバレッジポイント','介入候補','最優先候補','確信度','必要時追加観測']),
  legacy:LEGACY_CANON,
  legacyCanonVersion:LEGACY_CANON_VERSION,
  legacySheetSchema:LEGACY_14_SHEETS,
  legacySheetSchemaVersion:LEGACY_SHEET_SCHEMA_VERSION,
  legacyReports:LEGACY_REPORT_ASSETS,
  rules:Object.freeze({
    factFirst:true,
    singleAnswerCannotProveCause:true,
    correlationIsNotCausation:true,
    unknownIsValidResult:true,
    multipleHypothesesRequired:true,
    minimumHypotheses:2,
    counterevidenceRequired:true,
    doNothingIsValidOption:true,
    chain:'根拠ある一方向関係がある場合のみCHAINとして扱う。',
    loop:'循環維持の証拠がある場合のみLOOPとして扱う。',
    oldFiveAxes:'行動／判断／環境／感情／回復は内部整理軸。主結果を単純点数化しない。',
    currentState:'現在状態はcurrentStateSummary、注意事項はattentionFlags[]、安全関連はsafetyFlags[]で表現する。',
    safety:'NONE／ATTENTION／CONSULT／PRIORITY／URGENTの5段階。単語だけで確定せず、具体的危険兆候・現在性・切迫性・文脈を確認する。URGENTでは通常分析を停止または最小化し、安全確保・緊急窓口接続を優先する。',
    internalConfidence:'確信度は内部0.00〜1.00。0.65未満、または主要仮説が競合する場合は短期観測候補とする。',
    legacyAssets:'旧40問・旧25問・TYPE8+T99・TAG22・STATE/WARNING役割・PT01〜06名称・旧構造翻訳・旧スコア/比較・専門家優先度・旧14シート全列・旧5部・P1〜P4を履歴/内部互換資産として保持し、未凍結条件は推測実装しない。STATE完全コード表・WARNING完全コード表・PT01〜06は現行判定ロジックには使用しない。',
    aiFinalDecision:false,
    localFinalInference:false
  })
});

export function buildAnalysisPacket(state,{CORE,ADAPTIVE,EVENT_TRACE,REFLECTION,SHORT_TERM_OBSERVATION=[]},meta={}){
  const pick=(list)=>list.map(q=>({questionId:q.questionId,type:q.type,domain:q.domain,timeRange:q.timeRange,text:q.text,answer:state.answers?.[q.questionId]})).filter(x=>x.answer!==undefined);
  const answers=state.answers||{};
  return {
    schemaVersion:'LRA-STRUCTURE-PACKET-1.0',
    packetVersion:meta.packetVersion||null,
    questionDbVersion:meta.questionDbVersion||null,
    legacyCanonVersion:LEGACY_CANON_VERSION,
    legacySheetSchemaVersion:LEGACY_SHEET_SCHEMA_VERSION,
    userId:state.userId||null,
    lraId:state.lraId,
    analysisCount:Number(state.analysisCount||1),
    outputId:state.outputId||null,
    planId:state.planCode,
    planCode:state.planCode,
    eventTraceUsed:state.eventTraceUsed,
    adaptiveQuestionIds:[...(state.adaptiveQuestionIds||[])],
    observedAt:state.savedAt||new Date().toISOString(),
    answers,
    rawAnswers:answers,
    core:pick(CORE),
    adaptive:pick(ADAPTIVE.filter(q=>(state.adaptiveQuestionIds||[]).includes(q.questionId))),
    eventTrace:pick(EVENT_TRACE),
    reflection:pick(REFLECTION),
    shortTermObservation:pick(SHORT_TERM_OBSERVATION),
    requiredAnalysis:[...LRA_CANON.analysis],
    evaluationElements:[...LRA_CANON.evaluation],
    minimumHypotheses:LRA_CANON.minimumHypotheses,
    internalConfidence:{...LRA_CANON.internalConfidence},
    hypothesisStates:[...LRA_CANON.hypothesisState],
    interventionComparison:[...LRA_CANON.interventionCompare],
    safetyLevels:[...LRA_CANON.safetyLevels],
    currentStateFields:[...LRA_CANON.currentStateFields],
    outputOrder:[...LRA_CANON.outputOrder],
    legacyCompatibility:{canon:LEGACY_CANON,sheets:LEGACY_14_SHEETS,reports:LEGACY_REPORT_ASSETS},
    constraints:{diagnosis:false,simpleScoring:false,singleCauseAssertion:false,aiFinalDecision:false,localFinalInference:false,expertReplacement:false,unfrozenLegacyRulesMayNotBeInvented:true}
  };
}
