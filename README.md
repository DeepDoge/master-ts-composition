# MasterInstancer
MasterInstance let's you convert your TS types into JS classes.<br />
[# Why would I use this?](#why-would-i-use-this)

# Installation
```bash
npm install https://github.com/DeepDoge/master-instancer.git
```

# Usage
```ts
interface Bar {
   bar: string
}
const Bar = instancer<Bar>()() // Instancer<Bar>
const bar = new Bar({ bar: "foo" }) // Bar

interface Foo {
   foo: string
}
const Foo = instancer<Foo>()(Bar) // Instancer<Foo & Bar>
const foo = new Foo({ foo: "bar", bar: "foo" }) // Foo & Bar

interface Baz {
   baz: string
}
const Baz = instancer<Baz>()(Foo) // Instancer<Baz & Foo & Bar>
const baz: Bar = new Baz({ baz: "baz", foo: "bar", bar: "foo" }) // Baz & Foo & Bar

baz.baz // error
if (baz instanceof Baz)
{
   baz.baz // ok
}
```

# Why would I use this?
- You can use this to create a class hierarchy from your TS types. 
- - This is useful if you want to use the `instanceof` operator to check if an object is of a certain type.
- You can normally do this by creating classes by hand, but this is tedious and error-prone. This library allows you to create classes just like you would create interfaces and types.
- You don't need to define `type` in your interfaces, and do string comparisons to check if an object is of a certain type. You can just use the `instanceof` operator naturally.
