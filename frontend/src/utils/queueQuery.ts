let queue = Promise.resolve();

export function queueQuery<T>(queryFn: () => Promise<T>): Promise<T> {
  const current = queue.then(
    () => queryFn(),
    () => queryFn()
  );

  queue = current.then(
    () => {},
    () => {}
  );

  return current;
}
