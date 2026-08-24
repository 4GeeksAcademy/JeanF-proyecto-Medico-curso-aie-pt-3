export type SortDirection = "asc" | "desc";

export type PrimitiveComparable = string | number | boolean | Date;

export interface RangeCriteria {
  min?: number;
  max?: number;
}

export type Criteria<T> = Partial<{
  [K in keyof T]: T[K] | ((value: T[K]) => boolean);
}>;

export interface SortField<T> {
  selector: (item: T) => PrimitiveComparable;
  direction?: SortDirection;
}

const comparePrimitives = (a: PrimitiveComparable, b: PrimitiveComparable): number => {
  const normalizedA = a instanceof Date ? a.getTime() : a;
  const normalizedB = b instanceof Date ? b.getTime() : b;

  if (normalizedA < normalizedB) {
    return -1;
  }
  if (normalizedA > normalizedB) {
    return 1;
  }
  return 0;
};

export const filterByCriteria = <T>(items: T[], criteria: Criteria<T>): T[] => {
  const entries = Object.entries(criteria) as [keyof T, Criteria<T>[keyof T]][];

  if (entries.length === 0) {
    return [...items];
  }

  return items.filter((item) =>
    entries.every(([key, expected]) => {
      if (typeof expected === "function") {
        return expected(item[key]);
      }
      return item[key] === expected;
    }),
  );
};

export const filterByRange = <T>(items: T[], selector: (item: T) => number, range: RangeCriteria): T[] => {
  return items.filter((item) => {
    const value = selector(item);

    if (range.min !== undefined && value < range.min) {
      return false;
    }

    if (range.max !== undefined && value > range.max) {
      return false;
    }

    return true;
  });
};

export const sortBy = <T>(items: T[], selector: (item: T) => PrimitiveComparable, direction: SortDirection = "asc"): T[] => {
  const directionMultiplier = direction === "asc" ? 1 : -1;

  return [...items].sort((left, right) => {
    const comparison = comparePrimitives(selector(left), selector(right));
    return comparison * directionMultiplier;
  });
};

export const sortByMany = <T>(items: T[], fields: SortField<T>[]): T[] => {
  if (fields.length === 0) {
    return [...items];
  }

  return [...items].sort((left, right) => {
    for (const field of fields) {
      const directionMultiplier = field.direction === "desc" ? -1 : 1;
      const comparison = comparePrimitives(field.selector(left), field.selector(right));

      if (comparison !== 0) {
        return comparison * directionMultiplier;
      }
    }

    return 0;
  });
};

export const groupBy = <T, K extends string | number>(items: T[], selector: (item: T) => K): Record<K, T[]> => {
  return items.reduce<Record<K, T[]>>((accumulator, item) => {
    const key = selector(item);

    if (!accumulator[key]) {
      accumulator[key] = [];
    }

    accumulator[key].push(item);
    return accumulator;
  }, {} as Record<K, T[]>);
};
