import {CORE,ADAPTIVE,EVENT_TRACE,REFLECTION,QUESTION_DB_VERSION,PACKET_VERSION} from './questions.js';
import {SHORT_TERM_OBSERVATION} from './short-term.js';

const DIV='━━━━━━━━━━━━━━━━━━';

export const ANALYSIS_REQUEST=`${DIV}\nLRA ANALYSIS REQUEST\n${DIV}\n\n以下はLRAの観測回答データである。\n\nこれは診断ではない。\n性格分類でも単純採点でもない。\n\n目的は、\n利用者の回答から生活構造を観測し、\n意思決定に利用できる形へ構造翻訳することである。\n\n必ず