export type Comparator<T> = (item: T, target: T) => number;

export const defaultComparator = <T>(a: T, b: T): number => {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
};

export const linearSearch = <T>(items: T[], target: T, comparator: Comparator<T>): number => {
  for (let index = 0; index < items.length; index += 1) {
    const current = items[index];

    if (current !== undefined && comparator(current, target) === 0) {
      return index;
    }
  }
  return -1;
};

export const binarySearch = <T>(items: T[], target: T, comparator: Comparator<T>): number => {
  if (items.length === 0) {
    return -1;
  }

  let left = 0;
  let right = items.length - 1;

  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    const current = items[middle];

    if (current === undefined) {
      return -1;
    }

    const comparison = comparator(current, target);

    if (comparison === 0) {
      return middle;
    }

    if (comparison < 0) {
      left = middle + 1;
    } else {
      right = middle - 1;
    }
  }

  return -1;
};
