import { QUESTION_DB_VERSION } from './questions.js';

const S=[
  ['LRA-STO-01','今日、状態や負荷が最も動いた場面は何でしたか？'],
  ['LRA-STO-02','その直前に何がありましたか？'],
  ['LRA-STO-03','その後、何をしましたか？'],
  ['LRA-STO-04','回復・悪化に影響した条件があれば書いてください。']
];

export const SHORT_TERM_OBSERVATION=S.map(([questionId,text])=>({
  questionId,stage:'SHORT_TERM_OBSERVATION',type:'FACT',domain:'CROSS',timeRange:'今日',text,
  answerType:'text_long',options:null,branchTags:['short_term_observation'],required:false,version:QUESTION_DB_VERSION
}));
