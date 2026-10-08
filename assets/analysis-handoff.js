export function buildAnalysisPrompt(packet){
  const schema={
    currentStructure:'string',
    bottleneck:'string',
    chainLoop:'string',
    hypotheses:['string','string'],
    evidence:['string'],
    counterUncertainty:['string'],
    functionalParts:['string'],
    protect:['string'],
    resources:['string'],
    leverage:['string'],
    interventions:['string'],
    topPriority:'string',
    confidence:'HIGH|MEDIUM|LOW|INSUFFICIENT',
    additionalObservation:['string'],
    internal:{
      structureNodes:['object'],
      chain:['object'],
      loop:['object'],
      hypothesisStates:['NEW|SUPPORTED|WEAKENED|REJECTED|UNRESOLVED'],
      contradictions:['string'],
      exceptions:['string'],
      timeline:['object'],
      interactions:['object'],
      confidenceScore:'number 0.00-1.00',
      currentStateSummary:'string',
      attentionFlags:['string'],
      safetyFlags:['NONE|ATTENTION|CONSULT|PRIORITY|URGENT'],
      personalBaseline:'object',
      legacyCompatibility:'object'
    },
    review:{needsHumanReview:true,notes:['string']}
  };
  return `あなたはLRA（Life Review Assessment）の外部推論担当です。\n\n目的は診断ではなく意思決定支援です。以下を絶対条件として分析してください。\n- 具体的事実を自己認識より優先する。\n- 単一回答だけで原因を確定しない。\n- 相関と因果を分離する。\n- 不明は不明のまま正式結果として残す。\n- 主要仮説は最低2つを比較し、1仮説で断定しない。\n- 支持証拠と反証の両方を扱う。\n- 矛盾・例外・時間軸・相互作用を落とさない。\n- 根拠ある一方向関係だけをCHAINとする。\n- 循環維持の証拠がある場合だけLOOPとする。\n- 内部確信度は0.00〜1.00で保持し、0.65未満または主要仮説が競合する場合は追加観測候補とする。\n- 現在状態はcurrentStateSummary、注意事項はattentionFlags[]、安全関連はsafetyFlags[]で保持する。\n- safetyFlagsはNONE／ATTENTION／CONSULT／PRIORITY／URGENTの5段階とし、単語だけで決めず、具体的危険兆候・現在性・切迫性・文脈を確認する。URGENTでは通常分析を停止または最小化し、安全確保・緊急窓口接続を優先する。\n- 5軸は内部整理軸であり、主結果を単純点数化しない。\n- TYPE/TAG/STATE/WARNING/PT等の旧資産は内部互換資産として保持し、旧STATE完全コード表・旧WARNING完全コード表・PT01〜06を現行判定ロジックへ戻さない。\n- 介入候補はEXPECTED IMPACT／LEVERAGE／FEASIBILITY／CONFIDENCE／REVERSIBILITY／COST／PROTECTION RISKで比較する。\n- 変えないことも候補に含める。\n- AIを最終判断者にしない。\n- 診断・病名推定・医療判断・法律判断・金融判断・専門家代替をしない。\n\n結果は説明文を付けず、次のJSON構造だけで返してください。\n${JSON.stringify(schema,null,2)}\n\n分析パケット:\n${JSON.stringify(packet,null,2)}`;
}
