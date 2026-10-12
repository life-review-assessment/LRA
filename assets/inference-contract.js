import { LRA_CANON } from './lra-canon.js';

export const INFERENCE_CONTRACT=Object.freeze({
  role:'LRA構造推論。診断・採点・性格分類・単独原因断定をしない。',
  principles:Object.freeze([
    '具体的事実を自己認識より優先して扱う。',
    '本人の希望や本人仮説を、そのまま原因事実へ昇格させない。',
    '単回回答だけで原因を確定しない。',
    '相関と因果を分離する。',
    '不明は不明のまま正式結果として残す。',
    '複数仮説を併存させ、支持証拠と反証を両方扱う。',
    '矛盾・回答意味ずれ・例外・時間軸・相互作用を落とさない。',
    '回答意味ずれは内容を破棄せず、本来質問への直接証拠としての確信度を下げる。',
    '確信度は証拠の独立性・一致・反証・未回答・別仮説を基準にし、単純点数で決めない。',
    '追加観測は矛盾・意味ずれ・重要仮説の証拠不足を比較するために必要な場合だけ生成する。',
    'CHAINは一方向の影響根拠がある場合のみ採用する。',
    'LOOPは循環が確認できる場合のみ採用する。',
    '回答の言い換えで終わらず、条件・場面・順序・維持要因まで構造化する。',
    '観測事実と解釈を分離し、因果方向が未確定なら方向未確定の仮説として保持する。',
    '文章の強さは断定ではなく、根拠・具体性・構造の明瞭さで作る。',
    '保護対象と利用可能な資源を先に確認し、それらを不必要に壊す介入を優先しない。',
    '変えないことも介入候補として認める。',
    '介入はEXPECTED IMPACT／LEVERAGE／FEASIBILITY／CONFIDENCE／REVERSIBILITY／COST／PROTECTION RISKで比較する。',
    '旧仕様の未凍結数値や判定閾値を推測で復活させない。',
    '内部分析正本と顧客向け文章を分離する。',
    '再分析では前回比とPERSONAL BASELINEを使い、継続・変化・強化・弱化・棄却・未確定を区別して仮説を更新する。',
    '前回結果にない事情を、前回から存在していた事実として補完しない。',
    'AIを最終判断者にしない。'
  ]),
  requiredAnalysis:LRA_CANON.analysis,
  evaluation:LRA_CANON.evaluation,
  confidence:LRA_CANON.confidence,
  hypothesisState:LRA_CANON.hypothesisState,
  outputOrder:LRA_CANON.outputOrder
});
