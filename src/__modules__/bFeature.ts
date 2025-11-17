type Ctx = {
  log: typeof console.log;
  error?: typeof console.error;
};

const run = (ctx: Ctx) => {
  ctx.log('DEPS LOG from bTask');

  if (ctx?.error) {
    ctx.error('...');
  }
};

const enabled = (ctx: Ctx) => (ctx?.error ? true : false);

export const bFeature = { run, enabled };
