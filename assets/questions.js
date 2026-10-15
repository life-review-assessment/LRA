export const QUESTION_DB_VERSION="lra-question-db-2.0.0";
export const PACKET_VERSION="LRA-PACKET-2.0";

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

const UNKNOWN={value:"U",label:"よくわからない",responseState:"UNKNOWN",exclusive:true};
const PREFER_NOT={value:"S",label:"答えたくない",responseState:"PREFER_NOT",exclusive:true};
const special=(value,label,responseState)=>({value,label,responseState});

const CORE_FREQ=[
  {value:"0",label:"まったくなかった",routingSignal:0},
  {value:"1",label:"めったになかった",routingSignal:1},
  {value:"2",label:"ときどきあった",routingSignal:2},
  {value:"3",label:"よくあった",routingSignal:3},
  {value:"4",label:"ほぼいつもあった",routingSignal:4},
  UNKNOWN,PREFER_NOT
];

const CORE_POSITIVE=[
  {value:"0",label:"まったくなかった",routingSignal:4},
  {value:"1",label:"ほとんどなかった",routingSignal:3},
  {value:"2",label:"少しはあった",routingSignal:2},
  {value:"3",label:"ある程度あった",routingSignal:1},
  {value:"4",label:"十分にあった",routingSignal:0},
  UNKNOWN,PREFER_NOT
];

const CORE_ROWS=[
  ["LRA-CORE-ACTION-01","ACTION","やる必要があることに、なかなか取りかかれないことはどのくらいありましたか？","start_block","CORE_FREQ",null],
  ["LRA-CORE-ACTION-02","ACTION","いったん始めたことが、途中で止まったままになることはどのくらいありましたか？","continuation_block","CORE_FREQ",null],
  ["LRA-CORE-ACTION-03","ACTION","やることがいくつかあるとき、何から始めるか決めにくいことはどのくらいありましたか？","action_priority","CORE_FREQ",null],
  ["LRA-CORE-ACTION-04","ACTION","やる量を減らしたいと思っても、減らしにくいことはどのくらいありましたか？","overdo","CORE_FREQ","やる量を減らしたいと思う場面はなかった"],
  ["LRA-CORE-JUDGMENT-01","JUDGMENT","何かを決めるとき、考えることが多すぎると感じることはどのくらいありましたか？","information_load","CORE_FREQ",null],
  ["LRA-CORE-JUDGMENT-02","JUDGMENT","何かを決めるとき、何を基準に選べばよいか分からなくなることはどのくらいありましたか？","criteria_instability","CORE_FREQ",null],
  ["LRA-CORE-JUDGMENT-03","JUDGMENT","何かを決めるとき、周りの人の意見や期待が気になって、自分の考えが揺れることはどのくらいありましたか？","external_influence","CORE_FREQ",null],
  ["LRA-CORE-JUDGMENT-04","JUDGMENT","何かを決めたあとも、「これでよかったのか」と考え続けることはどのくらいありましたか？","rumination","CORE_FREQ",null],
  ["LRA-CORE-ENVIRONMENT-01","ENVIRONMENT","自分では変えにくい事情で、予定していたことを進めにくいことはどのくらいありましたか？","external_constraint","CORE_FREQ",null],
  ["LRA-CORE-ENVIRONMENT-02","ENVIRONMENT","自分のために使える時間を十分に取れないことは、どのくらいありましたか？","personal_time_constraint","CORE_FREQ",null],
  ["LRA-CORE-ENVIRONMENT-03","ENVIRONMENT","仕事・お金・家庭などの生活上の事情で、自分の選択肢が限られていると感じることはどのくらいありましたか？","life_constraint","CORE_FREQ",null],
  ["LRA-CORE-ENVIRONMENT-04","ENVIRONMENT","困ったときに、誰かに助けを求めにくいことはどのくらいありましたか？","help_seeking_constraint","CORE_FREQ","助けを求める必要がある場面はなかった"],
  ["LRA-CORE-EMOTION-01","EMOTION","気持ちが大きく揺れて、いつもならできることがしにくくなることはどのくらいありましたか？","emotion_impact","CORE_FREQ",null],
  ["LRA-CORE-EMOTION-02","EMOTION","自分の気持ちを我慢したり抑えたりすることが、負担になることはどのくらいありましたか？","suppression","CORE_FREQ",null],
  ["LRA-CORE-EMOTION-03","EMOTION","自分が何を感じているのか、自分でも分かりにくいことはどのくらいありましたか？","emotion_unclear","CORE_FREQ",null],
  ["LRA-CORE-EMOTION-04","EMOTION","安心したり、ほっとしたりできる時間は、どのくらいありましたか？","calm_time_low","CORE_POSITIVE",null],
  ["LRA-CORE-RECOVERY-01","RECOVERY","休んでも、疲れやつらさが残ることはどのくらいありましたか？","slow_recovery","CORE_FREQ","休んだ場面はなかった"],
  ["LRA-CORE-RECOVERY-02","RECOVERY","休みたいと思っても、休む時間を取れないことはどのくらいありましたか？","rest_shortage","CORE_FREQ","休みたいと思う場面はなかった"],
  ["LRA-CORE-RECOVERY-03","RECOVERY","いったん休んだり作業を止めたりしたあと、もう一度始めるのが難しいことはどのくらいありましたか？","restart_cost","CORE_FREQ","いったん止めて、もう一度始める場面はなかった"],
  ["LRA-CORE-RECOVERY-04","RECOVERY","疲れや負担が、翌日以降まで残ることはどのくらいありましたか？","carry_over","CORE_FREQ",null]
];

export const CORE=CORE_ROWS.map(([questionId,domain,text,routingTag,scaleId,naLabel])=>({
  questionId,stage:"CORE",type:"FACT",domain,timeRange:"ここ2週間ほど",text,answerType:"single_choice",
  scaleId,routingTag,branchTags:[routingTag],required:true,version:QUESTION_DB_VERSION,
  options:[...(scaleId==="CORE_POSITIVE"?CORE_POSITIVE:CORE_FREQ),...(naLabel?[{value:"NA",label:naLabel,responseState:"NA",exclusive:true}]:[])]
}));

const EVENT_SPECIAL=[special("__NA__","該当する場面はなかった","NA"),special("__UNKNOWN__","思い出せない","UNKNOWN"),special("__PREFER_NOT__","答えたくない","PREFER_NOT")];
const COMPARE_SPECIAL=[special("__NA__","比べられる場面がなかった","NA"),special("__NONE__","違いは思い当たらない","NONE"),special("__UNKNOWN__","よくわからない","UNKNOWN"),special("__PREFER_NOT__","答えたくない","PREFER_NOT")];
const COUNTER_SPECIAL=[special("__NONE__","特に思い当たらない","NONE"),special("__UNKNOWN__","よくわからない","UNKNOWN"),special("__PREFER_NOT__","答えたくない","PREFER_NOT")];
const PROTECT_SPECIAL=[special("__NONE__","特にない","NONE"),special("__UNKNOWN__","よくわからない","UNKNOWN"),special("__PREFER_NOT__","答えたくない","PREFER_NOT")];

const ACTION_CONTEXT=[
  {value:"time",label:"時間に余裕がなかった"},{value:"fatigue",label:"疲れや眠気があった"},{value:"priority",label:"何から始めるか決めにくかった"},
  {value:"method",label:"やり方がはっきりしなかった"},{value:"outlook",label:"終わりまでの見通しが立ちにくかった"},{value:"motivation",label:"気持ちが向かなかった"},
  {value:"external",label:"周りの予定や事情に左右されていた"},{value:"resources",label:"必要なものや道具がそろっていなかった"},{value:"money",label:"お金の都合がつかなかった"},
  {value:"other",label:"その他",allowsText:true},{...UNKNOWN},{...PREFER_NOT}
];
const EMOTION_FIRST_CHANGE=[
  {value:"body",label:"体の感覚や体調の変化"},{value:"thought",label:"考え方や頭に浮かぶことの変化"},{value:"action",label:"自分の行動の変化"},
  {value:"simultaneous",label:"いくつかの変化にほぼ同時に気づいた"},{value:"other",label:"その他",allowsText:true},
  {value:"U",label:"はっきりわからない",responseState:"UNKNOWN",exclusive:true},{...PREFER_NOT}
];
const RECOVERY_CONTEXT=[
  {value:"physical",label:"体の疲れが強かった"},{value:"mental",label:"頭を使い続けていた"},{value:"emotion",label:"気持ちの負担が大きかった"},
  {value:"social",label:"人とのやり取りで疲れていた"},{value:"time",label:"時間に追われていた"},{value:"sleep",label:"睡眠が足りていなかった"},
  {value:"continuous",label:"休む直前まで動き続けていた"},{value:"other",label:"その他",allowsText:true},{...UNKNOWN},{...PREFER_NOT}
];

const ADP=[
  ["LRA-ADP-ACTION-01","EVENT","ACTION","やる必要があることに取りかかりにくかった場面があれば、一つ思い浮かべて、そのときのことを書いてください。","text_short",null,["LRA-CORE-ACTION-01"],EVENT_SPECIAL],
  ["LRA-ADP-ACTION-02","FACT","ACTION","やる必要があることに取りかかりにくかったとき、当てはまっていた状況を選んでください。","multi_choice",ACTION_CONTEXT,["LRA-CORE-ACTION-01","LRA-CORE-ACTION-03"],null],
  ["LRA-ADP-ACTION-03","EVENT","ACTION","始めたことが途中で止まったままになった場面があれば、一つ思い浮かべて、そのときのことを書いてください。","text_short",null,["LRA-CORE-ACTION-02"],EVENT_SPECIAL],
  ["LRA-ADP-ACTION-04","COMPARE","ACTION","やることが進みやすかったときと、進みにくかったときでは、何が違っていましたか？","text_short",null,["LRA-CORE-ACTION-01","LRA-CORE-ACTION-02","LRA-CORE-ACTION-03"],COMPARE_SPECIAL],
  ["LRA-ADP-ACTION-05","COUNTERFACTUAL","ACTION","今の負担を少し減らすために、やる量や回数を減らしても、あまり困らなさそうなことはありますか？","text_short",null,["LRA-CORE-ACTION-04"],COUNTER_SPECIAL],
  ["LRA-ADP-JUDGMENT-01","EVENT","JUDGMENT","決めるのが難しかった場面があれば、一つ思い浮かべて、何を決めようとしていたか書いてください。","text_short",null,["LRA-CORE-JUDGMENT-01","LRA-CORE-JUDGMENT-02","LRA-CORE-JUDGMENT-03","LRA-CORE-JUDGMENT-04"],EVENT_SPECIAL],
  ["LRA-ADP-JUDGMENT-02","FACT","JUDGMENT","決めるのが難しかったとき、どんなことを基準にしようとしていましたか？","text_short",null,["LRA-CORE-JUDGMENT-02","LRA-CORE-JUDGMENT-03"],[special("__NONE__","基準は特に決めていなかった","NONE"),special("__UNKNOWN__","よくわからない","UNKNOWN"),special("__PREFER_NOT__","答えたくない","PREFER_NOT")]],
  ["LRA-ADP-JUDGMENT-03","COMPARE","JUDGMENT","決めやすかったときと、決めにくかったときでは、何が違っていましたか？","text_short",null,["LRA-CORE-JUDGMENT-01","LRA-CORE-JUDGMENT-02","LRA-CORE-JUDGMENT-03","LRA-CORE-JUDGMENT-04"],COMPARE_SPECIAL],
  ["LRA-ADP-JUDGMENT-04","COUNTERFACTUAL","JUDGMENT","何かを決めるとき、何を整理すると、決めやすくなりそうですか？","text_short",null,["LRA-CORE-JUDGMENT-01","LRA-CORE-JUDGMENT-02","LRA-CORE-JUDGMENT-04"],COUNTER_SPECIAL],
  ["LRA-ADP-JUDGMENT-05","PROTECT","JUDGMENT","何かを決めるとき、早めに決めるとしても、大切にしたいことは何ですか？","text_short",null,["LRA-CORE-JUDGMENT-02","LRA-CORE-JUDGMENT-03"],PROTECT_SPECIAL],
  ["LRA-ADP-ENVIRONMENT-01","EVENT","ENVIRONMENT","自分では変えにくい事情で、予定していたことを進めにくかった場面があれば、一つ書いてください。","text_short",null,["LRA-CORE-ENVIRONMENT-01","LRA-CORE-ENVIRONMENT-03"],EVENT_SPECIAL],
  ["LRA-ADP-ENVIRONMENT-02","FACT","ENVIRONMENT","予定していたことを進めにくかった場面について、自分で変えられそうなことと、変えるのが難しそうなことは何ですか？","text_long",null,["LRA-CORE-ENVIRONMENT-01","LRA-CORE-ENVIRONMENT-03"],[special("__NA__","該当する場面はなかった","NA"),special("__NONE__","特に思い当たらない","NONE"),special("__UNKNOWN__","よくわからない","UNKNOWN"),special("__PREFER_NOT__","答えたくない","PREFER_NOT")]],
  ["LRA-ADP-ENVIRONMENT-03","COMPARE","ENVIRONMENT","自分では変えにくい事情があっても、比較的予定を進めやすかったときがあれば、何が違っていましたか？","text_short",null,["LRA-CORE-ENVIRONMENT-01","LRA-CORE-ENVIRONMENT-02","LRA-CORE-ENVIRONMENT-03"],COMPARE_SPECIAL],
  ["LRA-ADP-ENVIRONMENT-04","COUNTERFACTUAL","ENVIRONMENT","予定していたことを今より進めやすくするために、生活の中で一つ変えられるとしたら、何を変えたいですか？","text_short",null,["LRA-CORE-ENVIRONMENT-01","LRA-CORE-ENVIRONMENT-02","LRA-CORE-ENVIRONMENT-03"],COUNTER_SPECIAL],
  ["LRA-ADP-ENVIRONMENT-05","PROTECT","ENVIRONMENT","今の生活を変えていくとしても、できれば残しておきたい人・場所・習慣・支えはありますか？","text_short",null,["LRA-CORE-ENVIRONMENT-02","LRA-CORE-ENVIRONMENT-03","LRA-CORE-ENVIRONMENT-04"],PROTECT_SPECIAL],
  ["LRA-ADP-EMOTION-01","EVENT","EMOTION","気持ちが大きく揺れた場面があれば、一つ思い浮かべて、そのときのことを書いてください。","text_short",null,["LRA-CORE-EMOTION-01","LRA-CORE-EMOTION-02","LRA-CORE-EMOTION-03"],EVENT_SPECIAL],
  ["LRA-ADP-EMOTION-02","FACT","EMOTION","気持ちが大きく揺れたとき、最初に気づいた変化は何でしたか？","single_choice",EMOTION_FIRST_CHANGE,["LRA-CORE-EMOTION-01","LRA-CORE-EMOTION-03"],null],
  ["LRA-ADP-EMOTION-03","COMPARE","EMOTION","気持ちが大きく揺れても、比較的いつもどおりに過ごせたときがあれば、何が違っていましたか？","text_short",null,["LRA-CORE-EMOTION-01","LRA-CORE-EMOTION-02","LRA-CORE-EMOTION-03","LRA-CORE-EMOTION-04"],COMPARE_SPECIAL],
  ["LRA-ADP-EMOTION-04","COUNTERFACTUAL","EMOTION","気持ちが大きく揺れたときでも、いつもどおりに過ごすために、何があるとよさそうですか？","text_short",null,["LRA-CORE-EMOTION-01","LRA-CORE-EMOTION-02","LRA-CORE-EMOTION-03"],COUNTER_SPECIAL],
  ["LRA-ADP-EMOTION-05","FACT","EMOTION","今の生活の中で、気持ちが落ち着くのに役立っているものや時間はありますか？","text_short",null,["LRA-CORE-EMOTION-01","LRA-CORE-EMOTION-02","LRA-CORE-EMOTION-04"],PROTECT_SPECIAL],
  ["LRA-ADP-RECOVERY-01","EVENT","RECOVERY","休んでも十分に回復した感じがしなかった場面があれば、一つ思い浮かべて、そのときのことを書いてください。","text_short",null,["LRA-CORE-RECOVERY-01","LRA-CORE-RECOVERY-04"],EVENT_SPECIAL],
  ["LRA-ADP-RECOVERY-02","FACT","RECOVERY","休んでも回復しにくかったとき、休む前に当てはまっていたことを選んでください。","multi_choice",RECOVERY_CONTEXT,["LRA-CORE-RECOVERY-01","LRA-CORE-RECOVERY-04"],null],
  ["LRA-ADP-RECOVERY-03","COMPARE","RECOVERY","比較的よく回復できたときと、回復しにくかったときでは、何が違っていましたか？","text_short",null,["LRA-CORE-RECOVERY-01","LRA-CORE-RECOVERY-02","LRA-CORE-RECOVERY-04"],COMPARE_SPECIAL],
  ["LRA-ADP-RECOVERY-04","COUNTERFACTUAL","RECOVERY","いったん休んだり作業を止めたりしたあと、もう一度始めやすくなるには、何が変わるとよさそうですか？","text_short",null,["LRA-CORE-RECOVERY-03"],COUNTER_SPECIAL],
  ["LRA-ADP-RECOVERY-05","PROTECT","RECOVERY","休んだり回復したりするために、これからも残しておきたい習慣・時間・場所はありますか？","text_short",null,["LRA-CORE-RECOVERY-01","LRA-CORE-RECOVERY-02","LRA-CORE-RECOVERY-03","LRA-CORE-RECOVERY-04"],PROTECT_SPECIAL],
  ["LRA-ADP-CROSS-01","COMPARE","CROSS","ここ2週間くらいで、比較的過ごしやすかった日や時間があれば、普段と何が違っていましたか？","text_short",null,[],COMPARE_SPECIAL],
  ["LRA-ADP-CROSS-02","FACT","CROSS","いくつかの負担が重なったとき、自分の中で最初に「いつもと違う」と気づくのは、どんな変化ですか？","text_short",null,[],[special("__NONE__","特に決まった変化はない","NONE"),special("__UNKNOWN__","よくわからない","UNKNOWN"),special("__PREFER_NOT__","答えたくない","PREFER_NOT")]],
  ["LRA-ADP-CROSS-03","COUNTERFACTUAL","CROSS","今の困りごとや負担が少し軽くなったら、まず何ができるようになりそうですか？","text_short",null,[],COUNTER_SPECIAL],
  ["LRA-ADP-CROSS-04","COUNTERFACTUAL","CROSS","今の困りごとや負担を少し軽くするために、今より増えたら助かりそうなものはありますか？","text_short",null,[],COUNTER_SPECIAL],
  ["LRA-ADP-CROSS-05","FACT","CROSS","今の困りごとや負担を軽くするのに役立ちそうなのに、まだ十分に使えていないものはありますか？","text_short",null,[],PROTECT_SPECIAL]
];

export const ADAPTIVE=ADP.map(([questionId,type,domain,text,answerType,options,parentCoreIds,specialResponses])=>({
  questionId,stage:"ADAPTIVE",type,domain,timeRange:"ここ2週間ほどを中心に具体例",text,answerType,options,
  parentCoreIds,branchTags:[],specialResponses:specialResponses||[],required:false,version:QUESTION_DB_VERSION
}));

const E=[
  ["LRA-EVT-01","EVENT","今の生活に大きく影響したと感じる出来事について、何があったのかを書いてください。",[special("__NA__","思い当たる出来事はない","NA"),special("__UNKNOWN__","思い出せない","UNKNOWN"),special("__PREFER_NOT__","答えたくない","PREFER_NOT")]],
  ["LRA-EVT-02","FACT","その出来事があったのは、いつ頃ですか？",[special("__UNKNOWN__","時期はよく覚えていない","UNKNOWN"),special("__PREFER_NOT__","答えたくない","PREFER_NOT")]],
  ["LRA-EVT-03","EVENT","その出来事のあと、最初に「変わった」と気づいたことは何ですか？",COUNTER_SPECIAL],
  ["LRA-EVT-04","EVENT","その出来事のあと、日ごろの過ごし方や物事の決め方で、変わったことはありますか？",[special("__NONE__","特に変わったことはない","NONE"),special("__UNKNOWN__","よくわからない","UNKNOWN"),special("__PREFER_NOT__","答えたくない","PREFER_NOT")]],
  ["LRA-EVT-05","PROTECT","その出来事のあと、失ったり減ったりしたと感じるものや、反対に残せたと感じるものはありますか？",COUNTER_SPECIAL],
  ["LRA-EVT-06","COMPARE","以前にも、別の出来事のあとに今回と似た変化が起きたことがあれば、そのときのことを書いてください。",[special("__NONE__","似た経験は思い当たらない","NONE"),special("__UNKNOWN__","よく覚えていない","UNKNOWN"),special("__PREFER_NOT__","答えたくない","PREFER_NOT")]],
  ["LRA-EVT-07","COUNTERFACTUAL","もしその出来事がなかったとしたら、今の生活で違っていたと思うことは何ですか？",COUNTER_SPECIAL],
  ["LRA-EVT-08","FACT","その出来事のあとに起きた変化の中で、今も続いているものはありますか？",[special("__NONE__","今も続いている変化はない","NONE"),special("__UNKNOWN__","よくわからない","UNKNOWN"),special("__PREFER_NOT__","答えたくない","PREFER_NOT")]]
];
export const EVENT_TRACE=E.map(([questionId,type,text,specialResponses])=>({questionId,stage:"EVENT_TRACE",type,domain:"CROSS",timeRange:"対象出来事",text,answerType:"text_long",options:null,branchTags:["event"],specialResponses,required:false,version:QUESTION_DB_VERSION}));

const R=[
  ["LRA-REF-01","FACT","今の生活で、いちばん困っていることは何ですか？",[special("__NONE__","特に困っていることはない","NONE"),special("__UNKNOWN__","よくわからない","UNKNOWN"),special("__PREFER_NOT__","答えたくない","PREFER_NOT")]],
  ["LRA-REF-02","FACT","ここ2週間くらいで、新しく増えた負担や、前より重くなった負担はありますか？",PROTECT_SPECIAL],
  ["LRA-REF-03","FACT","今いちばん困っていることや負担には、どんなことが関係していると思いますか？",[special("__UNKNOWN__","よくわからない","UNKNOWN"),special("__PREFER_NOT__","答えたくない","PREFER_NOT")]],
  ["LRA-REF-04","FACT","今いちばん困っていることや負担の中で、できるだけ早く変えたいことは何ですか？",PROTECT_SPECIAL],
  ["LRA-REF-05","PROTECT","今の生活の中で、できれば変えずに残したいことはありますか？",PROTECT_SPECIAL],
  ["LRA-REF-06","FACT","3か月後、今の生活がどうなっていたら「今より良くなった」と感じられそうですか？",[special("__NONE__","特に思い描いている状態はない","NONE"),special("__UNKNOWN__","よくわからない","UNKNOWN"),special("__PREFER_NOT__","答えたくない","PREFER_NOT")]],
  ["LRA-REF-07","PROTECT","今の困りごとや負担を軽くするために、何かを変えるとしても、失いたくないものは何ですか？",PROTECT_SPECIAL],
  ["LRA-REF-08","FACT","今いちばん困っていることや、変えたいことに対して、今の自分でもできそうなことはありますか？",[special("__NONE__","今できそうなことは思い当たらない","NONE"),special("__UNKNOWN__","よくわからない","UNKNOWN"),special("__PREFER_NOT__","答えたくない","PREFER_NOT")]]
];
export const REFLECTION=R.map(([questionId,type,text,specialResponses])=>({questionId,stage:"REFLECTION",type,domain:"CROSS",timeRange:"現在",text,answerType:"text_long",options:null,branchTags:["reflection"],specialResponses,required:false,version:QUESTION_DB_VERSION}));
