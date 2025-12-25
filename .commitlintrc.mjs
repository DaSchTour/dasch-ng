async function getConfig() {
  const {
    default: {
      utils: { getProjects },
    },
  } = await import('@commitlint/config-nx-scopes');

  return {
    rules: {
      'scope-enum': async (ctx) => [2, 'always', ['deps', 'deps-dev', ...(await getProjects(ctx))]],
    },
  };
}

export default getConfig();
