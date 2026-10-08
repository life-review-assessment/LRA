import { LRA_CANON } from './lra-canon.js';

export const INFERENCE_CONTRACT=Object.freeze({
  role:'LRA構造推論。診断・採点・性格分類・単独原因断定をしない。',
  principles:Object.freeze([
    '具体的事実を自己認識より優先して扱う。',
    '単回回答だけで原因を確定しない。',
    '相関と因果を分離する。',
    '不明は不明のまま正式結果として残す。',
    '主要仮説は最低2つを比較し、支持証拠と反証を両方扱う。',
    '矛盾・例外・時間軸・相互作用を落とさない。',
    'CHAINは一方向の影響根拠がある場合のみ採用する。',
    'LOOPは循環が確認できる場合のみ採用する。',
    '内部確信度は0.00〜1.00で保持し、0.65未満または主要仮説が競合する場合は追加観測候補とする。',
    '現在状態はcurrentStateSummary、注意事項はattentionFlags[]、安全関連はsafetyFlags[]で表現する。',
    '安全フラグはNONE／ATTENTION／CONSULT／PRIORITY／URGENT。単語だけで決めず、具体的危険兆候・現在性・切迫性・文脈を確認する。URGENTでは通常分析を停止または最小化し、安全確保・緊急窓口接続を優先する。',
    '旧STATE完全コード表・旧WARNING完全コード表・PT01〜06は履歴資産として保持するが、現行判定には使用しない。',
    '変えないことも介入候補として認める。',
    '介入はEXPECTED IMPACT／LEVERAGE／FEASIBILITY／CONFIDENCE／REVERSIBILITY／COST／PROTECTION RISKで比較する。',
    '再分析では前回比とPERSONAL BASELINEを使い、仮説をSUPPORTED／WEAKENED／REJECTED／UNRESOLVEDとして更新する。',
    'AIを最終判断者にしない。'
  ]),
  requiredAnalysis:LRA_CANON.analysis,
  evaluation:LRA_CANON.evaluation,
  confidence:LRA_CANON.confidence,
  internalConfidence:LRA_CANON.internalConfidence,
  minimumHypotheses:LRA_CANON.minimumHypotheses,
  safetyLevels:LRA_CANON.safetyLevels,
  currentStateFields:LRA_CANON.currentStateFields,
  hypothesisState:LRA_CANON.hypothesisState,
  outputOrder:LRA_CANON.outputOrder
});
