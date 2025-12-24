export default {
  '*': () => `nx format:write`,
  '*.(ts|cts|mts|html)': (filenames) => `nx affected --target=lint --fix --quiet --files=${filenames.join(',')}`,
};
