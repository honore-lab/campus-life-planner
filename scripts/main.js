// main.js
import { initialState } from './state.js';
import { init as initUI } from './ui.js';

// load initial state (or seed)
async function bootstrap(){
  let s = initialState();
  // If empty, try to load seed.json automatically (only when no saved data)
  if (!s.items || s.items.length === 0){
    try {
      const res = await fetch('seed.json');
      if (res.ok){
        const arr = await res.json();
        s.items = arr;
        // save initial seed to localStorage
        import('./storage.js').then(m => m.saveData(s.items));
      }
    } catch (e){
      // ignore fetch error
    }
  }
  initUI(s, document.body);
}
bootstrap();
