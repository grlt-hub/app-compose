import { Build$, Compute$, Optional$, Spot$, type SpotInternal } from "./definition"

/**
 * Creates a build context from a shape
 *
 * @internal
 */
const build = <T = unknown>(context: unknown): SpotInternal<T> => {
  return { [Spot$]: true, [Build$]: context, [Compute$]: [], [Optional$]: false }
}

export { build }
