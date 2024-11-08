# Change Log

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](http://semver.org).

## 1.3.0

### Added

```ts
autoResolveDeps?: {
  strict: true;
  optional?: boolean;
};
```

in the `compose.up` and `compose.graph` configs. `autoResolveDeps` allows automatic resolution of container dependencies (both strict and optional) without the need to manually pass them to `compose.up` and `compose.graph`.

## 1.2.0

### Added

- `apis: boolean` in the `compose.up` config for accessing your containers' APIs after execution.

## 1.1.0

### Added

- [the ability to visualize](https://grlt-hub.github.io/app-compose/how-to-guides/visualize-the-system/) the system composed of containers effectively (including transitive dependencies and their paths)

## 1.0.0

### Added

- `createContainer` fn
- `compose.up` fn
