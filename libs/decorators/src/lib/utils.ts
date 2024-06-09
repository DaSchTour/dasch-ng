function uncurryThis(f: any) {
  return f.call.bind(f);
}

const ObjectToString = uncurryThis(Object.prototype.toString);

export function isAsyncFunction(value: any) {
  return ObjectToString(value) === '[object AsyncFunction]';
}
