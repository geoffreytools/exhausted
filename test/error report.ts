import test from 'ava';
import instrument from '../src/index.js';

const val = null;
const fn = () => { };


test('fails when deep properties are not accessed', t => {
    const deep = { a: val, b: { hello: val }, c: val };
    const mock = instrument(deep);

    mock.a;
    mock.b;

    t.deepEqual(mock.exhausted(), { "not accessed": ["b.hello", "c"] });
})


test('fails when functions are not called', t => {
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