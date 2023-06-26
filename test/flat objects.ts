import test from 'ava';
import instrument from '../src/index.js';

const val = null;
const fn = () => { };

test('fails when no property is accessed', t => {
    const flat = { a: val, b: val };
    const mock = instrument(flat);

    t.not(mock.exhausted(), true)
})

test('succeeds when every property is accessed', t => {
    const flat = { a: val, b: val };
    const mock = instrument(flat);

    mock.a;
    mock.b;

    t.is(mock.exhausted(), true)
})

test('fails when some properties are not accessed', t => {
    const flat = { a: val, b: val };
    const mock = instrument(flat);

    t.not(mock.exhausted(), true)
})

test('fails when every function is accessed but not called', t => {
    const flat = { a: fn, b: fn };
    const mock = instrument(flat);

    mock.a;
    mock.b;

    t.not(mock.exhausted(), true)

})

test('succeeds when every function is called', t => {
    const flat = { a: fn, b: fn };
    const mock = instrument(flat);

    mock.a();
    mock.b();

    t.is(mock.exhausted(), true)
})