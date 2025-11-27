// Injects a theme toggle into the header, persists choice to localStorage,
// and respects system preference. Works when included on any page with a <header> element.
(function(){
  const STORAGE_KEY = 'site-theme';
  const THEMES = [
    { id: 'dark', label: 'Dark' },
    { id: 'light', label: 'Light' },
    { id: 'solar', label: 'Solar' },
    { id: 'sunset', label: 'Sunset' },
    { id: 'ocean', label: 'Ocean' },
    { id: 'violet', label: 'Violet' },
    { id: 'mint', label: 'Mint' },
    { id: 'mono', label: 'Mono' },
    { id: 'sunrise', label: 'Sunrise' },
    { id: 'retro', label: 'Retro' }
  ];

  function isValidTheme(t){ return THEMES.some(x => x.id === t); }

  function getInitialTheme(){
    try{
      const stored = localStorage.getItem(STORAGE_KEY);
      if(stored && isValidTheme(stored)) return stored;
    }catch(e){}
    // fallback to system preference
    try{
      if(window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    }catch(e){}
    return 'dark';
  }

  function applyTheme(theme){
    if(!theme || !isValidTheme(theme)) theme = 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    window.dispatchEvent(new CustomEvent('site:theme-change', { detail: { theme } }));
  }

  function persistTheme(theme){
    try{ localStorage.setItem(STORAGE_KEY, theme); }catch(e){}
  }

  function createSelect(){
    const wrapper = document.createElement('div');
    wrapper.className = 'theme-picker';

    const select = document.createElement('select');
    select.className = 'theme-select';
    select.setAttribute('aria-label','Choose site theme');

    THEMES.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.label;
      select.appendChild(opt);
    });

    select.addEventListener('change', (e) => {
      const v = e.target.value;
      applyTheme(v);
      persistTheme(v);
    });

    wrapper.appendChild(select);
    return { wrapper, select };
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const header = document.querySelector('header');
    if(!header) return;

    const { wrapper, select } = createSelect();
    header.appendChild(wrapper);

    const initial = getInitialTheme();
    applyTheme(initial);
    select.value = initial;

    // react to system changes only if user hasn't chosen an explicit theme
    try{
      const mq = window.matchMedia('(prefers-color-scheme: light)');
      const stored = localStorage.getItem(STORAGE_KEY);
      if(!stored){
        mq.addEventListener ? mq.addEventListener('change', (e)=>{
          applyTheme(e.matches ? 'light' : 'dark');
          select.value = e.matches ? 'light' : 'dark';
        }) : mq.addListener(()=>{});
      }
    }catch(e){}
  });
})();
