type Ctx = {
  log: typeof console.log;
  error?: typeof console.error;

  // log: typeof console.log;
  // //  info: typeof console.info;
  // error?: typeof console.error;
};

const run = (ctx: Ctx) => {
  ctx.log('DEPS LOG from bTask');
  //  ctx.info('DEPS INFO from bTask');

  if (ctx?.error) {
    ctx.error('...');
  }
};

const enabled = (ctx: Ctx) => (ctx?.error ? true : false);

export const bFeature = { run, enabled };
