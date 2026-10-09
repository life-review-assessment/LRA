export const QUESTION_DB_VERSION="lra-question-db-1.1.0";
export const PACKET_VERSION="LRA-PACKET-1.1";

export const PLANS=[
  {code:"FREE",name:"無料体験",price:0,category:"まず試す"},
  {code:"LIGHT",name:"ライト",price:980,category:"現在地整理"},
  {code:"STANDARD",name:"スタンダード",price:2980,category:"構造分析"},
  {code:"DEEP",name:"ディープ",price:5980,category:"意思決定支援"},
  {code:"CONTINUOUS",name:"継続分析",price:9800,category:"14日間の変化追跡＋再分析"}
];

export const OPTIONS=[
  {name:"再分析単体",price:"1,980円"},
  {name:"7日ミニ追跡",price:"3,980円"},
  {name:"特定テーマ分析",price:"2,980円"}
];

const SCALE=[
  {value:"0",label:"一度もなかった"},
  {value:"1",label:"1回あった"},
  {value:"2",label:"2〜3回あった"},
  {value:"3",label:"4回以上あった"},
  {value:"4",label:"ほぼ毎日あった"},
  {value:"U",label:"わからない"},
  {value:"S",label:"答えたくない"}
];

const C=[
  ["LRA-CORE-ACTION-01","ACTION","必要なことを始められず、そのまま止まったことがありましたか？",["start_block"]],
  ["LRA-CORE-ACTION-02","ACTION","先送りや中断が続いたことがありましたか？",["delay_repeat"]],
  ["LRA-CORE-ACTION-03","ACTION","何から手をつけるか決められず、行動が止まったことがありましたか？",["action_priority"]],
  ["LRA-CORE-ACTION-04","ACTION","負荷が高いのに行動量を下げられず、消耗したことがありましたか？",["overdo"]],
  ["LRA-CORE-JUDGMENT-01","JUDGMENT","選択肢や情報が多く、決められなくなったことがありましたか？",["information_load"]],
  ["LRA-CORE-JUDGMENT-02","JUDGMENT","判断基準が揺れて、決め直しが続いたことがありましたか？",["criteria_instability"]],
  ["LRA-CORE-JUDGMENT-03","JUDGMENT","周囲の意見や期待で、自分の判断が大きく揺れたことがありましたか？",["external_influence"]],
  ["LRA-CORE-JUDGMENT-04","JUDGMENT","決めた後も考え直しが止まらず、次へ進みにくかったことがありましたか？",["rumination"]],
  ["LRA-CORE-ENVIRONMENT-01","ENVIRONMENT","自分では変えにくい外部事情で予定が崩れたことがありましたか？",["external_constraint"]],
  ["LRA-CORE-ENVIRONMENT-02","ENVIRONMENT","自分のために使える時間や場所が足りないと感じることがありましたか？",["time_space_constraint"]],
  ["LRA-CORE-ENVIRONMENT-03","ENVIRONMENT","金銭・仕事・家庭・人間関係などの制約が、選択や行動を狭めたことがありましたか？",["life_constraint"]],
  ["LRA-CORE-ENVIRONMENT-04","ENVIRONMENT","調整や助けを頼めず、一人で抱えたことがありましたか？",["isolation"]],
  ["LRA-CORE-EMOTION-01","EMOTION","不安・苛立ち・落ち込みなどが、行動や判断に影響したことがありましたか？",["emotion_impact"]],
  ["LRA-CORE-EMOTION-02","EMOTION","気持ちを抑え続けること自体が負担になったことがありましたか？",["suppression"]],
  ["LRA-CORE-EMOTION-03","EMOTION","自分がなぜそう感じているのか分からず、整理しにくいことがありましたか？",["emotion_unclear"]],
  ["LRA-CORE-EMOTION-04","EMOTION","安心・楽しさ・満足を感じる時間がほとんどないと感じることがありましたか？",["positive_low"]],
  ["LRA-CORE-RECOVERY-01","RECOVERY","休んでも疲れや消耗感が残ることがありましたか？",["slow_recovery"]],
  ["LRA-CORE-RECOVERY-02","RECOVERY","休む必要を感じても、休む時間を確保できないことがありましたか？",["rest_shortage"]],
  ["LRA-CORE-RECOVERY-03","RECOVERY","一度止まったあと、再開するまでに大きな負担がかかることがありましたか？",["restart_cost"]],
  ["LRA-CORE-RECOVERY-04","RECOVERY","負荷の影響が翌日以降まで残ることがありましたか？",["carry_over"]]
];

export const CORE=C.map(([questionId,domain,text,branchTags])=>({questionId,stage:'CORE',type:'FACT',domain,timeRange:'直近14日',text,answerType:'single_choice',options:SCALE,branchTags,required:true,version:QUESTION_DB_VERSION}));

const A=[
  ["LRA-ADP-ACTION-01","EVENT","ACTION","一番最近、行動が止まった具体的な場面を短く書いてください。","text_short",null,["start_block","delay_repeat","action_priority"]],
  ["LRA-ADP-ACTION-02","FACT","ACTION","その場面で、行動を止めた要因として当てはまるものを選んでください。（複数選択可）","multi_choice",[
    {value:"time",label:"時間が足りなかった"},
    {value:"fatigue",label:"疲労・消耗が大きかった"},
    {value:"uncertainty",label:"やり方や判断基準が分からなかった"},
    {value:"external",label:"外部事情・他者都合が影響した"},
    {value:"emotion",label:"不安・抵抗感など、気持ちの負担があった"},
    {value:"money",label:"金銭的な制約があった"},
    {value:"other",label:"その他"},
    {value:"unknown",label:"わからない"}
  ],["start_block","delay_repeat","action_priority"]],
  ["LRA-ADP-ACTION-03","COMPARE","ACTION","比較的動けた日と、動けなかった日の違いは何でしたか？","text_short",null,["start_block","delay_repeat"]],
  ["LRA-ADP-ACTION-04","COUNTERFACTUAL","ACTION","一つだけ障害を外せるなら、何を外すと最初に動きやすくなると思いますか？","text_short",null,["start_block","action_priority","overdo"]],
  ["LRA-ADP-ACTION-05","PROTECT","ACTION","減らしても大きな損失につながりにくい行動はありますか？","text_short",null,["overdo","delay_repeat"]],
  ["LRA-ADP-JUDGMENT-01","EVENT","JUDGMENT","一番最近、決められず止まった場面では何を決めようとしていましたか？","text_short",null,["information_load","criteria_instability","rumination"]],
  ["LRA-ADP-JUDGMENT-02","FACT","JUDGMENT","その判断で、絶対に守りたかった条件は何でしたか？","text_short",null,["criteria_instability","external_influence","rumination"]],
  ["LRA-ADP-JUDGMENT-03","COMPARE","JUDGMENT","同じような判断でも、比較的決めやすかった時との違いは何でしたか？","text_short",null,["information_load","criteria_instability"]],
  ["LRA-ADP-JUDGMENT-04","COUNTERFACTUAL","JUDGMENT","判断材料を一つ減らすなら、何を減らすと決めやすくなりそうですか？","text_short",null,["information_load","rumination"]],
  ["LRA-ADP-JUDGMENT-05","PROTECT","JUDGMENT","決断を早めても失いたくない基準・価値は何ですか？","text_short",null,["external_influence","criteria_instability"]],
  ["LRA-ADP-ENVIRONMENT-01","EVENT","ENVIRONMENT","最近、外部事情で予定や判断が崩れた具体的な場面を書いてください。","text_short",null,["external_constraint","life_constraint"]],
  ["LRA-ADP-ENVIRONMENT-02","FACT","ENVIRONMENT","その制約は、自分で調整できる部分と調整できない部分に分けるとどうなりますか？","text_long",null,["external_constraint","life_constraint"]],
  ["LRA-ADP-ENVIRONMENT-03","COMPARE","ENVIRONMENT","同じ環境でも負担が小さかった時には、何が違っていましたか？","text_short",null,["time_space_constraint","life_constraint"]],
  ["LRA-ADP-ENVIRONMENT-04","COUNTERFACTUAL","ENVIRONMENT","周囲の条件を一つだけ変えられるなら、何を変えると最も影響が大きいですか？","text_short",null,["external_constraint","time_space_constraint","life_constraint"]],
  ["LRA-ADP-ENVIRONMENT-05","PROTECT","ENVIRONMENT","今の環境の中で、変えずに残したい支え・人・場所・習慣はありますか？","text_short",null,["isolation","life_constraint","time_space_constraint"]],
  ["LRA-ADP-EMOTION-01","EVENT","EMOTION","最近、気持ちが行動や判断を大きく動かした具体的な場面を書いてください。","text_short",null,["emotion_impact","suppression"]],
  ["LRA-ADP-EMOTION-02","FACT","EMOTION","その時、最初に変化したのはどれでしたか？","single_choice",[
    {value:"body",label:"身体の状態"},
    {value:"thought",label:"考え方・思考"},
    {value:"action",label:"行動"},
    {value:"unknown",label:"わからない"}
  ],["emotion_impact","emotion_unclear"]],
  ["LRA-ADP-EMOTION-03","COMPARE","EMOTION","気持ちが強くても比較的動けた時との違いは何でしたか？","text_short",null,["emotion_impact","suppression"]],
  ["LRA-ADP-EMOTION-04","COUNTERFACTUAL","EMOTION","気持ちそのものを変えなくても、影響を小さくできる条件は何だと思いますか？","text_short",null,["emotion_impact","emotion_unclear"]],
  ["LRA-ADP-EMOTION-05","PROTECT","EMOTION","今の自分にとって、安心・楽しさ・落ち着きを少しでも支えているものは何ですか？","text_short",null,["positive_low","suppression"]],
  ["LRA-ADP-RECOVERY-01","EVENT","RECOVERY","最近、休んでも戻りきらなかった具体的な場面を書いてください。","text_short",null,["slow_recovery","carry_over"]],
  ["LRA-ADP-RECOVERY-02","FACT","RECOVERY","休む前に大きかった負荷として、当てはまるものを選んでください。（複数選択可）","multi_choice",[
    {value:"physical",label:"身体的な疲れ・負担"},
    {value:"mental",label:"考え続けることによる負担"},
    {value:"emotion",label:"感情面の負担"},
    {value:"social",label:"人との関わりによる負担"},
    {value:"time",label:"時間不足による負担"},
    {value:"other",label:"その他"},
    {value:"unknown",label:"わからない"}
  ],["slow_recovery","carry_over"]],
  ["LRA-ADP-RECOVERY-03","COMPARE","RECOVERY","比較的回復できた日との違いは何でしたか？","text_short",null,["slow_recovery","rest_shortage","carry_over"]],
  ["LRA-ADP-RECOVERY-04","COUNTERFACTUAL","RECOVERY","30分だけ余白を増やせるなら、どこに入れると最も回復に効きそうですか？","text_short",null,["rest_shortage","restart_cost"]],
  ["LRA-ADP-RECOVERY-05","PROTECT","RECOVERY","回復のために残したい習慣・時間・場所はありますか？","text_short",null,["slow_recovery","rest_shortage","restart_cost","carry_over"]],
  ["LRA-ADP-CROSS-01","COMPARE","CROSS","ここ2週間で、状況が一時的に良くなった日はありましたか？ 何が違いましたか？","text_short",null,["cross"]],
  ["LRA-ADP-CROSS-02","PROTECT","CROSS","今の生活で「これだけは失いたくない」と感じる要素は何ですか？","text_short",null,["cross"]],
  ["LRA-ADP-CROSS-03","COUNTERFACTUAL","CROSS","今の問題が半分だけ軽くなったとしたら、最初に何ができるようになると思いますか？","text_short",null,["cross"]],
  ["LRA-ADP-CROSS-04","PROTECT","CROSS","今後手に入れたいもの・増やしたい状態があれば書いてください。","text_short",null,["cross"]],
  ["LRA-ADP-CROSS-05","FACT","CROSS","すでに使える支援・時間・人・場所・道具で、まだ十分使えていないものはありますか？","text_short",null,["cross"]]
];

export const ADAPTIVE=A.map(([questionId,type,domain,text,answerType,options,branchTags])=>({questionId,stage:'ADAPTIVE',type,domain,timeRange:'直近14日を中心に具体例',text,answerType,options,branchTags,required:false,version:QUESTION_DB_VERSION}));

const E=[
  ["LRA-EVT-01","EVENT","影響が大きかった出来事を、事実だけで短く書いてください。","text_long"],
  ["LRA-EVT-02","FACT","それはいつ頃起きましたか？","text_long"],
  ["LRA-EVT-03","EVENT","その直後、生活の中で最初に変わったことは何でしたか？","text_long"],
  ["LRA-EVT-04","EVENT","その出来事のあと、行動や判断はどう変わりましたか？","text_long"],
  ["LRA-EVT-05","PROTECT","その出来事によって失ったもの、または守れたものはありますか？","text_long"],
  ["LRA-EVT-06","COMPARE","以前にも似た出来事や似た反応がありましたか？","text_long"],
  ["LRA-EVT-07","COUNTERFACTUAL","その出来事がなかったとしたら、今と何が違っていたと思いますか？","text_long"],
  ["LRA-EVT-08","FACT","その出来事の影響で、今も残っているものは何ですか？","text_long"]
];
export const EVENT_TRACE=E.map(([questionId,type,text,answerType])=>({questionId,stage:'EVENT_TRACE',type,domain:'CROSS',timeRange:'対象出来事',text,answerType,options:null,branchTags:['event'],required:false,version:QUESTION_DB_VERSION}));

const R=[
  ["LRA-REF-01","FACT","今一番困っていること"],
  ["LRA-REF-02","FACT","最近増えた負担"],
  ["LRA-REF-03","FACT","自分で考える原因"],
  ["LRA-REF-04","FACT","今すぐ変えたいこと"],
  ["LRA-REF-05","PROTECT","変えたくないこと"],
  ["LRA-REF-06","FACT","3か月後どうなっていたいか"],
  ["LRA-REF-07","PROTECT","一番失いたくないもの"],
  ["LRA-REF-08","FACT","今できること"]
];
export const REFLECTION=R.map(([questionId,type,text])=>({questionId,stage:'REFLECTION',type,domain:'CROSS',timeRange:'現在',text,answerType:'text_long',options:null,branchTags:['reflection'],required:false,version:QUESTION_DB_VERSION}));