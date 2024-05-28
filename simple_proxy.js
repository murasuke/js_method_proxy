function func(val1, val2) {
  return val1 + val2;
}

const handler = {
  apply(target, thisValue, args) {
    console.log(`call ${target.name}(${args})`); // 呼び出し前ログ
    return target.apply(thisValue, args);
  },
};

const proxy = new Proxy(func, handler);

console.log(proxy(1, 2));
