/** Minimal hash router: '#/today', '#/path', '#/lesson/m1/l2', ... */

function parse(): string[] {
  const h = location.hash.replace(/^#\/?/, '');
  return h ? h.split('/').map(decodeURIComponent) : ['today'];
}

class Router {
  segments = $state<string[]>(parse());

  constructor() {
    window.addEventListener('hashchange', () => {
      this.segments = parse();
      window.scrollTo(0, 0);
    });
  }

  get route(): string {
    return this.segments[0] ?? 'today';
  }
  get params(): string[] {
    return this.segments.slice(1);
  }

  go(path: string) {
    const target = `#/${path.replace(/^\/+/, '')}`;
    if (location.hash === target) return;
    const nav = () => {
      location.hash = target;
    };
    // View Transitions API where available (progressive enhancement)
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
    if (doc.startViewTransition) doc.startViewTransition(nav);
    else nav();
  }

  back() {
    history.back();
  }
}

export const router = new Router();
