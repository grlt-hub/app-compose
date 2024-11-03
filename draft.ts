const hasStrictDeps = 'dependsOn' in params;
const hasOptionalDeps = 'optionalDependsOn' in params;
const hasDeps = hasStrictDeps || hasOptionalDeps;

// todo: add test that always idle static
const $status = createStore<Status>('idle');

if (hasDeps) {
  const $strictDepsResolvingStatus: Store<Status> = combine(
    hasStrictDeps ? params.dependsOn.map((x) => x.$status) : [createStore<Status[]>(['done'])],
    (x) => {
      if (x.some((s) => s === 'off')) return 'off';
      if (x.some((s) => s === 'fail')) return 'fail';
      if (x.some((s) => s === 'pending')) return 'pending';

      // w8 for each optDeps not pending | idle, and check enabled for child conteiner. if ok -> pending
      if (x.every((s) => s === 'done')) return 'done';

      return 'idle';
    },
  );

  $strictDepsResolvingStatus.watch((s) => {
    if (['off', 'fail'].includes(s)) {
      launch($status, s);
    }
  });
}
