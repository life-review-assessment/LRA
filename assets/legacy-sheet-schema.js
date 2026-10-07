export const LEGACY_SHEET_SCHEMA_VERSION='LRA-G1-14SHEET-2026-06';
const COMMON=['A:LRA-ID','B:分析回数','C:プランコード','D:状態コード','E:出力ID','F:作成日','G:更新日'];
export const LEGACY_14_SHEETS=Object.freeze({
  role:'旧運用互換・履歴資産。現行Web本体へGoogle Sheets方式を復活させない。',
  common:Object.freeze(COMMON),
  sheets:Object.freeze({
    'テキスト管理':Object.freeze(['H:表示区分','I:表示コード','J:表示文','K:使用場所','L:有効/無効','M:備考']),
    'タイプ定義':Object.freeze(['H:TYPEコード','I:内部名称','J:条件概要','K:利用者表示可否','L:備考']),
    'ユーザー管理':Object.freeze(['H:受付日','I:最新状態','J:最新プラン','K:最新分析回数','L:最新出力ID','M:納品状態','N:備考']),
    '入力':Object.freeze(['H:L 行動Q1〜Q5','M:Q 判断Q1〜Q5','R:V 環境Q1〜Q5','W:AA 感情Q1〜Q5','AB:AF 回復Q1〜Q5','AG:今一番困っていること','AH:最近増えた負担','AI:自分で考える原因','AJ:今すぐ変えたいこと','AK:変えたくないこと','AL:3か月後どうなっていたいか','AM:一番失いたくないもの','AN:今後手に入れたいもの','AO:入力完了確認']),
    '分析':Object.freeze(['H:TAG候補','I:TYPE候補','J:STATE候補','K:WARNING候補','L:原因候補','M:維持要因候補','N:喪失候補','O:緊急語句検出','P:専門領域語句検出','Q:分析停止理由']),
    '指標':Object.freeze(['H:行動スコア','I:判断スコア','J:環境スコア','K:感情スコア','L:回復スコア','M:総合スコア','N:最低軸','O:軸間最大差','P:ランク','Q:ランク色','R:専門領域フラグ','S:緊急性フラグ']),
    '補正':Object.freeze(['H:継続性補正','I:3か月補正','J:生活支障補正','K:安全補正','L:専門領域補正','M:回復補正','N:感想補正']),
    'コード':Object.freeze(['H:TYPEコード','I:STATEコード','J:WARNINGコード','K:TAGコード群','L:優先順位コード','M:専門領域コード','N:総合コード']),
    '判定':Object.freeze(['H:現在の構造','I:主な原因','J:維持要因','K:喪失','L:獲得','M:優先介入候補','N:優先順位候補1','O:優先順位候補2','P:優先順位候補3','Q:専門領域候補']),
    '出力ID':Object.freeze(['H:出力ID発番対象','I:出力ID','J:前回出力ID','K:出力種別','L:出力状態','M:出力先','N:備考']),
    '表示':Object.freeze(['H:表示対象','I:表示順','J:表示区分','K:表示見出し','L:表示本文','M:利用者表示可否','N:備考']),
    'AI説明':Object.freeze(['H:総合説明候補','I:行動説明候補','J:判断説明候補','K:環境説明候補','L:感情説明候補','M:回復説明候補','N:構造説明候補','O:原因説明候補','P:維持要因説明候補','Q:優先介入説明候補','R:注意表示候補','S:専門家相談説明候補']),
    '人間レビュー':Object.freeze(['H:レビューID','I:レビュー状態','J:緊急確認','K:専門領域確認','L:原因確認','M:維持要因確認','N:喪失確認','O:獲得確認','P:優先順位確認','Q:介入確認','R:構造翻訳監査','S:修正内容','T:最終承認','U:レビュー日時']),
    'ログ':Object.freeze(['H:LOG-ID','I:操作種別','J:操作対象','K:操作前','L:操作後','M:操作者','N:操作理由','O:関連出力ID','P:関連レビューID','Q:備考'])
  }),
  stateCodes:Object.freeze([
    {code:'ST01',name:'受付'},{code:'ST02',name:'入力済'},{code:'ST03',name:'分析中'},{code:'ST04',name:'AI説明作成'},
    {code:'ST05',name:'レビュー中'},{code:'ST06',name:'納品待ち'},{code:'ST07',name:'納品済'},{code:'ST99',name:'保留'}
  ]),
  reviewCodes:Object.freeze([{code:'R01',name:'採用'},{code:'R02',name:'修正'},{code:'R03',name:'保留'}]),
  examples:Object.freeze({outputId:'OUT-000001',logId:'LOG-000001'}),
  conflictRule:'9月別案のST01〜ST06構造タイプ名は同一プレフィックスの別意味。6月案件状態コードと統合しない。',
  retiredImplementationRule:'Form/Sheets/Apps Scriptは現行本体へ持ち込まず、列・コード・意味だけ互換資産として保持する。'
});
