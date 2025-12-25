export default {
  '*.{ts,tsx,js,jsx,cts,mts,html,css,scss,json,md}': (filenames) => `nx format:write --files=${filenames.join(',')}`,
  '*.{ts,cts,mts,html}': (filenames) => `nx affected --target=lint --fix --quiet --files=${filenames.join(',')}`,
};
