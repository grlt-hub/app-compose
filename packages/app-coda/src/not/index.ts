import { shape, type Spot } from "@grlt-hub/app-compose"

type Not = (value: Spot<unknown>) => Spot<boolean>

const not: Not = (value) => shape(value, (x) => !x)

export { not, type Not }
