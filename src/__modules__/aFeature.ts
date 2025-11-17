const sleep = (time: number) => (time > 0 ? new Promise((r) => setTimeout(r, time)) : true);

const run = async () => {
  console.log('aTask');

  await sleep(1000);

  return { pep: { log: console.log }, info: console.info };
};

export const aFeature = { run };
