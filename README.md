# JavaScriptの関数呼び出し前後でログ出力処理を追加する方法(Proxy)

## はじめに

関数の「呼び出し直前」と「処理完了後」にログ出力がしたい場合、何かいい方法がないか？と調べたところ、
組み込み機能の[Proxy](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Proxy)でできることがわかりました

https://github.com/murasuke/js_method_proxy

## Proxyとは

あるプロパティが参照されたとき及び代入されたときや、関数が呼び出されたときの動作をカスタマイズすることができる(JavaScriptの標準)機能です


https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Proxy



## Proxyの使い方使い方

関数の呼び出しだけに絞った簡単なサンプルです

func()をProxyでラップすることで、関数呼び出し時にapply()が割り込みます

```javascript
/**
 * プロキシ対象の関数
 */
function func(val1, val2) {
  return val1 + val2;
}

const handler = {
  apply(target, thisValue, args) { // 関数呼び出し時にコールバックされる処理
    console.log(`call ${target.name}(${args})`); // 呼び出し前ログ
    return target.apply(thisValue, args); // func()自体を呼び出して戻り値にする
  },
};

const proxy = new Proxy(func, handler); // funcのプロキシを作成

console.log(proxy(1, 2));

```

実行結果(関数呼び出し前にログが出力されました)
```
call func(1,2)
3
```


### 呼び出し前後でログ＋引数や戻り値を変更する場合

* 関数呼び出し時の引数や、戻り値を変更することもできます

```javascript
const proxy = new Proxy(func, {
  apply(target, thisValue, args) {
    console.log(`call ${target.name}(${args})`); // ①呼び出し前ログ
    console.log(`${args} =>`, (args = args.map((value) => value + 1))); // ②引数を変更
    const result = target.apply(thisValue, args); // ③呼び出し後ログ
    console.log(`result: ${result}`);
    return String(result).padStart(3, '0'); // ④戻り値を書き換え
  },
});
```

実行結果

* ①呼び出し前ログ(関数名と引数)
* ②引数を変更 (引数に+1)
* ③呼び出し後ログ ((2,3)を渡したので結果は5)
* ④戻り値を書き換え (0パディングして返す
)
```
call add(1,2)
1,2 => [ 2, 3 ]
result: 5
005
```

### モジュールに定義された関数の引数と戻り値をログ出力するProxy

別モジュールで定義された全ての関数に対して、

importするモジュールの関数全てに対して、ログ機能を追加する関数`log_proxy`を作ります

まず、import対象のモジュールを用意します
```javascript:api.js
export function add(val1, val2) {
  return val1 + val2;
}
export const strcat = (s1, s2) => s1 + s2;
```

api.jsをimportして、その関数に対してログを追加します

* moduleの関数を列挙して、それぞれの関数に対してProxyを作る
*


プログラムソース
```javascript
import * as api from './api.js';
/**
 * モジュールに定義された関数の引数と戻り値をログ出力するProxy
 */
const log_proxy = (module) => {
  const proxy_module = {};
  // モジュールに定義された関数、変数を列挙
  for (const key of Object.keys(module)) {
    if (typeof module[key] == 'function') {
      // 関数毎にログ用Proxyを生成する
      const proxy = new Proxy(module[key], {
        apply(target, thisValue, args) {
          console.log(`call ${target.name}(${args})`); // 呼び出し前ログ
          const result = target.apply(thisValue, args); // 呼び出し後ログ
          console.log(`result: ${result}`);
          return result;
        },
      });
      // proxyをまとめたオブジェクトを作成して返す(apiと同じ関数を持つ)
      proxy_module[key] = proxy;
    }
  }
  return proxy_module;
};

// proxyを作成して、呼び出す
const proxy = log_proxy(api);
console.log(proxy.add(1, 2));
console.log(proxy.strcat('val1', 'val2'));

```

実行結果

* 別モジュールで定義された関数に、ログ機能が追加されました
```
call add(1,2)
result: 3
3
call strcat(val1,val2)
result: val1val2
val1val2
```
