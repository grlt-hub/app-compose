type RunCtx = {
  log: typeof console.log;
  error?: typeof console.error;
};

const run = (ctx: RunCtx) => {
  ctx.log('DEPS LOG from bTask');

  if (ctx?.error) {
    ctx.error('...');
  }
};

const enabled = (ctx: RunCtx) => (ctx?.error ? true : false);

export const bFeature = { run, enabled };
