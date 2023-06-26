type Key = string;
type Path = string;
type Obj = { [k: Key]: unknown };
type Fn = (...xs: any[]) => unknown;

type Source = Obj & { exhausted?: never };
type Mock<S extends Source> = Omit<S, 'exhausted'> & {
    exhausted: () => true | {
        'not accessed'?: Path[],
        'not called'?: Path[]
    }
};

type Accessed = Map<Key, unknown>;
type Called = Set<Key>;
type Descriptor = { path: Path, isFn: boolean };
type Predicate = (descriptor: Descriptor) => boolean;

export default <S extends Source>(source: S): Mock<S> => {
    const accessed: Accessed = new Map();
    const called: Called = new Set();

    const isNotAccessed: Predicate = ({ path }) => !accessed.has(path);
    const isNotCalled: Predicate = ({ isFn, path }) => isFn && !called.has(path);

    const exhausted = () => {
        const descriptors = getDescriptiors(source);
        const error = () => getMissingPaths(descriptors, isNotAccessed, isNotCalled);

        if (accessed.size === 0) return error();

        for (const descriptor of descriptors)
            if (isNotAccessed(descriptor) || isNotCalled(descriptor))
                return error();

        return true;
    };

    return Object.assign(
        createProxy(source, accessed, called),
        { exhausted }
    );
};

const getMissingPaths = (
    descriptors: Descriptor[],
    notAccessed: Predicate,
    notCalled: Predicate
) => {
    const get = getPathsGiven(descriptors);

    return {
        ...ifPopulated({ 'not accessed': get(notAccessed) }),
        ...ifPopulated({ 'not called': get(notCalled) })
    };
}

const ifPopulated = <K extends Key>(rec: Record<K, Path[]>) => {
    for (const key in rec) if (rec[key].length) return rec;
}

const empty: never[] = [];

const getPathsGiven = (descriptors: Descriptor[]) => (include: Predicate) =>
    descriptors.flatMap(d => include(d) ? d.path : empty);

const getDescriptiors = (object: Source, origin = ''): Descriptor[] =>
    Object.entries(object).flatMap(([key, value]) => {
        const path = concat(origin, key);

        return isPlainObject(value) ? getDescriptiors(value, path)
            : path === 'exhausted' ? empty
            : [{ path, isFn: isFn(value) }]
    });

const createProxy = <T extends Obj>(
    object: T,
    accessed: Accessed,
    called: Called,
    origin: Path = ''
): T => {
    const functionMembers = new Map<Path, Fn>();
    const objectMembers = new Map<Path, Obj>();

    return new Proxy(object, {
        get: (target: T, key: Key & keyof T) => {
            const path = concat(origin, key);
            const value = target[key];

            if (path === 'exhausted') return value;

            accessed.set(path, value);

            if (isFn(value)) return getOrSet(
                functionMembers, path,
                () => (...xs) => (called.add(path), value(...xs))
            );

            else if (isPlainObject(value)) return getOrSet(
                objectMembers, origin,
                () => createProxy(value, accessed, called, path)
            );

            else return value;
        }
    })
};

const concat = (a: Path, b: Path) => !a ? b : `${a}.${b}`;

const isFn = (x: unknown): x is Fn => typeof x === 'function';

const isPlainObject = (x: unknown): x is Obj =>
    typeof x === 'object' && x !== null && x.constructor === Object;

const getOrSet = <T>(source: Map<Key, T>, key: Key, f: () => T): T => {
    const maybeMap = source.get(key);
    const map = maybeMap || f();
    if (!maybeMap) source.set(key, map);
    return map;
};