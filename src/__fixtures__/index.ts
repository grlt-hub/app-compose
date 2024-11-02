import { nanoid } from 'nanoid';

const genContainerId = () => nanoid(7) as string & { __minLength: 1 };

export { genContainerId };
