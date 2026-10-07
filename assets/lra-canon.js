export const LRA_CANON=Object.freeze({
  purpose:'意思決定支援。診断・採点・性格分類ではない。',
  roles:Object.freeze({web:'観測装置',inference:'ChatGPT＝外部推論装置',canon:'LRA正本＝判断基準',decision:'利用者＝最終意思決定者'}),
  flow:Object.freeze(['CORE SCAN','ADAPTIVE SCAN','EVENT TRACE','STRUCTURE ANALYSIS','SHORT TERM OBSERVATION','RE-ANALYSIS']),
  questionTypes:Object.freeze(['FACT','EVENT','COMPARE','COUNTERFACTUAL','PROTECT']),
  analysis:Object.freeze(['STRUCTURE NODE','CHAIN','LOOP','MULTIPLE HYPOTHESES','SUPPORTING EVIDENCE','COUNTEREVIDENCE','CONTRADICTIONS','EXCEPTIONS','TIMELINE','INTERACTIONS','CONFIDENCE','PERSONAL BASELINE','LEVERAGE POINT','INTERVENTION CANDIDATES','PRIORITY','SHORT TERM OBSERVATION','RE-ANALYSIS']),
  evaluation:Object.freeze(['PROBLEM','IMPACT','FREQUENCY','PERSISTENCE','TREND','CONTROL','EXTERNAL','BUFFER','COST','PROTECTION RISK','LEVERAGE','CONFIDENCE']),
  confidence:Object.freeze(['HIGH','MEDIUM','LOW','INSUFFICIENT']),
  hypothesisState:Object.freeze(['NEW','SUPPORTED','WEAKENED','REJECTED','UNRESOLVED']),
  interventionCompare:Object.freeze(['EXPECTED IMPACT','LEVERAGE','FEASIBILITY','CONFIDENCE','REVERSIBILITY','COST','PROTECTION RISK']),
  outputOrder:Object.freeze(['現在の生活構造','最大ボトルネック','CHAIN/LOOP','主要仮説','根拠','反証・不確実性','機能している部分','保護対象','資源','レバレッジポイント','介入候補','最優先候補','確信度','必要時追加観測']),
  legacy:Object.freeze({
    fiveAxes:Object.freeze(['行動','判断','環境','感情','回復']),
    typeCodes:Object.freeze(['T01','T02','T03','T04','T05','T06','T07','T08','T99']),
    tagCount:22,
    retained:Object.freeze(['TYPE8+T99','TAG22','STATE','WARNING','旧構造翻訳','原因','維持','喪失','獲得','優先介入','旧スコア','旧比較系']),
    compatibilityCodes:Object.freeze(['ST01','ST02','ST03','ST04','ST05','ST06','ST07','ST99','R01','R02','R03','OUT-','LOG-']),
    usage:'履歴・内部互換資産。新LRAの主結果・単純点数判定へ戻さない。'
  }),
  rules:Object.freeze({
    factFirst:true,
    singleAnswerCannotProveCause:true,
    correlationIsNotCausation:true,
    unknownIsValidResult:true,
    multipleHypothesesRequired:true,
    counterevidenceRequired:true,
    doNothingIsValidOption:true,
    chain:'根拠ある一方向関係がある場合のみCHAINとして扱う。',
    loop:'循環維持の証拠がある場合のみLOOPとして扱う。',
    oldFiveAxes:'行動／判断／環境／感情／回復は内部整理軸。主結果を単純点数化しない。',
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
    hypothesisStates:[...LRA_CANON.hypothesisState],
    interventionComparison:[...LRA_CANON.interventionCompare],
    outputOrder:[...LRA_CANON.outputOrder],
    legacyCompatibility:LRA_CANON.legacy,
    constraints:{diagnosis:false,simpleScoring:false,singleCauseAssertion:false,aiFinalDecision:false,localFinalInference:false}
  };
}
