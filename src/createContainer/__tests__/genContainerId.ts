import { nanoid } from 'nanoid';

export const genContainerId = () => nanoid(7) as string & { __minLength: 1 };
