/* v8 ignore start */

const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;

const colors = {
  bgGreen: (x: string) => (isNode ? `\x1b[42m${x}\x1b[49m` : x),
  magenta: (x: string) => (isNode ? `\x1b[35m${x}\x1b[39m` : x),
  yellow: (x: string) => (isNode ? `\x1b[33m${x}\x1b[39m` : x),
};

export { colors };
