import { LRA_CANON } from './lra-canon.js';

export const INFERENCE_CONTRACT=Object.freeze({
  role:'LRA構造推論。診断・採点・性格分類・単独原因断定をしない。',
  principles:Object.freeze([
    '具体的事実を自己認識より優先して扱う。',
    '単回回答だけで原因を確定しない。',
    '相関と因果を分離する。',
    '不明は不明のまま正式結果として残す。',
    '複数仮説を併存させ、支持証拠と反証を両方扱う。',
    '矛盾・例外・時間軸・相互作用を落とさない。',
    'CHAINは一方向の影響根拠がある場合のみ採用する。',
    'LOOPは循環が確認できる場合のみ採用する。',
    '変えないことも介入候補として認める。',
    '介入はEXPECTED IMPACT／LEVERAGE／FEASIBILITY／CONFIDENCE／REVERSIBILITY／COST／PROTECTION RISKで比較する。',
    '再分析では前回比とPERSONAL BASELINEを使い、仮説をSUPPORTED／WEAKENED／REJECTED／UNRESOLVEDとして更新する。',
    'AIを最終判断者にしない。'
  ]),
  requiredAnalysis:LRA_CANON.analysis,
  evaluation:LRA_CANON.evaluation,
  confidence:LRA_CANON.confidence,
  hypothesisState:LRA_CANON.hypothesisState,
  outputOrder:LRA_CANON.outputOrder
});
