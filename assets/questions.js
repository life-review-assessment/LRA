export const QUESTION_DB_VERSION="lra-question-db-1.1.2";
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
  ["LRA-CORE-ACTION-01","ACTION","やる必要があることに、なかなか取りかかれないことがありましたか？",["start_block"]],
  ["LRA-CORE-ACTION-02","ACTION","やろうと思っていたことを後回しにしたり、途中でやめたりすることが続きましたか？",["delay_repeat"]],
  ["LRA-CORE-ACTION-03","ACTION","何から始めるか決められず、動けなくなることがありましたか？",["action_priority"]],
  ["LRA-CORE-ACTION-04","ACTION","疲れていたり負担が大きかったりしても、やる量を減らせず無理をしたことがありましたか？",["overdo"]],
  ["LRA-CORE-JUDGMENT-01","JUDGMENT","選ぶものや考えることが多すぎて、決められなくなることがありましたか？",["information_load"]],
  ["LRA-CORE-JUDGMENT-02","JUDGMENT","何を基準に決めるか迷い、いったん決めてもやり直すことがありましたか？",["criteria_instability"]],
  ["LRA-CORE-JUDGMENT-03","JUDGMENT","周りの人の意見や期待が気になって、自分の考えが揺れることがありましたか？",["external_influence"]],
  ["LRA-CORE-JUDGMENT-04","JUDGMENT","決めたあとも「これでよかったのか」と考え続け、次に進みにくいことがありましたか？",["rumination"]],
  ["LRA-CORE-ENVIRONMENT-01","ENVIRONMENT","自分ではどうにもできない事情で、予定どおりに進められないことがありましたか？",["external_constraint"]],
  ["LRA-CORE-ENVIRONMENT-02","ENVIRONMENT","自分のために使える時間や、落ち着いて過ごせる場所が足りないと感じることがありましたか？",["time_space_constraint"]],
  ["LRA-CORE-ENVIRONMENT-03","ENVIRONMENT","お金・仕事・家庭・人間関係などの事情で、やりたいことや選べることが限られることがありましたか？",["life_constraint"]],
  ["LRA-CORE-ENVIRONMENT-04","ENVIRONMENT","誰かに相談したり助けを頼んだりできず、一人で抱え込むことがありましたか？",["isolation"]],
  ["LRA-CORE-EMOTION-01","EMOTION","不安、イライラ、落ち込みなどの気持ちで、やることや決めることに影響が出たことがありましたか？",["emotion_impact"]],
  ["LRA-CORE-EMOTION-02","EMOTION","気持ちを我慢したり抑えたりし続けることが、つらいと感じることがありましたか？",["suppression"]],
  ["LRA-CORE-EMOTION-03","EMOTION","自分でもなぜそう感じるのか分からず、気持ちを整理しにくいことがありましたか？",["emotion_unclear"]],
  ["LRA-CORE-EMOTION-04","EMOTION","安心したり、楽しい・満足したと感じたりする時間が、ほとんどないことがありましたか？",["positive_low"]],
  ["LRA-CORE-RECOVERY-01","RECOVERY","休んでも、疲れやつらさが残ることがありましたか？",["slow_recovery"]],
  ["LRA-CORE-RECOVERY-02","RECOVERY","休みたいと思っても、休む時間を取れないことがありましたか？",["rest_shortage"]],
  ["LRA-CORE-RECOVERY-03","RECOVERY","いったん休んだり止めたりしたあと、もう一度始めるのが大変だと感じることがありましたか？",["restart_cost"]],
  ["LRA-CORE-RECOVERY-04","RECOVERY","疲れや負担が、次の日以降まで残ることがありましたか？",["carry_over"]]
];

export const CORE=C.map(([questionId,domain,text,branchTags])=>({questionId,stage:'CORE',type:'FACT',domain,timeRange:'直近14日',text,answerType:'single_choice',options:SCALE,branchTags,required:true,version:QUESTION_DB_VERSION}));

const A=[
  ["LRA-ADP-ACTION-01","EVENT","ACTION","最近、やろうとしていたのに動けなくなった場面があれば、どんな時だったか短く書いてください。","text_short",null,["start_block","delay_repeat","action_priority"]],
  ["LRA-ADP-ACTION-02","FACT","ACTION","そのとき、動けなくなった理由として近いものを選んでください。いくつでも選べます。","multi_choice",[
    {value:"time",label:"時間が足りなかった"},
    {value:"fatigue",label:"疲れていた・消耗していた"},
    {value:"uncertainty",label:"やり方や、どう決めればいいか分からなかった"},
    {value:"external",label:"自分以外の事情や、相手の都合が影響した"},
    {value:"emotion",label:"不安・抵抗感など、気持ちの負担があった"},
    {value:"money",label:"お金の都合があった"},
    {value:"other",label:"その他"},
    {value:"unknown",label:"わからない"}
  ],["start_block","delay_repeat","action_priority"]],
  ["LRA-ADP-ACTION-03","COMPARE","ACTION","比較的動けた日と、動けなかった日では、何が違っていましたか？","text_short",null,["start_block","delay_repeat"]],
  ["LRA-ADP-ACTION-04","COUNTERFACTUAL","ACTION","動きにくくしているものを一つだけなくせるとしたら、何がなくなると始めやすそうですか？","text_short",null,["start_block","action_priority","overdo"]],
  ["LRA-ADP-ACTION-05","PROTECT","ACTION","今やっていることの中で、少し減らしてもあまり困らなそうなことはありますか？","text_short",null,["overdo","delay_repeat"]],
  ["LRA-ADP-JUDGMENT-01","EVENT","JUDGMENT","最近、なかなか決められなかった場面では、何を決めようとしていましたか？","text_short",null,["information_load","criteria_instability","rumination"]],
  ["LRA-ADP-JUDGMENT-02","FACT","JUDGMENT","そのとき、「ここだけは譲れない」と思っていたことは何ですか？","text_short",null,["criteria_instability","external_influence","rumination"]],
  ["LRA-ADP-JUDGMENT-03","COMPARE","JUDGMENT","似たようなことでも、比較的すぐ決められた時は、何が違っていましたか？","text_short",null,["information_load","criteria_instability"]],
  ["LRA-ADP-JUDGMENT-04","COUNTERFACTUAL","JUDGMENT","考える材料を一つだけ減らすとしたら、何を減らすと決めやすくなりそうですか？","text_short",null,["information_load","rumination"]],
  ["LRA-ADP-JUDGMENT-05","PROTECT","JUDGMENT","早めに決めるとしても、これだけは大切にしたいと思うことは何ですか？","text_short",null,["external_influence","criteria_instability"]],
  ["LRA-ADP-ENVIRONMENT-01","EVENT","ENVIRONMENT","最近、自分では変えにくい事情によって、予定どおりにいかなかった場面があれば書いてください。","text_short",null,["external_constraint","life_constraint"]],
  ["LRA-ADP-ENVIRONMENT-02","FACT","ENVIRONMENT","その事情の中で、自分で変えられそうなことと、変えにくいことはそれぞれ何ですか？","text_long",null,["external_constraint","life_constraint"]],
  ["LRA-ADP-ENVIRONMENT-03","COMPARE","ENVIRONMENT","同じような状況でも、あまり負担を感じなかった時は、何が違っていましたか？","text_short",null,["time_space_constraint","life_constraint"]],
  ["LRA-ADP-ENVIRONMENT-04","COUNTERFACTUAL","ENVIRONMENT","周りの状況を一つだけ変えられるとしたら、何を変えると今の負担が一番軽くなりそうですか？","text_short",null,["external_constraint","time_space_constraint","life_constraint"]],
  ["LRA-ADP-ENVIRONMENT-05","PROTECT","ENVIRONMENT","今の生活の中で、変えずに残したい人・場所・習慣・支えはありますか？","text_short",null,["isolation","life_constraint","time_space_constraint"]],
  ["LRA-ADP-EMOTION-01","EVENT","EMOTION","最近、気持ちの変化が、行動や決め方に大きく影響した場面があれば書いてください。","text_short",null,["emotion_impact","suppression"]],
  ["LRA-ADP-EMOTION-02","FACT","EMOTION","そのとき、最初に変化を感じたのはどれですか？","single_choice",[
    {value:"body",label:"体の状態や感覚"},
    {value:"thought",label:"考え方や頭に浮かんだこと"},
    {value:"action",label:"自分の行動"},
    {value:"unknown",label:"はっきりわからない"}
  ],["emotion_impact","emotion_unclear"]],
  ["LRA-ADP-EMOTION-03","COMPARE","EMOTION","気持ちが大きく揺れていても、比較的いつも通り動けた時は、何が違っていましたか？","text_short",null,["emotion_impact","suppression"]],
  ["LRA-ADP-EMOTION-04","COUNTERFACTUAL","EMOTION","気持ちそのものは変わらなくても、その影響を少なくするために、何があるとよさそうですか？","text_short",null,["emotion_impact","emotion_unclear"]],
  ["LRA-ADP-EMOTION-05","PROTECT","EMOTION","今の生活で、少しでも安心できたり、楽しいと感じたり、落ち着けたりするものは何ですか？","text_short",null,["positive_low","suppression"]],
  ["LRA-ADP-RECOVERY-01","EVENT","RECOVERY","最近、休んだのに十分に回復した感じがしなかった場面があれば書いてください。","text_short",null,["slow_recovery","carry_over"]],
  ["LRA-ADP-RECOVERY-02","FACT","RECOVERY","休む前に、どんな疲れや負担が大きかったですか？ 近いものをいくつでも選んでください。","multi_choice",[
    {value:"physical",label:"体の疲れ・負担"},
    {value:"mental",label:"考え続けることによる疲れ"},
    {value:"emotion",label:"気持ちの疲れ・負担"},
    {value:"social",label:"人とのやり取りによる疲れ"},
    {value:"time",label:"時間に余裕がないことによる負担"},
    {value:"other",label:"その他"},
    {value:"unknown",label:"わからない"}
  ],["slow_recovery","carry_over"]],
  ["LRA-ADP-RECOVERY-03","COMPARE","RECOVERY","比較的よく回復できた日と比べて、何が違っていましたか？","text_short",null,["slow_recovery","rest_shortage","carry_over"]],
  ["LRA-ADP-RECOVERY-04","COUNTERFACTUAL","RECOVERY","30分だけ自由に使える時間が増えるとしたら、1日のどの時間に入れると一番休めそうですか？","text_short",null,["rest_shortage","restart_cost"]],
  ["LRA-ADP-RECOVERY-05","PROTECT","RECOVERY","休んだり回復したりするために、今後も残しておきたい習慣・時間・場所はありますか？","text_short",null,["slow_recovery","rest_shortage","restart_cost","carry_over"]],
  ["LRA-ADP-CROSS-01","COMPARE","CROSS","この2週間で、一時的にでも「少し楽だった」「うまくいった」と感じた日はありましたか？ その日は何が違っていましたか？","text_short",null,["cross"]],
  ["LRA-ADP-CROSS-02","PROTECT","CROSS","今の生活の中で、「これだけは失いたくない」と思うものは何ですか？","text_short",null,["cross"]],
  ["LRA-ADP-CROSS-03","COUNTERFACTUAL","CROSS","今の困りごとが半分くらい軽くなったとしたら、まず何ができるようになりそうですか？","text_short",null,["cross"]],
  ["LRA-ADP-CROSS-04","PROTECT","CROSS","これから増やしたいものや、「こうなったらいい」と思う状態があれば書いてください。","text_short",null,["cross"]],
  ["LRA-ADP-CROSS-05","FACT","CROSS","今すでに頼れそうな人や、使える時間・場所・道具・支援の中で、まだ十分に使えていないものはありますか？","text_short",null,["cross"]]
];

export const ADAPTIVE=A.map(([questionId,type,domain,text,answerType,options,branchTags])=>({questionId,stage:'ADAPTIVE',type,domain,timeRange:'直近14日を中心に具体例',text,answerType,options,branchTags,required:false,version:QUESTION_DB_VERSION}));

const E=[
  ["LRA-EVT-01","EVENT","今の生活に大きく影響した出来事について、起きたことを短く書いてください。","text_long"],
  ["LRA-EVT-02","FACT","その出来事は、いつ頃ありましたか？","text_long"],
  ["LRA-EVT-03","EVENT","その直後、生活の中で最初に変わったことは何でしたか？","text_long"],
  ["LRA-EVT-04","EVENT","その出来事のあと、行動や物事の決め方はどう変わりましたか？","text_long"],
  ["LRA-EVT-05","PROTECT","その出来事によって、失ったと感じるもの、または守れたものはありますか？","text_long"],
  ["LRA-EVT-06","COMPARE","以前にも、似た出来事や似た反応がありましたか？","text_long"],
  ["LRA-EVT-07","COUNTERFACTUAL","もしその出来事がなかったとしたら、今の生活は何が違っていたと思いますか？","text_long"],
  ["LRA-EVT-08","FACT","その出来事のあとから、今も続いている変化はありますか？","text_long"]
];
export const EVENT_TRACE=E.map(([questionId,type,text,answerType])=>({questionId,stage:'EVENT_TRACE',type,domain:'CROSS',timeRange:'対象出来事',text,answerType,options:null,branchTags:['event'],required:false,version:QUESTION_DB_VERSION}));

const R=[
  ["LRA-REF-01","FACT","今、いちばん困っていることは何ですか？"],
  ["LRA-REF-02","FACT","最近、新しく増えた負担や、以前より大きくなった負担はありますか？"],
  ["LRA-REF-03","FACT","今の困りごとや負担の原因を、自分ではどう考えていますか？"],
  ["LRA-REF-04","FACT","今、できるだけ早く変えたいことは何ですか？"],
  ["LRA-REF-05","PROTECT","反対に、今のまま残したいことや、変えたくないことは何ですか？"],
  ["LRA-REF-06","FACT","3か月後、今よりどうなっていたいですか？"],
  ["LRA-REF-07","PROTECT","今の生活の中で、いちばん失いたくないものは何ですか？"],
  ["LRA-REF-08","FACT","今の自分にできそうなことがあれば、書いてください。"]
];
export const REFLECTION=R.map(([questionId,type,text])=>({questionId,stage:'REFLECTION',type,domain:'CROSS',timeRange:'現在',text,answerType:'text_long',options:null,branchTags:['reflection'],required:false,version:QUESTION_DB_VERSION}));