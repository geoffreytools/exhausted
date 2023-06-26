# exhausted

This util lets you test that you have accessed all the properties and called all the functions of an arbitrarily deep object.

## Use case
When you are at a boundary and you have extracted your business logic in order to test it in isolation, but you can still invoke your humble object in a test (it is simply not convenient to inspect its output), you may find value in knowing that all this logic is actually being used.

It is a cheap way to give you confidence that everything is wired correctly. It also helps track down issues when a snapshot fails because you know what part of the code is invoked.

## How to install
```
npm install exhausted
```

## How to use
Pretend the logic that produced this viewModel was thoroughly tested:
```javascript
const viewModel = {
    data: [1, 2, 3, 4],
    x: (value) => (...),
    y: (value) => (...),
    color: '#45b04f',
    shouldDoX: false,
}
```
We have this rendering function relying on some framework that is cumbersome to test:
```javascript
const draw = ({ data, x, y, color }) => {
    data.forEach(datum => setPosition(x(datum), y(datum)))
    setColor(color);
    if(data.length > 2) doX()
}
```
We test that our viewModel was used exhaustively.
```javascript
import instrument from 'exhausted';

test('`draw` uses `viewModel` exhaustively', t => {
    const mock = instrument(viewModel);

    draw(mock);

    t.true(mock.exhausted());
});
```
Since `shouldDoX` was not accessed in `draw`, our test fails with an error pointing to what went wrong:
```
Value is not `true`:

{
  'not accessed': [
      'shouldDoX'
  ]
}
```

## Peculiarities

### Simple objects
The object you are testing should be a simple data structure. The library does not support `this` binding on purpose. If you want to include behaviour, use functions.

### Code coverage
If a member is accessed or called only under certain conditions and your test setup does not trigger them, then your test will fail.

An exception to this rule is if you unconditionally access members which are used conditionally:
```javascript
const notRecommended = ({ width, color }) => { // <- color is always accessed
    if(width > Infinity) setColor(color) // <- but is never used
}
```

### Dead code

If your object has members which are no longer used, then the test will fail.

In our viewModel example: maybe `shouldDoX` should have been used in `draw`, or maybe it should have been removed from the viewModel. The two possibilities are conflated.

## Observations

The fact that our test is unaware of the composition of the object being mocked should make it possible to refactor safely.

However, the tool does put pressure on code by driving the maintainer to eliminate dead code and declare variables close the where they are used.

Although valuable, these goals should not be enforced by a test because they concern structure and not behaviour.

These properties make it difficult to unconditionally recommend using it. It comes down to personal preference.