# Component basics

## What is a component?

A component is (usually) a class which implements some kind of functionality that can be used by the framework or by your own code. Currently there are 3 types of components:

- [`Service`](writing-services.md) - interfaces with some foreign API/interface and exposes a set of functionality to work with the service (ie. a database or a remote REST API server)
- [`Hook`](writing-hooks.md) - listens for events fired either by the Atlas instance or by some other component and reacts to those events (ie. a hook which starts some workers just after the application has started up, or a hook which provides some extra functionality to a service, or a hook which observes some other action which emits events when something interesting happens)
- [`Action`](writing-actions.md) - Implements some business-specific functionality which can then be called from ie. an http server's route handler or from a CLI utility

While each component serves a different purpose, they do share some similarities. Let's look what you can do inside a component.

## Inside a component

When implementing components, the following properties are available as soon as the class is constructed:

- `atlas`: The main `Atlas` instance - useful to get information about the `root` path, `env` selected or whether the instance is `started` or `prepared`.
- `config`: Your component's configuration options as supplied by the user, with your component's default values already applied.
- `log`: A [pino][pino-home] instance with some pre-defined keys set so that it's clear that the logs are coming from this component. You can pass this logger instance down to your sub-components, if you like.
- `component`: Use this function to obtain another component

## Examples

Let's say we are writing an action component... We have a basic class like this one:

```js
import { Action } from '@atlas.js/atlas'

class MyAction extends Action {
  doThing() {}
}
```

From the `doThing()` method, we can do various things!

### Inspect the Action's config

```js
console.log(this.config)
```

### Inspect the current environment

```js
console.log(this.atlas.env)
```

### Get the path to the application folder

```js
console.log(this.atlas.root)
```

### Log something to the console

```js
this.log.info({ data: true }, 'log entry with data')
```

### Get to some other component

```js
// This requires that the Action declares this component as a required dependency via a
// static requires = ['service:server'] property. See the first-steps.md document for more info.
const server = this.component('service:server')
```

[pino-home]: https://www.npmjs.com/package/pino
