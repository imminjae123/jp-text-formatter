/**
 * script.js — 半角・全角 双方向変換ロジック & イベント処理
 *
 * 注意:
 *  - ES modules 非使用（file:// で直接開く際の CORS エラー回避）
 *  - すべてのロジックはグローバルスコープで定義
 *  - 外部通信一切なし（navigator.clipboard のみ許可）
 */

/* =========================================================
   1. 変換テーブル
   ========================================================= */

/** 全角英数字 → 半角英数字 */
var ZENKAKU_TO_HANKAKU_ALNUM = (function () {
  var map = {};
  // 英大文字 Ａ–Ｚ (U+FF21–FF3A)
  for (var i = 0; i < 26; i++) {
    map[String.fromCharCode(0xFF21 + i)] = String.fromCharCode(0x41 + i);
  }
  // 英小文字 ａ–ｚ (U+FF41–FF5A)
  for (var i = 0; i < 26; i++) {
    map[String.fromCharCode(0xFF41 + i)] = String.fromCharCode(0x61 + i);
  }
  // 数字 ０–９ (U+FF10–FF19)
  for (var i = 0; i < 10; i++) {
    map[String.fromCharCode(0xFF10 + i)] = String.fromCharCode(0x30 + i);
  }
  return map;
})();

/**
 * 半角カタカナ → 全角カタカナ
 * 濁点(ﾞ U+FF9E)・半濁点(ﾟ U+FF9F) は直前の文字と合成してから変換。
 */
var HANKAKU_KATA_TO_ZENKAKU = {
  'ｦ': 'ヲ', 'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
  'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ', 'ｯ': 'ッ', 'ｰ': 'ー',
  'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
  'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
  'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
  'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
  'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
  'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
  'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
  'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ﾖ': 'ヨ',
  'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
  'ﾜ': 'ワ', 'ﾝ': 'ン', 'ﾞ': '゛', 'ﾟ': '゜',
  '｡': '。', '｢': '「', '｣': '」', '､': '、', '･': '・'
};

/** 半角カタカナ + 濁点/半濁点の合成テーブル */
var DAKUTEN_MAP = {
  'カ': 'ガ', 'キ': 'ギ', 'ク': 'グ', 'ケ': 'ゲ', 'コ': 'ゴ',
  'サ': 'ザ', 'シ': 'ジ', 'ス': 'ズ', 'セ': 'ゼ', 'ソ': 'ゾ',
  'タ': 'ダ', 'チ': 'ヂ', 'ツ': 'ヅ', 'テ': 'デ', 'ト': 'ド',
  'ハ': 'バ', 'ヒ': 'ビ', 'フ': 'ブ', 'ヘ': 'ベ', 'ホ': 'ボ',
  'ウ': 'ヴ'
};

var HANDAKUTEN_MAP = {
  'ハ': 'パ', 'ヒ': 'ピ', 'フ': 'プ', 'ヘ': 'ペ', 'ホ': 'ポ'
};

/* =========================================================
   2. 変換関数
   ========================================================= */

/**
 * 半角カタカナを全角カタカナへ変換（濁点・半濁点の合成あり）
 * @param {string} str
 * @returns {string}
 */
function convertHankakuKatakanaToZenkaku(str) {
  var result = '';
  for (var i = 0; i < str.length; i++) {
    var ch = str[i];
    var next = str[i + 1];

    var converted = HANKAKU_KATA_TO_ZENKAKU[ch];
    if (converted === undefined) {
      result += ch;
      continue;
    }

    // 次の文字が濁点の場合は合成
    if (next === 'ﾞ') {
      var dakuten = DAKUTEN_MAP[converted];
      if (dakuten) {
        result += dakuten;
        i++; // 濁点を消費
        continue;
      }
    }
    // 次の文字が半濁点の場合は合成
    if (next === 'ﾟ') {
      var handakuten = HANDAKUTEN_MAP[converted];
      if (handakuten) {
        result += handakuten;
        i++; // 半濁点を消費
        continue;
      }
    }

    result += converted;
  }
  return result;
}

/**
 * 全角英数字を半角英数字へ変換
 * @param {string} str
 * @returns {string}
 */
function convertZenkakuAlnumToHankaku(str) {
  return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (ch) {
    return ZENKAKU_TO_HANKAKU_ALNUM[ch] || ch;
  });
}

/**
 * チェックボックスの設定に従いテキストを変換する
 * @param {string} input
 * @param {Object} opts
 * @returns {string}
 */
function transform(input, opts) {
  var result = input;

  if (opts.alphanumeric) {
    // 全角英数字 → 半角
    result = convertZenkakuAlnumToHankaku(result);
    // 半角カタカナ → 全角カタカナ（合成処理を含む）
    result = convertHankakuKatakanaToZenkaku(result);
  }

  if (opts.space) {
    // 全角スペース → 半角スペース
    result = result.replace(/　/g, ' ');
  }

  if (opts.trim) {
    // 行頭・行末の余分なスペースを削除
    result = result.replace(/^[ \t]+|[ \t]+$/gm, '');
  }

  if (opts.newline) {
    // 連続する空行（空白のみ行を含む）を1行に圧縮
    result = result.replace(/(\r?\n[ \t]*){2,}/g, '\n\n');
  }

  return result;
}

/* =========================================================
   3. DOM 参照 & イベント設定
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  var inputEl       = document.getElementById('input-text');
  var outputEl      = document.getElementById('output-text');
  var inputCountEl  = document.getElementById('input-count');
  var outputCountEl = document.getElementById('output-count');
  var btnCopy       = document.getElementById('btn-copy');
  var btnCopyText   = document.getElementById('btn-copy-text');
  var btnClear      = document.getElementById('btn-clear');
  var toast         = document.getElementById('toast');
  var chkAlnum      = document.getElementById('chk-alphanumeric');
  var chkSpace      = document.getElementById('chk-space');
  var chkTrim       = document.getElementById('chk-trim');
  var chkNewline    = document.getElementById('chk-newline');

  var toastTimer = null;

  /** 現在のチェックボックス状態を取得 */
  function getOptions() {
    return {
      alphanumeric: chkAlnum.checked,
      space:        chkSpace.checked,
      trim:         chkTrim.checked,
      newline:      chkNewline.checked
    };
  }

  /** 変換を実行して出力エリアと文字カウントを更新 */
  function runTransform() {
    var input  = inputEl.value;
    var output = transform(input, getOptions());
    outputEl.value       = output;
    inputCountEl.textContent  = input.length.toLocaleString();
    outputCountEl.textContent = output.length.toLocaleString();
  }

  /** トースト表示 */
  function showToast() {
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2000);
  }

  // 入力イベント（リアルタイム変換）
  inputEl.addEventListener('input', runTransform);

  // チェックボックス変更時にも再変換
  [chkAlnum, chkSpace, chkTrim, chkNewline].forEach(function (chk) {
    chk.addEventListener('change', runTransform);
  });

  // コピーボタン
  btnCopy.addEventListener('click', function () {
    var text = outputEl.value;
    if (!text) return;

    navigator.clipboard.writeText(text).then(function () {
      // ボタンテキストを一時的に変化させる
      btnCopyText.textContent = 'コピーしました！';
      btnCopy.classList.add('copied');
      showToast();
      setTimeout(function () {
        btnCopyText.textContent = '結果をコピー';
        btnCopy.classList.remove('copied');
      }, 2000);
    }).catch(function () {
      // clipboard API が使えない環境向けフォールバック（古いブラウザ等）
      outputEl.select();
      document.execCommand('copy');
      showToast();
    });
  });

  // クリアボタン
  btnClear.addEventListener('click', function () {
    inputEl.value  = '';
    outputEl.value = '';
    inputCountEl.textContent  = '0';
    outputCountEl.textContent = '0';
    inputEl.focus();
  });

  // 初期描画
  runTransform();
});
