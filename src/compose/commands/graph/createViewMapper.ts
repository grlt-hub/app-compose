import type { AnyContainer } from '@createContainer';
import type { View } from './types';

type Argument = Pick<AnyContainer, 'id' | 'domain'>;

type ViewMapper = {
  id: (_: Argument) => string;
  path: (_: Argument) => string;
};

const createViewMapper = (view: View): ViewMapper =>
  view === 'domains' ?
    {
      id: (x: Argument) => x.domain,
      path: (x: Argument) => `${x.domain}:${x.id}`,
    }
  : {
      id: (x: Argument) => x.id,
      path: (x: Argument) => x.id,
    };

export { createViewMapper, type ViewMapper };
