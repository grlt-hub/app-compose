import { lens } from './proxy';
import { Kind$, MetaID$, MetaOptional$, type Marker } from './spot';

type AnyMarker = Marker<unknown>;
type MarkerConfig = { id?: string };

type MarkerProvider<T> =
  T extends Record<string, unknown> ? { [Key in keyof T]: MarkerProvider<T[Key]> } & Marker<T> : Marker<T>;

const createMarker = <T = never>(config: MarkerConfig = {}): MarkerProvider<T> => {
  const id = config.id ? Symbol(`Marker[${config.id}]`) : Symbol();

  return lens<AnyMarker>({ [Kind$]: 'marker', [MetaID$]: id, [MetaOptional$]: false }) as MarkerProvider<T>;
};

export { createMarker };
