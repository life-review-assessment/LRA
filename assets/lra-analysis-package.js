import {CORE,ADAPTIVE,EVENT_TRACE,REFLECTION,QUESTION_DB_VERSION,PACKET_VERSION} from './questions.js?v=20261011-q2';
import {SHORT_TERM_OBSERVATION} from './short-term.js?v=20261011-q2';

const DIV='━━━━━━━━━━━━━━━━━━';

export const ANALYSIS_REQUEST=`${DIV}\nLRA ANALYSIS REQUEST\n${DIV}\n\n以下はLRAの観測回答データである。\n\nこれは診断ではない。\n性格分類でも単純採点でもない。\n目的は、利用者の回答から生活構造を観測し、意思決定に利用できる形へ構造翻訳することである。\n\n必ず以下の順で分析する。\n\n1. 観測事実\n2. 構造ノード\n3. ボトルネック\n4. CHAIN\n5. LOOP\n6. 複数仮説\n7. 各仮説の支持証拠\n8. 反証\n9. 矛盾\n10. 回答の意味ずれ\n11. 例外\n12. 時間軸\n13. 相互作用\n14. 保護対象\n15. 利用可能な資源\n16. レバレッジポイント\n17. 介入候補\n18. 最優先介入\n19. 確信度\n20. 必要な追加観測\n21. 必要時のみ専門家接続候補\n\n再分析の場合は、前回のLRA ANALYSIS RESULTを比較材料として使う。前回結果を確定事実として扱わず、前回時点の仮説・構造翻訳として扱うこと。\n\n重要：\n・1つの回答だけで原因を確定しない\n・複数回答の一致を重視する\n・相関と因果を分ける\n・本人が「関係していると思う」と答えた内容は本人の仮説として扱い、原因事実へ昇格させない\n・NONE＝質問は成立するが該当する答えが特にない\n・NA＝質問の前提となる場面自体がない\n・UNKNOWN＝分からない／思い出せない\n・PREFER_NOT＝答えたくない\n・UNANSWERED＝未回答\n・NONE / NA / UNKNOWN / PREFER_NOT / UNANSWEREDを負担の高低へ変換しない\n・正方向質問の生回答を反転した事実として扱わない\n・複数選択の併存条件を、そのまま原因と断定しない\n・矛盾回答を削除・平均化しない\n・質問意図と回答内容がずれている場合は「回答意味ずれ」として保持する\n・未回答を推測補完しない\n・因果関係が確定していないものは「仮説」と明記する\n・確信度を単純な質問点数だけで決めない\n・根拠なしに数値スコアを作らない\n・医療診断、法律判断、金融判断、依存症診断などを行わない\n・危険兆候がある場合のみ安全導線を優先する\n・TYPEを利用者向け結論として断定表示しない\n・追加質問は最小限とし、既存回答で判断できる内容を再質問しない\n・LRA ANALYSIS RESULTは運営・分析用の正本とし、利用者向け文章は別途生成する\n`;

export const RESULT_TEMPLATE=`${DIV}\nLRA ANALYSIS RESULT\n${DIV}\n\nLRA-ID：\n分析回数：\n分析状態：\n\n【01｜現在の構造】\n\n【02｜最重要ボトルネック】\n\n【03｜主要CHAIN】\n\nCHAIN-01\n→\n→\n→\n\n必要時CHAIN-02以降。\n\n【04｜主要LOOP】\n\nLOOP-01\n→\n→\n→\n↺\n\n必要時LOOP-02以降。\n\n【05｜主要仮説】\n\n仮説01：\n確信度：\n支持：\n反証：\n未確定：\n\n仮説02：\n確信度：\n支持：\n反証：\n未確定：\n\n【06｜矛盾情報】\n\nなしの場合：\n明確な矛盾なし\n\n存在する場合：\n該当質問ID：\n矛盾内容：\n影響：\n\n【07｜回答意味ずれ】\n\nなしの場合：\n明確な意味ずれなし\n\n存在する場合：\n質問ID：\n質問意図：\n回答：\n判定：\n分析上の扱い：\n\n【08｜保護対象】\n\n【09｜利用可能な資源】\n\n【10｜レバレッジポイント】\n\n【11｜介入候補】\n\n【12｜最優先介入】\n\n【13｜専門家接続】\n\n不要／検討／優先\n\n対象領域：\n理由：\n\n※診断名は付けない。\n\n【14｜追加観測】\n\n不要の場合：\n現時点では追加観測不要\n\n必要な場合：\n質問1：\n目的：\n\n質問2：\n目的：\n\n【15｜構造翻訳】\n\n利用者に最も伝わる形で、現在何が起きているかを簡潔に文章化する。\n\n${DIV}\nEND LRA ANALYSIS RESULT\n${DIV}`;

const LEGACY_SCALE={0:'一度もなかった',1:'1回あった',2:'2〜3回あった',3:'4回以上あった',4:'ほぼ毎日あった',U:'わからない',S:'答えたくない'};
const LEGACY_OPTIONS={
  'LRA-ADP-ACTION-02':{time:'時間が足りなかった',fatigue:'疲れていた・消耗していた',uncertainty:'やり方や、どう決めればいいか分からなかった',external:'自分以外の事情や、相手の都合が影響した',emotion:'不安・抵抗感など、気持ちの負担があった',money:'お金の都合があった',other:'その他',unknown:'わからない'},
  'LRA-ADP-EMOTION-02':{body:'体の状態や感覚',thought:'考え方や頭に浮かんだこと',action:'自分の行動',unknown:'はっきりわからない'},
  'LRA-ADP-RECOVERY-02':{physical:'体の疲れ・負担',mental:'考え続けることによる疲れ',emotion:'気持ちの疲れ・負担',social:'人とのやり取りによる疲れ',time:'時間に余裕がないことによる負担',other:'その他',unknown:'わからない'}
};

function valuePresent(v){return !(v===undefined||v===null||v===''||(Array.isArray(v)&&v.length===0));}
function packetMap(items=[]){return new Map((items||[]).map(x=>[x.questionId,x]));}
function legacyLabel(questionId,v,version){if(String(version||'').startsWith('lra-question-db-1.1')){if(questionId.startsWith('LRA-CORE-'))return LEGACY_SCALE[String(v)]??String(v);return LEGACY_OPTIONS[questionId]?.[String(v)]??String(v);}return String(v);}
function optionSnapshotLabel(packetQ,v){const o=(packetQ?.optionSnapshot||[]).find(x=>String(x.value)===String(v));return o?.label||null;}
function currentLabel(q,v){const o=(q?.options||[]).find(x=>String(x.value)===String(v));const s=(q?.specialResponses||[]).find(x=>String(x.value)===String(v));return o?.label||s?.label||null;}
function answerText(q,packetQ,v,packetVersion){
  if(!valuePresent(v))return'[未回答]';
  if(packetQ?.answerLabel)return packetQ.answerLabel+(packetQ?.answerExtra?.other?` / その他：${packetQ.answerExtra.other}`:'');
  const one=x=>optionSnapshotLabel(packetQ,x)||legacyLabel(packetQ?.questionId||q?.questionId||'',x,packetQ?.questionDbVersion||packetVersion)||currentLabel(q,x)||String(x);
  const body=Array.isArray(v)?v.map(one).join(' / '):one(v);
  return body+(packetQ?.answerExtra?.other?` / その他：${packetQ.answerExtra.other}`:'');
}
function responseStateLine(packetQ){const s=packetQ?.responseState;if(!s||s==='ANSWER')return'';return`\n回答状態：${s}`;}
function questionBlock(q,packetQ,answers,packetVersion){const text=packetQ?.questionText||packetQ?.text||q?.text||'[質問文なし]';const id=packetQ?.questionId||q?.questionId||'[質問IDなし]';const v=valuePresent(packetQ?.answer)?packetQ.answer:answers?.[id];return`${id}\n質問：\n${text}\n回答：\n${answerText(q,packetQ,v,packetVersion)}${responseStateLine(packetQ)}\n`;}
function section(title,questions,packetItems,answers,packetVersion){const m=packetMap(packetItems);return`【${title}】\n\n${questions.map(q=>questionBlock(q,m.get(q.questionId),answers,packetVersion)).join('\n')}`;}
function sectionFromPacket(title,packetItems,answers,packetVersion){return`【${title}】\n\n${(packetItems||[]).map(x=>questionBlock(null,x,answers,packetVersion)).join('\n')}`;}
function adaptiveQuestions(packet){const ids=Array.isArray(packet?.adaptiveQuestionIds)&&packet.adaptiveQuestionIds.length?packet.adaptiveQuestionIds:(packet?.adaptive||[]).map(x=>x.questionId);return ids.map(id=>ADAPTIVE.find(q=>q.questionId===id)||packet?.adaptive?.find(q=>q.questionId===id)).filter(Boolean);}
function shortObservationUsed(packet,answers){return(packet?.shortTermObservation||[]).length>0||SHORT_TERM_OBSERVATION.some(q=>valuePresent(answers?.[q.questionId]));}
function iso(v){if(!v)return'[不明]';const d=new Date(v);return Number.isNaN(d.getTime())?String(v):d.toISOString();}
function analysisCount(record,p){return Math.max(1,Number(record?.analysis_count||p?.analysisCount||1)||1);}
function previousAnalysis(record){return String(record?.previous_analysis_result_text||'').trim();}
function previousBlock(record,p){const count=analysisCount(record,p);if(count<=1)return'';const previous=previousAnalysis(record);return`【前回LRA ANALYSIS RESULT｜分析 ${count-1}回目】\n\n保存日時：${iso(record?.previous_analysis_result_saved_at)}\n\n${previous||'[前回内部分析結果を取得できません]'}\n`;}

export function buildAnalysisInput(record){
  const p=record?.analysis_packet||{};const answers=p.answers||p.rawAnswers||record?.answers||{};const pv=p.baseQuestionDbVersion||p.questionDbVersion||record?.question_db_version||QUESTION_DB_VERSION;
  const historical=!!p.mixedQuestionDefinitions||!!(p.questionDbVersion&&p.questionDbVersion!==QUESTION_DB_VERSION);
  const core=historical&&p.core?.length?sectionFromPacket('CORE',p.core,answers,pv):section('CORE',CORE,p.core,answers,pv);
  const aq=adaptiveQuestions(p);const adaptive=p.adaptive?.length?(historical?sectionFromPacket('ADAPTIVE',p.adaptive,answers,pv):section('ADAPTIVE',aq,p.adaptive,answers,pv)):'【ADAPTIVE】\n\n[未実施]';
  const eventUsed=p.eventTraceUsed===true||(p.eventTrace||[]).length>0;const event=p.eventTrace?.length&&historical?sectionFromPacket('EVENT TRACE',p.eventTrace,answers,pv):section('EVENT TRACE',EVENT_TRACE,p.eventTrace,answers,pv);
  const reflection=p.reflection?.length&&historical?sectionFromPacket('REFLECTION',p.reflection,answers,pv):section('REFLECTION',REFLECTION,p.reflection,answers,pv);
  const shortUsed=shortObservationUsed(p,answers);const short=shortUsed?section('SHORT OBSERVATION',SHORT_TERM_OBSERVATION,p.shortTermObservation,answers,p.questionDbVersion||QUESTION_DB_VERSION):'【SHORT OBSERVATION】\n\nSHORT OBSERVATION：\n未実施';
  const received=record?.submission_saved_at||p.observedAt||record?.updated_at;const count=analysisCount(record,p);
  const meta=`【分析用メタ情報】\n\nUser-ID：${record?.user_id||p.userId||'[不明]'}\nOutput-ID：${record?.output_id||p.outputId||'[不明]'}\n状態：${record?.status||'[不明]'}\nEvent Trace Used：${eventUsed?'true':'false'}\nAdaptive Question IDs：${(p.adaptiveQuestionIds||[]).join(', ')||'[なし]'}\nSchema Version：${p.schemaVersion||record?.submission_schema_version||'[不明]'}\nQuestion DB Version：${p.questionDbVersion||record?.question_db_version||QUESTION_DB_VERSION}\nBase Question DB Version：${p.baseQuestionDbVersion||'[なし]'}\nMixed Definitions：${p.mixedQuestionDefinitions?'true':'false'}\nObserved At：${iso(p.observedAt)}`;
  const previous=previousBlock(record,p);
  return`${DIV}\nLRA ANALYSIS INPUT\n${DIV}\n\n【案件情報】\n\nLRA-ID：${record?.lra_id||p.lraId||'[不明]'}\n分析回数：${count}\nプラン：${record?.plan_name||record?.plan_code||p.planCode||p.planId||'[不明]'}\nPacket Version：${record?.packet_version||p.packetVersion||PACKET_VERSION}\n回答日時：${iso(received)}\n\n${previous?`${previous}\n`:''}${core}\n\n${adaptive}\n\n${event}\n\n${reflection}\n\n${short}\n\n${meta}\n\n${DIV}\nEND LRA ANALYSIS INPUT\n${DIV}`;
}

export function buildGptAnalysisPackage(record){const p=record?.analysis_packet||{};const count=analysisCount(record,p);if(count>1&&!previousAnalysis(record))throw new Error('再分析に必要な前回の内部分析結果を取得できません。前回分析結果の保存状態を確認してください。');return`${ANALYSIS_REQUEST}\n\n${buildAnalysisInput(record)}\n\n以下の固定書式以外を最終出力に追加しないこと。\n\n${RESULT_TEMPLATE}`;}
export function validateGptAnalysisPackage(record,text){const p=record?.analysis_packet||{};const required=[...(p.core?.length?p.core.map(q=>q.questionId):CORE.map(q=>q.questionId)),...(p.adaptive||[]).map(q=>q.questionId),...(p.eventTrace?.length?p.eventTrace.map(q=>q.questionId):EVENT_TRACE.map(q=>q.questionId)),...(p.reflection?.length?p.reflection.map(q=>q.questionId):REFLECTION.map(q=>q.questionId))];if(shortObservationUsed(p,p.answers||p.rawAnswers||record?.answers||{}))required.push(...SHORT_TERM_OBSERVATION.map(q=>q.questionId));const missing=[...new Set(required)].filter(id=>!text.includes(id));const count=analysisCount(record,p);const previousOk=count<=1||(!!previousAnalysis(record)&&text.includes(`前回LRA ANALYSIS RESULT｜分析 ${count-1}回目`));return{ok:missing.length===0&&previousOk&&text.includes('LRA ANALYSIS REQUEST')&&text.includes('LRA ANALYSIS RESULT')&&text.includes('END LRA ANALYSIS INPUT')&&text.includes('回答意味ずれ')&&text.includes('矛盾情報')&&text.includes('【案件情報】'),missing,previousOk};}
export async function copyGptAnalysisPackage(record){const text=buildGptAnalysisPackage(record);const check=validateGptAnalysisPackage(record,text);if(!check.ok)throw new Error(`コピー内容の監査に失敗しました: ${check.previousOk?'':'前回分析結果 / '}${check.missing.join(', ')}`);try{await navigator.clipboard.writeText(text);}catch{const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();const ok=document.execCommand('copy');ta.remove();if(!ok)throw new Error('クリップボードへのコピーに失敗しました。');}return text;}
