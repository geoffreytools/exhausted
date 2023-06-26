import test from 'ava';
import instrument from '../src/index.js';

const val = null;
const fn = () => { };


test('show paths to members which were not accessed', t => {
    const deep = { a: val, b: { hello: val }, c: val };
    const mock = instrument(deep);

    mock.a;
    mock.b;

    t.deepEqual(mock.exhausted(), { "not accessed": ["b.hello", "c"] });
})


test('show paths to members which were not called in a distinct record', t => {
    const deep = { a: fn, b: { hello: fn }, c: fn };
    const mock = instrument(deep);

    mock.a();
    mock.b;
    mock.c;

    t.deepEqual(mock.exhausted(), {
        "not accessed": ["b.hello"],
        "not called": ["b.hello", "c"]
    });
})
