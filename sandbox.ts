import { compose, createContainer } from './src';

const start = () => ({ api: null });

const a = createContainer({ id: 'a', domain: 'a', start });
const b = createContainer({ id: 'b', domain: 'b', dependencies: [a], start });
const c = createContainer({ id: 'c', domain: 'c', optionalDependencies: [b], start });
const d = createContainer({ id: 'd', domain: 'd', dependencies: [c], optionalDependencies: [b], start });

const cmd = await compose({
  stages: [['_', [a, b, c, d]]],
});

const { graph } = await cmd.graph({ view: 'domains' });

console.log(graph);
