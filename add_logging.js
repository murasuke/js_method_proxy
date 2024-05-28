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
