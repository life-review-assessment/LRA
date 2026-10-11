import { QUESTION_DB_VERSION } from './questions.js?v=20261011-q4';

const special=(value,label,responseState)=>({value,label,responseState});

const S=[
  ['LRA-STO-01','今日、気分・体調・負担感のどれかが大きく変わった場面があれば、何がどう変わったかも含めて、一つ書いてください。',[
    special('__NA__','大きく変わった場面はなかった','NA'),special('__UNKNOWN__','思い出せない','UNKNOWN'),special('__PREFER_NOT__','答えたくない','PREFER_NOT')
  ]],
  ['LRA-STO-02','その場面の直前には、どんなことがありましたか？',[
    special('__NONE__','特に思い当たることはない','NONE'),special('__UNKNOWN__','思い出せない','UNKNOWN'),special('__PREFER_NOT__','答えたくない','PREFER_NOT')
  ]],
  ['LRA-STO-03','その変化に気づいたあと、最初に何をしましたか？',[
    special('__NONE__','特に何もしなかった','NONE'),special('__UNKNOWN__','思い出せない','UNKNOWN'),special('__PREFER_NOT__','答えたくない','PREFER_NOT')
  ]],
  ['LRA-STO-04','そのあと、気分・体調・負担感はどうなりましたか？',[
    special('__NONE__','ほとんど変わらなかった','NONE'),special('__UNKNOWN__','よくわからない','UNKNOWN'),special('__PREFER_NOT__','答えたくない','PREFER_NOT')
  ]]
];

export const SHORT_TERM_OBSERVATION=S.map(([questionId,text,specialResponses])=>({
  questionId,stage:'SHORT_TERM_OBSERVATION',type:'FACT',domain:'CROSS',timeRange:'今日',text,
  answerType:'text_long',options:null,branchTags:['short_term_observation'],specialResponses,required:false,version:QUESTION_DB_VERSION
}));
