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
  rules:Object.freeze({
    factFirst:true,
    singleAnswerCannotProveCause:true,
    correlationIsNotCausation:true,
    unknownIsValidResult:true,
    multipleHypothesesRequired:true,
    counterevidenceRequired:true,
    doNothingIsValidOption:true,
    chain:'一方向の影響根拠がある場合のみCHAINとして扱う。',
    loop:'循環が確認できる場合のみLOOPとして扱う。',
    oldFiveAxes:'行動／判断／環境／感情／回復は内部整理軸。主結果を単純点数化しない。',
    oldAssets:'TYPE8+T99／TAG22／STATE／WARNING／旧構造翻訳／旧スコア・比較系は履歴・内部資産として保持し、新分析の主判定へ戻さない。',
    aiFinalDecision:false
  })
});

export function buildAnalysisPacket(state,{CORE,ADAPTIVE,EVENT_TRACE,REFLECTION,SHORT_TERM_OBSERVATION=[]},meta={}){
  const pick=(list)=>list.map(q=>({questionId:q.questionId,type:q.type,domain:q.domain,timeRange:q.timeRange,text:q.text,answer:state.answers?.[q.questionId]})).filter(x=>x.answer!==undefined);
  return {
    schemaVersion:'LRA-STRUCTURE-PACKET-1.0',
    packetVersion:meta.packetVersion||null,
    questionDbVersion:meta.questionDbVersion||null,
    lraId:state.lraId,
    analysisCount:Number(state.analysisCount||1),
    outputId:state.outputId||null,
    observedAt:state.savedAt||new Date().toISOString(),
    planCode:state.planCode,
    core:pick(CORE),
    adaptive:pick(ADAPTIVE.filter(q=>(state.adaptiveQuestionIds||[]).includes(q.questionId))),
    eventTrace:pick(EVENT_TRACE),
    reflection:pick(REFLECTION),
    shortTermObservation:pick(SHORT_TERM_OBSERVATION),
    rawAnswers:state.answers||{},
    requiredAnalysis:[...LRA_CANON.analysis],
    evaluationElements:[...LRA_CANON.evaluation],
    hypothesisStates:[...LRA_CANON.hypothesisState],
    interventionComparison:[...LRA_CANON.interventionCompare],
    outputOrder:[...LRA_CANON.outputOrder],
    constraints:{diagnosis:false,simpleScoring:false,singleCauseAssertion:false,aiFinalDecision:false}
  };
}
