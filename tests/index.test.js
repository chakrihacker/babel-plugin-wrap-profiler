const babel = require("@babel/core");
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

      function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

      var _profilerUtils = require("babel-plugin-wrap-profiler/lib/profiler-utils");

      var _react = _interopRequireWildcard(require("react"));

      function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

      function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

      var User = function User(props) {
        return /*#__PURE__*/_react["default"].createElement(_react.Profiler, {
          id: "User",
          onRender: _profilerUtils.onRenderCallBack$
        }, /*#__PURE__*/_react["default"].createElement(View, null, /*#__PURE__*/_react["default"].createElement(Text, null, "Hello")));
      };
    `

    const code = transform(input);
    expect(code).toEqual(freeText(output))
  })

  test("should handle react class", () => {
    const input = `

      class User extends React.Component {
        render() {
          return (
            <View>
              <Text>{"Hello"}</Text>
            </View>
          )
        }
      }
    `;

    const output = `
      "use strict";

      function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

      var _profilerUtils = require("babel-plugin-wrap-profiler/lib/profiler-utils");

      var _react = require("react");

      function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

      function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

      function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

      function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

      function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

      function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

      function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

      function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

      function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

      function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

      var User = /*#__PURE__*/function (_React$Component) {
        _inherits(User, _React$Component);

        var _super = _createSuper(User);

        function User() {
          _classCallCheck(this, User);

          return _super.apply(this, arguments);
        }

        _createClass(User, [{
          key: "render",
          value: function render() {
            return React.createElement(_react.Profiler, {
              id: "User",
              onRender: _profilerUtils.onRenderCallBack$
            }, /*#__PURE__*/React.createElement(View, null, /*#__PURE__*/React.createElement(Text, null, "Hello")));
          }
        }]);

        return User;
      }(React.Component);
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