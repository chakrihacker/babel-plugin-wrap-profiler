let components = new Map();

export function onRenderCallBack$(id, phase, actualDuration, baseDuration, startTime, commitTime, interactions) {
  if (components.has(id)) {
    const component = components.get(id);
    components.set(id, {
      ...component,
      count: component.count + 1,
      actualDuration: component.actualDuration + actualDuration,
      baseDuration: component.baseDuration + baseDuration,
    });
  } else {
      const component = {
        count: 1,
        actualDuration,
        baseDuration,
      };
      components.set(id, component);
  }
}

export function getComponentsByRenderCount() {
  return new Map([...components].sort((a, b) => b[1].count - a[1].count));
}

export function getComponentsByTotalDuration() {
  return new Map([...components].sort((a, b) => b[1].actualDuration - a[1].actualDuration));
}

export function logComponents(type) {
  if (type === 'render') {
    getComponentsByRenderCount().forEach((value, key) => {
      console.log(`${key} ${value.count} ${value.actualDuration}`);
    })
  } else if(type === 'duration') {
    getComponentsByTotalDuration().forEach((value, key) => {
      console.log(`${key} ${value.count} ${value.actualDuration}`);
    })
  } else {
    components.forEach((value, key) => {
      console.log(`${key} ${value.count} ${value.actualDuration}`);
    })
  }
}