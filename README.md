# babel-plugin-wrap-profiler

A Babel plugin that wraps components with [Profiler](https://reactjs.org/docs/profiler.html).

# Usage

## Install

For Yarn

```bash
yarn add -D babel-plugin-wrap-profiler
```

For npm 

```bash
npm install --save-dev babel-plugin-wrap-profiler
```

## Configure Babel

```js
// In your .babelrc
{
    "plugins": [
        "babel-plugin-wrap-profiler"
    ]
}
```

## Log Profiler Results

```js
// In your code
import React from 'react';
import { logComponents } from "babel-plugin-wrap-profiler/lib/profiler-utils";


const Component = () => {
    return (
        <button onClick={logComponents}>
            Log Components
        </button>
    );
};
```

# Credits

- Thanks to [CoinBase](https://blog.coinbase.com/optimizing-react-native-7e7bf7ac3a34) for the inspiration.
- Jamie for [Babel plugin](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md) handbook