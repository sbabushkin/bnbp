import { isSoftDeletable } from '../common/base.deletable.model';

export async function getOrThrow<T>(
  getter: () => Promise<T>,
  exception: Error,
  allowDeleted: boolean = false,
): Promise<T> {
  const res = await getter();
  if (
    res === undefined || res === null
    || (!allowDeleted && isSoftDeletable(res) && res.isSoftDeleted())
  ) {
    throw exception;
  }

  return res;
}
