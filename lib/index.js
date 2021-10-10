"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;
var isProfilerImported = false;

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


    if (!profilerFound && !isProfilerImported) {
      isProfilerImported = true; // react import found

      if (reactImportIdx !== null) {
        path.node.body[reactImportIdx].specifiers.push(t.importSpecifier(t.identifier('Profiler'), t.identifier('Profiler')));
      } else {
        // create es6 import
        path.node.body.unshift(t.ImportDeclaration([t.importSpecifier(t.identifier('Profiler'), t.identifier('Profiler'))], t.stringLiteral('react')));
      }
    }
  });
  return profilerImportName;
};

function _default(_ref) {
  var t = _ref.types;

  var getComponentName = function getComponentName(scope) {
    var componentName = null;

    if (scope.path.type === "ClassMethod") {
      componentName = scope.path.parentPath.parent.id.name;
    } else {
      componentName = scope.path.container.id.name;
    }

    return componentName;
  };

  var wrapWithProfiler = function wrapWithProfiler(jsx, componentName) {
    return t.JSXElement(t.JSXOpeningElement(t.JSXIdentifier('Profiler'), [t.JSXAttribute(t.JSXIdentifier('id'), t.stringLiteral(componentName)), t.JSXAttribute(t.JSXIdentifier('onRender'), t.JSXExpressionContainer(t.Identifier('onRenderCallBack$')))]), t.JSXClosingElement(t.JSXIdentifier('Profiler')), [jsx.node]);
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
            path.unshiftContainer('body', t.importDeclaration([t.importSpecifier(t.identifier('onRenderCallBack$'), t.identifier('onRenderCallBack$'))], t.stringLiteral('babel-plugin-wrap-profiler/src/profiler-utils')));
          }
        }
      },
      VariableDeclaration: {
        exit: function exit(path, state) {}
      },
      JSXElement: {
        exit: function exit(path, state) {
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

              var newNode = wrapWithProfiler(path, componentName);
              path.replaceWith(newNode);
              path.skip();
            }
          }
        }
      }
    }
  };
}