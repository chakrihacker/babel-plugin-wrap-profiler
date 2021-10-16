"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var _templateObject;

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

// import { template } from "@babel/core"
var handleProfilerImport = function handleProfilerImport(t, path) {
  var profilerFound = false;
  var reactImportIdx = null;
  var profilerImportName = 'Profiler';
  path.node.body.forEach(function (n, idx) {
    if (n.type === 'ImportDeclaration') {
      if (n.source.value === 'react') {
        reactImportIdx = idx;
      }

      n.specifiers.forEach(function (specifier) {
        if (specifier.imported && specifier.local) {
          if (specifier.imported.name === 'Profiler' || specifier.local.name === 'Profiler') {
            profilerFound = true; // get local identifier in case of aliasing

            profilerImportName = specifier.local.name;
          }

          if (!specifier.imported && specifier.local) {
            if (specifier.local.name === 'Profiler') {
              profilerFound = true;
            }
          }
        }
      });
    } // TODO: Add code for variableDeclaration require


    if (!profilerFound) {
      // react import found
      if (reactImportIdx !== null) {
        path.node.body[reactImportIdx].specifiers.push(t.importSpecifier(t.identifier('Profiler'), t.identifier('Profiler')));
      } else {
        // create es6 import
        // const reactImport = template.ast`
        //   import { Profiler } from "react";
        // `
        // path.node.body.unshift(reactImport)
        path.node.body.unshift(t.importDeclaration([t.importSpecifier(t.identifier('Profiler'), t.identifier('Profiler'))], t.stringLiteral('react')));
      }
    }
  });
  return profilerImportName;
};

function _default(_ref) {
  var t = _ref.types,
      template = _ref.template;

  var getComponentName = function getComponentName(scope) {
    var componentName = '';

    switch (scope.path.type) {
      case "ClassMethod":
        componentName = scope.path.parentPath.parent.id.name;
        break;

      case "FunctionDeclaration":
        componentName = scope.path.container.declaration.id.name;
        break;

      case "FunctionExpression":
        scope.path.parentPath.parentPath.parentPath.parent.arguments.forEach(function (arg) {
          if (arg.type === "Identifier") {
            componentName = arg.name;
          }
        });
        break;

      default:
        componentName = scope.path.container.id.name;
        break;
    }

    return componentName;
  };

  var wrapWithProfiler = function wrapWithProfiler(jsx, componentName) {
    var Profiler = 'Profiler';
    return template.ast(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      React.createElement(\n        ", ",\n        {\n          id: '", "',\n          onRender: onRenderCallBack$\n        },\n        ", "\n      )\n    "])), Profiler, componentName, jsx.node);
  };

  return {
    visitor: {
      Program: {
        enter: function enter(path, state) {
          if (this.file.opts.filename) {
            var includeNodeModules = Boolean(state.opts && state.opts.includeNodeModules); // ignore node modules if includeNodeModules opt not specified as true

            if (this.file.opts.filename.match(/node_modules/) !== null && !includeNodeModules) {
              return;
            } // check if file has jsx


            var hasJSX = true;
            path.traverse({
              JSXElement: {
                enter: function enter() {
                  hasJSX = true;
                }
              }
            });

            if (!hasJSX) {
              return;
            }

            var profilerImport = handleProfilerImport(t, path);
            path.unshiftContainer('body', t.importDeclaration([t.importSpecifier(t.identifier('onRenderCallBack$'), t.identifier('onRenderCallBack$'))], t.stringLiteral('babel-plugin-wrap-profiler/lib/profiler-utils')));
          }
        }
      },
      JSXElement: {
        enter: function enter(path, state) {
          // TODO: move node_modules check logic to pre
          if (this.file.opts.filename) {
            var includeNodeModules = Boolean(state.opts && state.opts.includeNodeModules); // ignore node modules if includeNodeModules opt not specified as true

            if (this.file.opts.filename.match(/node_modules/) !== null && !includeNodeModules) {
              return;
            }

            var parent = path.parent,
                scope = path.scope;
            var topLevelReactComponent = parent.type === "ReturnStatement";

            if (topLevelReactComponent) {
              // function component name
              var componentName = getComponentName(scope); // wrap top level react component with profiler

              var newNodeAst = wrapWithProfiler(path, componentName);
              path.replaceWith(newNodeAst);
            }
          }
        }
      }
    }
  };
}