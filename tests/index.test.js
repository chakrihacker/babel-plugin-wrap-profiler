const babel = require("@babel/core");
const jsxPlugin = require('@babel/plugin-syntax-jsx')
const profilerPlugin = require("../src/index");

describe("babel-plugin-wrap-profiler", () => {
  test("should wrap a function component with profiler", () => {
    const input = `
      const User = (props) => {
        return (
          <View>
            <Text>{"Hello"}</Text>
          </View>
        )
      }
    `;

    const output = `
      "use strict";

      var _react = require("react");

      var User = function User(props) {
        return <_react.Profiler><View>
                  /*#__PURE__*/React.createElement(Text, null, "Hello")
                </View></_react.Profiler>;
      };
    `

    const code = transform(input);
    expect(code).toEqual(freeText(output))
  });

  test("handle react import", () => {
    const input = `
      import React from 'react'
      const User = (props) => {
        return (
          <View>
            <Text>{"Hello"}</Text>
          </View>
        )
      }
    `;

    const output = `
      "use strict";

      function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

      var _react = _interopRequireWildcard(require("react"));

      function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

      function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

      var User = function User(props) {
        return <_react.Profiler><View>
                  /*#__PURE__*/_react["default"].createElement(Text, null, "Hello")
                </View></_react.Profiler>;
      };
    `

    const code = transform(input);
    expect(code).toEqual(freeText(output))
  })
});

const transform = (code) => {
  return babel.transformSync(code, {
    plugins: [profilerPlugin, jsxPlugin],
    filename: "src/index.js",
    code: true,
    ast: false,
  }).code
}

// Will use the shortest indention as an axis
export const freeText = (text) => {
  if (text instanceof Array) {
    text = text.join('')
  }

  // This will allow inline text generation with external functions, same as ctrl+shift+c
  // As long as we surround the inline text with ==>text<==
  text = text.replace(
    /( *)==>((?:.|\n)*?)<==/g,
    (match, baseIndent, content) =>
  {
    return content
      .split('\n')
      .map(line => `${baseIndent}${line}`)
      .join('\n')
  })

  const lines = text.split('\n')

  const minIndent = lines.filter(line => line.trim()).reduce((minIndent, line) => {
    const currIndent = line.match(/^ */)[0].length

    return currIndent < minIndent ? currIndent : minIndent
  }, Infinity)

  return lines
    .map(line => line.slice(minIndent))
    .join('\n')
    .trim()
    .replace(/\n +\n/g, '\n\n')
}