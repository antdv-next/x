export function noop() {}

export function resetWarned() {
  warnedMessages.clear();
}

const warnedMessages = new Set<string>();

type Warning = (valid: boolean, component: string, message?: string) => void;

const warning: Warning = (valid, component, message) => {
  if (!valid) {
    const key = `${component}:${message}`;
    if (!warnedMessages.has(key)) {
      warnedMessages.add(key);
      console.warn(`[antdx: ${component}] ${message}`);
    }
  }
};

export default warning;
