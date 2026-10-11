import { LEGACY_CANON, LEGACY_CANON_VERSION } from './legacy-canon.js';
import { LEGACY_14_SHEETS, LEGACY_SHEET_SCHEMA_VERSION } from './legacy-sheet-schema.js';
import { LEGACY_REPORT_ASSETS } from './legacy-report-assets.js';

export const LRA_CANON=Object.freeze({
  purpose:'意思決定支援。診断・採点・性格分類ではない。',
  roles:Object.freeze({web:'観測装置',inference:'ChatGPT＝外部推論装置',canon:'LRA正本＝判断基準',decision:'利用者＝最終意思決定者'}),
  flow:Object.freeze(['CORE SCAN','ADAPTIVE SCAN','EVENT TRACE','REFLECTION','STRUCTURE ANALYSIS','SHORT TERM OBSERVATION','RE-ANALYSIS']),
  questionTypes:Object.freeze(['FACT','EVENT','COMPARE','COUNTERFACTUAL','PROTECT']),
  analysis:Object.freeze(['STRUCTURE NODE','CHAIN','LOOP','MULTIPLE HYPOTHESES','SUPPORTING EVIDENCE','COUNTEREVIDENCE','CONTRADICTIONS','EXCEPTIONS','TIMELINE','INTERACTIONS','CONFIDENCE','PERSONAL BASELINE','LEVERAGE POINT','INTERVENTION CANDIDATES','PRIORITY','SHORT TERM OBSERVATION','RE-ANALYSIS']),
  evaluation:Object.freeze(['PROBLEM','IMPACT','FREQUENCY','PERSISTENCE','TREND','CONTROL','EXTERNAL','BUFFER','COST','PROTECTION RISK','LEVERAGE','CONFIDENCE']),
  confidence:Object.freeze(['HIGH','MEDIUM','LOW','INSUFFICIENT']),
  hypothesisState:Object.freeze(['NEW','SUPPORTED','WEAKENED','REJECTED','UNRESOLVED']),
  reanalysisState:Object.freeze(['SUPPORTED','WEAKENED','REJECTED','UNRESOLVED','PERSONAL BASELINE']),
  interventionCompare:Object.freeze(['EXPECTED IMPACT','LEVERAGE','FEASIBILITY','CONFIDENCE','REVERSIBILITY','COST','PROTECTION RISK']),
  outputOrder:Object.freeze(['現在の生活構造','最大ボトルネック','CHAIN/LOOP','主要仮説','根拠','反証・不確実性','機能している部分','保護対象','資源','レバレッジポイント','介入候補','最優先候補','確信度','必要時追加観測']),
  legacy:LEGACY_CANON,legacyCanonVersion:LEGACY_CANON_VERSION,legacySheetSchema:LEGACY_14_SHEETS,legacySheetSchemaVersion:LEGACY_SHEET_SCHEMA_VERSION,legacyReports:LEGACY_REPORT_ASSETS,
  rules:Object.freeze({factFirst:true,singleAnswerCannotProveCause:true,correlationIsNotCausation:true,unknownIsValidResult:true,multipleHypothesesRequired:true,counterevidenceRequired:true,doNothingIsValidOption:true,chain:'根拠ある一方向関係がある場合のみCHAINとして扱う。',loop:'循環維持の証拠がある場合のみLOOPとして扱う。',oldFiveAxes:'行動／判断／環境／感情／回復は内部整理軸。主結果を単純点数化しない。',legacyAssets:'旧40問・旧25問・TYPE8+T99・TAG22・STATE/WARNING役割・PT01〜06名称・旧構造翻訳・旧スコア/比較・専門家優先度・旧14シート全列・旧5部・P1〜P4を履歴/内部互換資産として保持し、未凍結条件は推測実装しない。',aiFinalDecision:false,localFinalInference:false})
});

function valuePresent(v){return !(v===undefined||v===null||v===''||(Array.isArray(v)&&v.length===0));}
function optionFor(q,v){return(q?.options||[]).find(o=>String(o.value)===String(v));}
function specialFor(q,v){return(q?.specialResponses||[]).find(o=>String(o.value)===String(v));}
function labelFor(q,v){return optionFor(q,v)?.label||specialFor(q,v)?.label||String(v);}
function stateFor(q,v){if(!valuePresent(v))return'UNANSWERED';if(Array.isArray(v)){if(v.length===1){const o=optionFor(q,v[0]);if(o?.responseState)return o.responseState;}return'ANSWER';}return optionFor(q,v)?.responseState||specialFor(q,v)?.responseState||'ANSWER';}
function answerRecord(q,v,extras={}){const selectedValues=Array.isArray(v)?[...v]:(q?.options&&valuePresent(v)?[v]:[]);const selectedLabels=selectedValues.map(x=>labelFor(q,x));const responseState=stateFor(q,v);const rawText=!Array.isArray(v)&&!q?.options&&responseState==='ANSWER'?String(v):null;const answerLabel=Array.isArray(v)?selectedLabels.join(' / '):(valuePresent(v)?labelFor(q,v):null);return{questionId:q.questionId,questionDbVersion:q.version||null,questionDefinitionVersion:q.version||null,type:q.type,domain:q.domain,timeRange:q.timeRange,questionText:q.text,text:q.text,answerType:q.answerType,optionSnapshot:(q.options||[]).map(o=>({value:o.value,label:o.label,responseState:o.responseState||'ANSWER'})),responseState,answer:v,answerValue:Array.isArray(v)?null:v,answerLabel,rawText,selectedOptionValues:selectedValues,selectedOptionLabels:selectedLabels,answerExtra:extras[q.questionId]||null};}
function clone(v){return v==null?v:structuredClone(v);}
function stampLegacyItems(items,version){return(items||[]).map(x=>({...clone(x),questionDbVersion:x.questionDbVersion||version||null,questionDefinitionVersion:x.questionDefinitionVersion||version||null,questionText:x.questionText||x.text||null}));}

export function buildAnalysisPacket(state,{CORE,ADAPTIVE,EVENT_TRACE,REFLECTION,SHORT_TERM_OBSERVATION=[]},meta={}){
  const currentAnswers=state.answers||{};const extras=state.answerExtras||{};const pick=(list)=>list.filter(q=>valuePresent(currentAnswers[q.questionId])).map(q=>answerRecord(q,currentAnswers[q.questionId],extras));
  const base=state.baseAnalysisPacket&&typeof state.baseAnalysisPacket==='object'?state.baseAnalysisPacket:null;const mixed=!!(base?.questionDbVersion&&meta.questionDbVersion&&base.questionDbVersion!==meta.questionDbVersion);
  let core,adaptive,eventTrace,reflection;
  if(mixed){const bv=base.questionDbVersion;core=stampLegacyItems(base.core,bv);adaptive=stampLegacyItems(base.adaptive,bv);eventTrace=stampLegacyItems(base.eventTrace,bv);reflection=stampLegacyItems(base.reflection,bv);}else{core=pick(CORE);adaptive=pick(ADAPTIVE.filter(q=>(state.adaptiveQuestionIds||[]).includes(q.questionId)));eventTrace=pick(EVENT_TRACE);reflection=pick(REFLECTION);}
  const shortTermObservation=pick(SHORT_TERM_OBSERVATION);
  const baseAnswers=mixed?(base.answers||base.rawAnswers||{}):{};const answers={...clone(baseAnswers),...clone(currentAnswers)};
  const historicalRecords=mixed?(base.answerRecords?.length?clone(base.answerRecords):[...core,...adaptive,...eventTrace,...reflection]):[];
  const currentRecords=mixed?[...shortTermObservation]:[...core,...adaptive,...eventTrace,...reflection,...shortTermObservation];
  return{schemaVersion:'LRA-STRUCTURE-PACKET-2.0',packetVersion:meta.packetVersion||null,questionDbVersion:meta.questionDbVersion||null,baseQuestionDbVersion:mixed?base.questionDbVersion:null,mixedQuestionDefinitions:mixed,legacyCanonVersion:LEGACY_CANON_VERSION,legacySheetSchemaVersion:LEGACY_SHEET_SCHEMA_VERSION,userId:state.userId||null,lraId:state.lraId,analysisCount:Number(state.analysisCount||1),outputId:state.outputId||null,planId:state.planCode,planCode:state.planCode,eventTraceUsed:mixed?base.eventTraceUsed:state.eventTraceUsed,adaptiveQuestionIds:mixed?[...(base.adaptiveQuestionIds||[])]:[...(state.adaptiveQuestionIds||[])],observedAt:state.savedAt||new Date().toISOString(),answers,rawAnswers:answers,answerExtras:clone(extras),answerRecords:[...historicalRecords,...currentRecords],core,adaptive,eventTrace,reflection,shortTermObservation,requiredAnalysis:[...LRA_CANON.analysis],evaluationElements:[...LRA_CANON.evaluation],hypothesisStates:[...LRA_CANON.hypothesisState],reanalysisStates:[...LRA_CANON.reanalysisState],interventionComparison:[...LRA_CANON.interventionCompare],outputOrder:[...LRA_CANON.outputOrder],legacyCompatibility:{canon:LEGACY_CANON,sheets:LEGACY_14_SHEETS,reports:LEGACY_REPORT_ASSETS},constraints:{diagnosis:false,simpleScoring:false,singleCauseAssertion:false,aiFinalDecision:false,localFinalInference:false,unfrozenLegacyRulesMayNotBeInvented:true,preserveResponseState:true,preserveHistoricalSemantics:true}};
}
