export const LEGACY_REPORT_ASSETS=Object.freeze({
  role:'旧結果・レポートの内容資産。総合点中心・TYPE断定表示は現行へ戻さない。',
  fivePart:Object.freeze(['現在地確認','問題認識','構造分析','意思決定支援','実行・継続支援']),
  legacyDisplay:Object.freeze(['総合スコア','5軸結果','現在の構造','主な原因','維持要因','優先介入','優先順位','専門領域フラグ']),
  lateP1P4:Object.freeze({
    P1:Object.freeze(['総合スコア','5軸','状態要約']),
    P2:Object.freeze(['原因','維持','喪失','獲得']),
    P3:Object.freeze(['構造翻訳']),
    P4:Object.freeze(['優先順位','介入ポイント'])
  }),
  currentReplacement:Object.freeze(['現在の生活構造','最大ボトルネック','CHAIN/LOOP','主要仮説','根拠','反証・不確実性','機能している部分','保護対象','資源','レバレッジポイント','介入候補','最優先候補','確信度','必要時追加観測']),
  reanalysis:Object.freeze(['前回比','SUPPORTED','WEAKENED','REJECTED','UNRESOLVED','PERSONAL BASELINE']),
  humanReview:Object.freeze({
    principle:'AIは補助。AI最終判断禁止。人間レビュー。最終意思決定は利用者。',
    simple:Object.freeze(['緊急','専門','原因','優先','最終']),
    standard:Object.freeze(['緊急','専門','原因','維持','喪失','獲得','優先','介入','構造翻訳監査','最終']),
    complete:Object.freeze(['緊急','専門','原因','維持','喪失','獲得','パターン','構造翻訳監査','優先','介入','最終'])
  })
});
