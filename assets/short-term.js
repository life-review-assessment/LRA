import { QUESTION_DB_VERSION } from './questions.js?v=20261009-ja1';

const S=[
  ['LRA-STO-01','今日、気分・体調・負担などが一番変わったのは、どんな場面でしたか？'],
  ['LRA-STO-02','その直前に、何がありましたか？'],
  ['LRA-STO-03','そのあと、自分は何をしましたか？'],
  ['LRA-STO-04','その後、少し楽になったり、逆につらくなったりしたことに関係しそうなことがあれば書いてください。']
];

export const SHORT_TERM_OBSERVATION=S.map(([questionId,text])=>({
  questionId,stage:'SHORT_TERM_OBSERVATION',type:'FACT',domain:'CROSS',timeRange:'今日',text,
  answerType:'text_long',options:null,branchTags:['short_term_observation'],required:false,version:QUESTION_DB_VERSION
}));