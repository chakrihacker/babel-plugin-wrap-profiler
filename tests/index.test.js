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

      var _profilerUtils = require("babel-plugin-wrap-profiler/lib/profiler-utils");

      var _react = require("react");

      var User = function User(props) {
        return React.createElement(_react.Profiler, {
          id: "User",
          onRender: _profilerUtils.onRenderCallBack$
        }, /*#__PURE__*/React.createElement(View, null, /*#__PURE__*/React.createElement(Text, null, "Hello")));
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

      var _profilerUtils = require("babel-plugin-wrap-profiler/lib/profiler-utils");

      var _react = _interopRequireDefault(require("react"));

      function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

      var User = function User(props) {
        return /*#__PURE__*/_react["default"].createElement(Profiler, {
          id: "User",
          onRender: _profilerUtils.onRenderCallBack$
        }, /*#__PURE__*/_react["default"].createElement(View, null, /*#__PURE__*/_react["default"].createElement(Text, null, "Hello")));
      };
    `

    const code = transform(input);
    expect(code).toEqual(freeText(output))
  })
});

const transform = (code) => {
  return babel.transformSync(code, {
    plugins: [profilerPlugin],
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