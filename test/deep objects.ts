import test from 'ava';
import instrument from '../src/index.js';

const val = null;
const fn = () => { };

test('fails when deep properties are not accessed', t => {
    const deep = { a: val, b: { c: val } };
    const mock = instrument(deep);

    mock.a;
    mock.b;

    t.not(mock.exhausted(), true)
})

test('succeeds when every property is accessed', t => {
    const deep = { a: val, b: { c: val } };
    const mock = instrument(deep);

    mock.a;
    mock.b.c;

    t.is(mock.exhausted(), true)
})

test('fails when every function is accessed but not called', t => {
    const deep = { a: fn, b: { c: fn } };

    const mock = instrument(deep);

    mock.a;
    mock.b.c;

    t.not(mock.exhausted(), true)
})

test('succeeds when every function is called', t => {
    const deep = { a: fn, b: { c: fn } };
    const mock = instrument(deep);

    mock.a();
    mock.b.c();

    t.is(mock.exhausted(), true)
})