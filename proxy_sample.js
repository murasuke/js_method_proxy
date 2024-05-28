/**
 * プロキシ対象の関数
 * @param {number} val1
 * @param {number} val2
 * @returns
 */
function func(val1, val2) {
  return val1 + val2;
}

/**
 * 関数のProxyサンプル
 * ・実行前後のログ
 * ・引数と戻り値の変更
 */
const proxy = new Proxy(func, {
  apply(target, thisValue, args) {
    console.log(`call ${target.name}(${args})`); // ①呼び出し前ログ
    console.log(`${args} =>`, (args = args.map((value) => value + 1))); // ②引数を変更
    const result = target.apply(thisValue, args); // ③呼び出し後ログ
    console.log(`result: ${result}`);
    return String(result).padStart(3, '0'); // ④戻り値を書き換え
  },
});

console.log(proxy(1, 2));
