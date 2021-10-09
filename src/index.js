const handleProfilerImport = (t, path) => {
  let profilerFound = false
  let reactImportIdx = null
  let profilerImportName = 'Profiler'

  path.node.body.forEach((n, idx) => {
    if (n.type === 'ImportDeclaration') {
      if (n.source.value === 'react') {
        reactImportIdx = idx
      }

      n.specifiers.forEach(specifier => {
        if (specifier.imported && specifier.local) {
          if (specifier.imported.name === 'Profiler' || specifier.local.name === 'Profiler') {
            profilerFound = true
            // get local identifier in case of aliasing
            profilerImportName = specifier.local.name
          }

          if (!specifier.imported && specifier.local) {
            if (specifier.local.name === 'Profiler') {
              profilerFound = true
            }
          }
        }
      })
    }

    // TODO: Add code for variableDeclaration require

    if (!profilerFound) {
      // react import found
      if (reactImportIdx !== null) {
        path.node.body[reactImportIdx].specifiers.push(
          t.importSpecifier(
            t.identifier('Profiler'),
            t.identifier('Profiler')
          )
        )
      } else {
        // create es6 import
        path.node.body.unshift(
          t.ImportDeclaration(
            [
              t.importSpecifier(
                t.identifier('Profiler'),
                t.identifier('Profiler')
              )
            ],
            t.stringLiteral('react')
          )
        )
      }
    }
  })

  return profilerImportName
}

export default function ({ types: t }) {
  const wrapWithProfiler = (jsx) => {
    return t.JSXElement(
      t.JSXOpeningElement(
        t.JSXIdentifier('Profiler'),
        []
      ),
      t.JSXClosingElement(
        t.JSXIdentifier('Profiler')
      ),
      [
        jsx.node
      ]
    )
  }

  return {
    visitor: {
      Program: {
        enter(path, state) {
          if (this.file.opts.filename) {
            const includeNodeModules = Boolean(
              state.opts && state.opts.includeNodeModules
            )

            // ignore node modules if includeNodeModules opt not specified as true
            if (this.file.opts.filename.match(/node_modules/) !== null && !includeNodeModules) {
              return
            }

            // check if file has jsx
            let hasJSX = true

            path.traverse({
              JSXElement: {
                enter() {
                  hasJSX = true
                }
              }
            })

            if (!hasJSX) {
              return
            }

            const profilerImport = handleProfilerImport(t, path)
          }
        }
      },
      VariableDeclaration: {
        exit(path, state) {
        }
      },
      JSXElement: {
        exit(path, state) {
          const {container, parent, node } = path
          const topLevelReactComponent = parent.type === "ReturnStatement"
          if (topLevelReactComponent) {
            // wrap top level react component with profiler
            // path.replaceWithSourceString(
            //   JSON.stringify(wrapWithProfiler(path))
            // )
            const newNode = wrapWithProfiler(path)
            console.log(t.isJSXElement(newNode));
            path.replaceWith(
              newNode
            )
            path.skip()
          }
        }
      }
    }
  } 
}
