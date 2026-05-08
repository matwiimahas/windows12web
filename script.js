let InGameJolt = false;

if (window.location.hostname.includes("gamejolt.com")) {
  let InGameJolt = true;
  myCode();
} else {
  let InGameJolt = false;
}

function myCode() {
  let gameID = "1023497";
  let privateKey = "a03076b56a7350e9da4c7aa283246458";
}


document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  return false;
});

document.addEventListener('mousedown', (e) => {
  if (e.button === 2) {
    try {
      const el = e.target;
      const allow = el && (el.closest && (
        el.closest('#settings-window') ||
        el.closest('#about-window') ||
        el.closest('#settings-context') ||
        el.closest('.desktop-icon') ||
        el.closest('.icon') ||
        el.closest('.desktop-folder') ||
        el.closest('#taskbar-programs')
      ));
      if (allow) return; 
    } catch (err) {
      
    }
    e.preventDefault();
    return false;
  }
});




let audioContext;
let loader, loadingScreen, desktop, taskbar, taskbarPrograms, startButton, startMenu;
let settingsWindow, aboutWindow, edgeWindow, pcIcon, aboutIcon, edgeIcon, settingsIcon;
let edgeStart, settingsStart, aboutStart, sound, loginScreen, loginButton;
let wifiIcon, batteryIcon, clock, source, gainNode;
let accentColorInput, wallpaperInput, preview;
let aboutTabs, aboutIntro, aboutUpdates, aboutComing;

let edgeMaximized = false;
let edgePrevPos = { top: '150px', left: '150px', width: '600px', height: '400px' };
// globals used by code outside the load listener
var aboutMaximized = false;
var aboutPrevPos = { top: '150px', left: '150px', width: '400px', height: 'auto' };

window.addEventListener('load', () => {
  function initAudio() {
    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext && audioContext.state === 'suspended') {
          audioContext.resume().catch(e => console.warn('AudioContext resume failed:', e));
        }
      }

        
        const trustedSites = [
          'www.wikipedia.org',
          'www.mozilla.org',
          'www.bing.com',
          'matviycoderdev.neocities.org'
        ];

        function isTrustedUrl(url) {
          try {
            const u = new URL(url.startsWith('http') ? url : 'https//' + url);
            return trustedSites.includes(u.hostname);
          } catch (e) {
            return false;
          }
        }

        const edgeIframe = document.getElementById('edge-iframe');
        const edgeUrlInput = document.querySelector('#edge-window .edge-url');
        const edgeRefreshBtn = document.querySelector('#edge-window .edge-refresh');
        const edgeOpenBtn = document.querySelector('#edge-window .edge-open');
        const edgeSiteSelect = document.querySelector('#edge-window .edge-site-select');

        function loadEdgeUrl(raw) {
          if (!edgeIframe) return;
          let url = raw && raw.trim();
          if (!url) {
            url = edgeSiteSelect?.value || '';
          }
          if (!url) return;
          try {
            const normalized = url.startsWith('http') ? url : 'https//' + url;

            
            try {
              const temp = new URL(normalized);
              if (temp.hostname === 'matviycoderdev.neocities.org') {
                edgeIframe.sandbox = 'allow-forms allow-popups allow-same-origin allow-scripts';
              } else {
                edgeIframe.sandbox = 'allow-forms allow-popups allow-scripts';
              }
            } catch (e) {
              edgeIframe.sandbox = 'allow-forms allow-popups allow-scripts';
            }

            
            let loaded = false;
            const onload = () => {
              loaded = true;
              edgeIframe.removeEventListener('load', onload);
            };
            edgeIframe.addEventListener('load', onload);
            edgeIframe.src = normalized;

            
            setTimeout(() => {
              if (!loaded) {
                edgeIframe.removeEventListener('load', onload);
                const ok = confirm('Failed to load the site inside the iframe (it may block framing). Open in a new tab instead?');
                if (ok) window.open(normalized, '_blank');
                else showToast('Could not load site in iframe.');
              }
            }, 1500);
          } catch (e) {
            console.warn('Invalid URL for Edge iframe:', url, e);
          }
        }

        if (edgeOpenBtn) edgeOpenBtn.addEventListener('click', () => loadEdgeUrl(edgeUrlInput?.value));
        if (edgeRefreshBtn) edgeRefreshBtn.addEventListener('click', () => {
          if (edgeIframe) edgeIframe.src = edgeIframe.src;
        });
        if (edgeSiteSelect) edgeSiteSelect.addEventListener('change', () => {
          const v = edgeSiteSelect.value;
          if (edgeUrlInput) edgeUrlInput.value = v;
        });
        if (edgeUrlInput) {
          edgeUrlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              loadEdgeUrl(edgeUrlInput.value);
            }
          });
        }

        
        const originalOpenEdge = openEdge;
        openEdge = function() {
          originalOpenEdge();
          if (edgeIframe && (!edgeIframe.src || edgeIframe.src === 'about:blank')) {
            const first = edgeSiteSelect?.value || '';
            if (first) loadEdgeUrl(first);
          }
        };
      
      
      if (sound) {
        sound.addEventListener('error', (e) => {
          console.warn('Audio file could not be loaded (CORS or file not found):', e);
        });
        
        
        if (!window.location.protocol.startsWith('file')) {
          sound.addEventListener('canplaythrough', () => {
            if (audioContext && !source) {
              try {
                source = audioContext.createMediaElementSource(sound);
                gainNode = audioContext.createGain();
                source.connect(gainNode);
                gainNode.connect(audioContext.destination);
                gainNode.gain.value = 0.5;
              } catch (e) {
                console.warn('Could not create audio source:', e);
              }
            }
          });
        }
      }
    } catch (e) {
      console.warn('AudioContext not supported or failed to initialize:', e);
    }
  }

  initAudio(); 

  loader = document.querySelector('.progress-bar');
  loadingScreen = document.getElementById('loading-screen');
  desktop = document.getElementById('desktop');
  taskbar = document.getElementById('taskbar');
  taskbarPrograms = document.getElementById('taskbar-programs');
  startButton = document.getElementById('start-button');
  startMenu = document.getElementById('start-menu');
  settingsWindow = document.getElementById('settings-window');
  aboutWindow = document.getElementById('about-window');
  edgeWindow = document.getElementById('edge-window');
  pcIcon = document.getElementById('this-pc');
  aboutIcon = document.getElementById('about-icon');
  edgeIcon = document.getElementById('edge-icon');
  settingsIcon = document.getElementById('settings-icon');
  edgeStart = document.getElementById('edge-start');
  settingsStart = document.getElementById('settings-start');
  aboutStart = document.getElementById('about-start');
  sound = document.getElementById('startup-sound');
  loginScreen = document.getElementById('login-screen');
  loginButton = document.getElementById('login-button');
  wifiIcon = document.getElementById('wifi');
  batteryIcon = document.getElementById('battery');
  clock = document.getElementById('clock');
  accentColorInput = document.getElementById('accent-color');
  wallpaperInput = document.getElementById('wallpaper');
  preview = document.getElementById('preview');
  aboutTabs = document.querySelectorAll('#about-window .tabs button');
  aboutIntro = document.getElementById('about-intro');
  aboutUpdates = document.getElementById('about-updates');
  aboutComing = document.getElementById('about-coming');

  
  function updateTaskbarIconState(btn, isOpen) {
    
    btn.classList.remove('open-right', 'min-left');
    const winId = (btn.id || '').replace('-task','-window');
    const w = document.getElementById(winId);
    let scale = 0; 
    let visible = 0;
    if (w) {
      
      const rect = w.getBoundingClientRect();
      const isVisible = w.style.display === 'block';
      const isMax = isVisible && Math.abs(rect.left) < 2 && Math.abs(rect.top) < 2 && Math.abs(rect.width - window.innerWidth) < 6;
      if (isVisible) {
        
        scale = isMax ? 0.7 : 0.5;
        visible = 1;
      } else {
        
        scale = 0.2;
        visible = 1;
      }
    } else {
      
      scale = 0; visible = 0;
    }
    btn.style.setProperty('--u-scale', scale.toString());
    btn.style.setProperty('--u-visible', visible ? '1' : '0');
  }

  
  function handleTaskClick(btn) {
    if (!btn) return;
    const now = Date.now();
    if (btn._lastClick && now - btn._lastClick < 300) return; 
    btn._lastClick = now;
    const winId = (btn.id || '').replace('-task','-window');
    const w = document.getElementById(winId);
    if (!w) return;
    if (w.style.display === 'block') {
      
      w.classList.add('hide-window');
      setTimeout(() => {
        w.style.display = 'none';
        w.classList.remove('hide-window');
        updateTaskbarIconState(btn, false);
      }, 400);
    } else {
      
      w.style.display = 'block';
      setTimeout(() => { w.classList.add('show-window'); updateTaskbarIconState(btn,true); if (typeof resizeEdgeIframe === 'function') resizeEdgeIframe(); }, 10);
    }
  }

  function showTaskContextMenu(e, btn) {
    const existing = document.getElementById('task-context-menu');
    if (existing) existing.remove();
    const menu = document.createElement('div');
    menu.id = 'task-context-menu';
    menu.style.position = 'fixed';
    menu.style.left = e.clientX + 'px';
    menu.style.top = e.clientY + 'px';
    menu.style.background = 'rgba(30,30,30,0.95)';
    menu.style.color = 'white';
    menu.style.padding = '8px';
    menu.style.borderRadius = '8px';
    menu.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
    menu.style.zIndex = 20000;

    const winId = (btn.id || '').replace('-task', '-window');
    const winEl = document.getElementById(winId);
    function addItem(text, onClick) {
      const it = document.createElement('div');
      it.style.padding = '8px 12px';
      it.style.cursor = 'pointer';
      it.textContent = text;
      it.addEventListener('click', () => { onClick(); menu.remove(); });
      it.addEventListener('mouseenter', () => it.style.background = 'rgba(255,255,255,0.04)');
      it.addEventListener('mouseleave', () => it.style.background = '');
      menu.appendChild(it);
    }

    if (winEl && winEl.style.display === 'block') {
      addItem('❌ Close window', () => {
        winEl.classList.add('hide-window');
        setTimeout(() => { winEl.style.display = 'none'; winEl.classList.remove('hide-window'); updateTaskbarIconState(btn, false); if (btn.dataset.pinned !== 'true') btn.remove(); }, 400);
      });
    }
    if (winEl && winEl.style.display !== 'block') {
      addItem((btn.textContent || 'Open') + ' Open window', () => {
        winEl.style.display = 'block';
        setTimeout(() => { winEl.classList.add('show-window'); updateTaskbarIconState(btn, true); if (typeof resizeEdgeIframe === 'function') resizeEdgeIframe(); }, 10);
      });
    }

    addItem((btn.dataset.pinned === 'true') ? '📌 Unpin from taskbar' : '📌 Pin to taskbar', () => {
      const pinned = btn.dataset.pinned === 'true';
      btn.dataset.pinned = (!pinned).toString();
      btn.classList.toggle('pinned', !pinned);
      if (pinned === true && btn.style.display === 'none') {
        
        btn.remove();
      }
      updateTaskbarIconState(btn, (document.getElementById((btn.id||'').replace('-task','-window'))?.style.display==='block'));
    });

    document.body.appendChild(menu);
    
    const rect = menu.getBoundingClientRect();
    const pad = 8;
    let top = parseInt(menu.style.top, 10);
    let left = parseInt(menu.style.left, 10);
    if (left + rect.width + pad > window.innerWidth) left = window.innerWidth - rect.width - pad;
    if (top + rect.height + pad > window.innerHeight) top = Math.max(pad, window.innerHeight - rect.height - pad);
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
    document.addEventListener('click', () => { const m = document.getElementById('task-context-menu'); if (m) m.remove(); }, { once: true });
  }

  function enhanceTaskIcon(btn) {
    if (!btn || btn._enhanced) return;
    btn._enhanced = true;
    btn.classList.add('task-icon');
    if (!btn.dataset.pinned) btn.dataset.pinned = 'false';
    const winId = (btn.id || '').replace('-task','-window');
    const winEl = document.getElementById(winId);
    
    if (!btn.dataset.customClick || btn.dataset.customClick !== 'true') {
      btn.addEventListener('click', () => handleTaskClick(btn));
    }
    btn.addEventListener('contextmenu', (e) => { e.preventDefault(); showTaskContextMenu(e, btn); });
    
    const isOpen = winEl && winEl.style.display === 'block';
    updateTaskbarIconState(btn, isOpen);
    if (btn.dataset.pinned === 'true') btn.classList.add('pinned');
  }
  try { window.enhanceTaskIcon = enhanceTaskIcon; } catch(e) {}

  
  if (taskbarPrograms) {
    const mo = new MutationObserver(muts => {
      muts.forEach(m => {
        m.addedNodes.forEach(n => { if (n.nodeType===1 && n.id && n.id.endsWith('-task')) enhanceTaskIcon(n); });
      });
    });
    mo.observe(taskbarPrograms, { childList: true });
    
    Array.from(taskbarPrograms.children).forEach(c => { if (c.id && c.id.endsWith('-task')) enhanceTaskIcon(c); });
  }

  // Generic wiring for window title-bar controls (min/max/close)
  function wireWindowControls(win) {
    if (!win) return;
    const minBtn = win.querySelector('.min');
    const maxBtn = win.querySelector('.max');
    const closeBtn = win.querySelector('.close');
    const titleBar = win.querySelector('.title-bar');
    if (minBtn) minBtn.addEventListener('click', () => {
      win.classList.add('hide-window');
      setTimeout(() => { win.style.display = 'none'; win.classList.remove('hide-window'); const taskIcon = document.getElementById((win.id||'').replace('-window','-task')); if (taskIcon) updateTaskbarIconState(taskIcon, false); }, 360);
    });
    if (closeBtn) closeBtn.addEventListener('click', () => {
      win.classList.add('hide-window');
      setTimeout(() => {
        const isTemp = win.dataset && win.dataset.temporary === 'true';
        try {
          if (isTemp) {
            win.remove();
          } else {
            win.style.display = 'none';
            win.classList.remove('hide-window');
            const taskIcon = document.getElementById((win.id||'').replace('-window','-task'));
            if (taskIcon && taskIcon.dataset.pinned !== 'true') taskIcon.remove();
          }
        } catch(e){}
      }, 360);
    });
    let expanded = false;
    let prev = null;
    if (maxBtn) maxBtn.addEventListener('click', () => {
      if (!expanded) {
        const rect = win.getBoundingClientRect();
        prev = { top: win.style.top || rect.top + 'px', left: win.style.left || rect.left + 'px', width: win.style.width || rect.width + 'px', height: win.style.height || rect.height + 'px' };
        win.classList.add('animate-maximize');
        setTimeout(() => { win.style.top = '0'; win.style.left = '0'; win.style.width = '100%'; win.style.height = 'calc(100% - 70px)'; win.style.resize = 'none'; win.classList.remove('animate-maximize'); }, 180);
        // expand and notify taskbar to enter fullscreen mode
        const tb = document.getElementById('taskbar'); if (tb) tb.classList.add('fullscreen');
        expanded = true;
      } else {
        win.classList.add('animate-restore');
        setTimeout(() => { if (prev) { win.style.top = prev.top; win.style.left = prev.left; win.style.width = prev.width; win.style.height = prev.height; win.style.resize = 'both'; } win.classList.remove('animate-restore'); }, 180);
        // restore and notify taskbar to exit fullscreen
        const tb2 = document.getElementById('taskbar'); if (tb2) tb2.classList.remove('fullscreen');
        expanded = false;
      }
    });
    // make draggable
    if (titleBar) {
      titleBar.style.cursor = 'grab';
      let dragging = false, offX=0, offY=0;
      titleBar.addEventListener('mousedown', (e)=>{ dragging=true; offX = e.clientX - (parseInt(win.style.left)||win.offsetLeft); offY = e.clientY - (parseInt(win.style.top)||win.offsetTop); document.addEventListener('mousemove', mm); document.addEventListener('mouseup', up); });
      function mm(e){ if (!dragging) return; win.style.position='fixed'; win.style.left = (e.clientX - offX) + 'px'; win.style.top = (e.clientY - offY) + 'px'; }
      function up(){ dragging=false; document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', up); }
    }
  }

  // wire existing static windows
  document.querySelectorAll('.window').forEach(w => { try { wireWindowControls(w); } catch(e){} });

  // expose helpers globally for code outside this load handler
  try { window.wireWindowControls = wireWindowControls; } catch(e) {}
  try { window.updateTaskbarIconState = updateTaskbarIconState; } catch(e) {}
  try { window.handleTaskClick = handleTaskClick; } catch(e) {}

  
  settingsWindow.style.resize = 'both';
  aboutWindow.style.resize = 'both';

  document.body.style.cursor = 'none';
  loader.classList.add('show-progress');

  setTimeout(() => {
    loadingScreen.style.display = 'none';
    document.body.style.cursor = 'default';
    if (loginScreen) loginScreen.style.display = 'flex';
  }, 8000);

  if (loginButton) {
    loginButton.addEventListener('click', async () => {
      if (InGameJolt) {
        let username = prompt("Enter your GameJolt username:");
        let userToken = prompt("Enter your GameJolt user token:");

        fetch(`https//api.gamejolt.com/api/game/v1_2/users/auth/?game_id=${gameID}&username=${username}&user_token=${userToken}`)
        if (data.success === "true") {
          console.log("Login successful!");
          fetch(`https//api.gamejolt.com/api/game/v1_2/sessions/open/?game_id=${gameID}&username=${username}&user_token=${userToken}`);
        } else {
          console.log("Invalid username or token");
          return;
        };
        fetch(`https//api.gamejolt.com/api/game/v1_2/sessions/open/?game_id=${gameID}&username=${username}&user_token=${userToken}&signature=...`)
        fetch(`https//api.gamejolt.com/api/game/v1_2/trophies/add-achieved/?game_id=${gameID}&username=${username}&user_token=${userToken}&trophy_id=296788`);
      }
      loginScreen.classList.add('fade-out');
      setTimeout(async () => {
        if (loginScreen) loginScreen.style.display = 'none';
        
        try { initAudio(); } catch(e) { console.warn('initAudio failed on gesture:', e); }

        
        if (audioContext && audioContext.state === 'suspended') {
          try {
            await audioContext.resume();
            showWelcome();
          } catch (e) {
            console.warn('Could not resume AudioContext:', e);
            showWelcome();
          }
        }
        
        
        if (sound) {
          sound.play().catch(e => console.warn('Could not play sound:', e));
        }
        
        desktop.style.display = 'block';
        sound.play('./windows-12.mp3').catch(err => console.warn("Sound error:", err));
        taskbar.style.display = 'flex';
        taskbar.classList.remove('show-taskbar');
        void taskbar.offsetWidth;
        taskbar.classList.add('show-taskbar');
        startMenu.style.display = 'none';
      }, 500);
    });
  }

  startButton.addEventListener('click', () => {
    if (startMenu.classList.contains('show')) {
      startMenu.classList.remove('show');
      startButton.classList.remove('active');
      setTimeout(() => startMenu.style.display = 'none', 300);
    } else {
      startMenu.style.display = 'block';
      setTimeout(() => {
         startMenu.classList.add('show');
        startButton.classList.add('active');
      }, 10);
    }
});

  
  if (settingsStart) {
    settingsStart.addEventListener('click', () => {
      startMenu.style.display = (startMenu.style.display === 'none') ? 'block' : 'none';
      settingsWindow.style.display = 'none';
      openSettings();
    });
  }

  function openSettings() {
    if (InGameJolt) {
      fetch(`https//api.gamejolt.com/api/game/v1_2/trophies/add-achieved/?game_id=${gameID}&username=${username}&user_token=${userToken}&trophy_id=296790`);
    }
    settingsWindow.style.display = 'block';
    startButton.classList.remove('active');
    settingsWindow.classList.add('show-window');
    
    if (!document.getElementById('settings-task')) {
      const btn = document.createElement('span');
      btn.id = 'settings-task';
      btn.textContent = '⚙️';
      btn.dataset.pinned = 'false';
      btn.dataset.customClick = 'true';
      btn.style.marginRight = '4px';
      btn.style.marginLeft = '4px';
      btn.style.marginTop = '12px';
      btn.style.marginBottom = '12px';
      btn.style.cursor = 'pointer';
      btn.style.borderRadius = '3px';
      btn.addEventListener('mouseenter', () => {
        btn.style.background = 'rgba(255,255,255,0.2)';
        btn.style.backdropFilter = 'blur(10px)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = '';
        btn.style.backdropFilter = '';
      });
      taskbarPrograms.appendChild(btn);
      btn.addEventListener('click', () => handleTaskClick(btn));
    }
  }

  const minBtn = settingsWindow.querySelector('.min');
  const maxBtn = settingsWindow.querySelector('.max');
  const closeBtn = settingsWindow.querySelector('.close');

  minBtn.addEventListener('click', () => {
    settingsWindow.classList.add('hide-window');
    setTimeout(() => {
      if (maximized == true) {
        settingsWindow.style.top = prevPos.top;
        settingsWindow.style.left = prevPos.left;
        settingsWindow.style.width = prevPos.width;
        settingsWindow.style.height = prevPos.height;
        settingsWindow.style.resize = 'both';
        taskbar.classList.remove('fullscreen'); }
      settingsWindow.style.display = 'none';
      settingsWindow.classList.remove('hide-window');
      const taskIcon = document.getElementById((settingsWindow.id||'').replace('-window','-task'));
      if (taskIcon) updateTaskbarIconState(taskIcon, false);
    }, 500);
  });

  let maximized = false;
  let prevPos = { top: '150px', left: '150px', width: '400px', height: 'auto' };

  maxBtn.addEventListener('click', () => {
    if (!maximized) {
      prevPos = {
        top: settingsWindow.style.top,
        left: settingsWindow.style.left,
        width: settingsWindow.style.width,
        height: settingsWindow.style.height
      };
      settingsWindow.style.top = '0';
      settingsWindow.style.left = '0';
      settingsWindow.style.width = '100%';
      settingsWindow.style.height = 'calc(100% - 70px)';
      settingsWindow.style.resize = 'none';
      
      maximized = true;
      toggleFullscreenTaskbar(true);
    } else {
      settingsWindow.style.top = prevPos.top;
      settingsWindow.style.left = prevPos.left;
      settingsWindow.style.width = prevPos.width;
      settingsWindow.style.height = prevPos.height;
      settingsWindow.style.resize = 'both'; 
      
      maximized = false;
      toggleFullscreenTaskbar(false);
    }
  });

  const titleBar = settingsWindow.querySelector('.title-bar');
  let settingsDragging = false;
  let settingsStartX, settingsStartY;

  titleBar.addEventListener('mousedown', (e) => {
    
    if (maximized) {
      settingsDragging = true;
      settingsStartX = e.clientX;
      settingsStartY = e.clientY;
      maxBtn.click();
      return;
    }

    settingsDragging = false;
    settingsStartX = e.clientX;
    settingsStartY = e.clientY;

    let shiftX = e.clientX - settingsWindow.getBoundingClientRect().left;
    let shiftY = e.clientY - settingsWindow.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
      settingsWindow.style.left = pageX - shiftX + 'px';
      settingsWindow.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(e) {
      
      if (Math.abs(e.clientX - settingsStartX) > 10 || Math.abs(e.clientY - settingsStartY) > 10) {
        settingsDragging = true;
      }
      if (settingsDragging) {
        moveAt(e.pageX, e.pageY);
      }
    }

    titleBar.addEventListener('dblclick', () => {
      maxBtn.click();
    });

    document.addEventListener('mousemove', onMouseMove);

    document.onmouseup = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.onmouseup = null;

      
      if (settingsDragging) {
        const rect = settingsWindow.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        if (rect.left < 50) {
          settingsWindow.style.left = '0';
          settingsWindow.style.top = '0';
          settingsWindow.style.width = '50%';
          settingsWindow.style.height = '100%';
          settingsWindow.style.resize = 'none';
        } else if (rect.right > screenWidth - 50) {
          settingsWindow.style.left = '50%';
          settingsWindow.style.top = '0';
          settingsWindow.style.width = '50%';
          settingsWindow.style.height = '100%';
          settingsWindow.style.resize = 'none';
        }
      }

      
      const rect = settingsWindow.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      if (rect.left < 0) settingsWindow.style.left = '0px';
      if (rect.right > screenWidth) {
        settingsWindow.style.left = (screenWidth - rect.width) + 'px';
      }
      if (rect.top < 0) settingsWindow.style.top = '0px';
      if (rect.bottom > screenHeight) {
        settingsWindow.style.top = (screenHeight - rect.height) + 'px';
      }
    };
  });

  const aboutTitleBar = aboutWindow.querySelector('.title-bar');
  let aboutDragging = false;
  let aboutStartX, aboutStartY;

  aboutTitleBar.addEventListener('mousedown', (e) => {
    
    if (aboutMaximized) {
      aboutDragging = true;
      aboutStartX = e.clientX;
      aboutStartY = e.clientY;
      aboutMaxBtn.click();
      return;
    }

    aboutDragging = false;
    aboutStartX = e.clientX;
    aboutStartY = e.clientY;

    let shiftX = e.clientX - aboutWindow.getBoundingClientRect().left;
    let shiftY = e.clientY - aboutWindow.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
      aboutWindow.style.left = pageX - shiftX + 'px';
      aboutWindow.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(e) {
      
      if (Math.abs(e.clientX - aboutStartX) > 10 || Math.abs(e.clientY - aboutStartY) > 10) {
        aboutDragging = true;
      }
      if (aboutDragging) {
        moveAt(e.pageX, e.pageY);
      }
    }

    aboutTitleBar.addEventListener('dblclick', () => {
      aboutMaxBtn.click();
    });

    document.addEventListener('mousemove', onMouseMove);

    document.onmouseup = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.onmouseup = null;

      
      if (aboutDragging) {
        const rect = aboutWindow.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        if (rect.left < 50) {
          aboutWindow.style.left = '0';
          aboutWindow.style.top = '0';
          aboutWindow.style.width = '50%';
          aboutWindow.style.height = '100%';
          aboutWindow.style.resize = 'none';
        } else if (rect.right > screenWidth - 50) {
          aboutWindow.style.left = '50%';
          aboutWindow.style.top = '0';
          aboutWindow.style.width = '50%';
          aboutWindow.style.height = '100%';
          aboutWindow.style.resize = 'none';
        }
      }

      
      const rect = aboutWindow.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      if (rect.left < 0) aboutWindow.style.left = '0px';
      if (rect.right > screenWidth) {
        aboutWindow.style.left = (screenWidth - rect.width) + 'px';
      }
      if (rect.top < 0) aboutWindow.style.top = '0px';
      if (rect.bottom > screenHeight) {
        aboutWindow.style.top = (screenHeight - rect.height) + 'px';
      }
    };
  });

  
  closeBtn.addEventListener('click', () => {
    settingsWindow.classList.add('hide-window');
    setTimeout(() => {
      settingsWindow.style.top = prevPos.top;
      settingsWindow.style.left = prevPos.left;
      settingsWindow.style.width = prevPos.width;
      settingsWindow.style.height = prevPos.height;
      settingsWindow.style.resize = 'both';
      maximized = false;
      taskbar.classList.remove('fullscreen');
      settingsWindow.style.display = 'none';
      settingsWindow.classList.remove('hide-window');
      const taskIcon = document.getElementById('settings-task');
      if (taskIcon && taskIcon.dataset.pinned !== 'true') taskIcon.remove();
    }, 500);
  });

  
  const aboutMinBtn = aboutWindow.querySelector('.min');
  const aboutMaxBtn = aboutWindow.querySelector('.max');
  const aboutCloseBtn = aboutWindow.querySelector('.close');

  let aboutMaximized = false;
  let aboutPrevPos = { top: '150px', left: '150px', width: '400px', height: 'auto' };

  aboutMinBtn.addEventListener('click', () => {
    aboutWindow.classList.add('hide-window');
    setTimeout(() => {
      if (aboutMaximized) {
        aboutWindow.style.top = aboutPrevPos.top;
        aboutWindow.style.left = aboutPrevPos.left;
        aboutWindow.style.width = aboutPrevPos.width;
        aboutWindow.style.height = aboutPrevPos.height;
        aboutWindow.style.resize = 'both';
      }
      aboutWindow.style.display = 'none';
      aboutWindow.classList.remove('hide-window');
      const taskIcon = document.getElementById((aboutWindow.id||'').replace('-window','-task'));
      if (taskIcon) updateTaskbarIconState(taskIcon, false);
    }, 500);
  });

  aboutMaxBtn.addEventListener('click', () => {
    if (!aboutMaximized) {
      aboutPrevPos = {
        top: aboutWindow.style.top,
        left: aboutWindow.style.left,
        width: aboutWindow.style.width,
        height: aboutWindow.style.height
      };
      aboutWindow.style.top = '0';
      aboutWindow.style.left = '0';
      aboutWindow.style.width = '100%';
      aboutWindow.style.height = 'calc(100% - 70px)';
      aboutWindow.style.resize = 'none';
      aboutMaximized = true;
      toggleFullscreenTaskbar(true);
    } else {
      aboutWindow.style.top = aboutPrevPos.top;
      aboutWindow.style.left = aboutPrevPos.left;
      aboutWindow.style.width = aboutPrevPos.width;
      aboutWindow.style.height = aboutPrevPos.height;
      aboutWindow.style.resize = 'both';
      aboutMaximized = false;
      toggleFullscreenTaskbar(false);
    }
  });

  aboutCloseBtn.addEventListener('click', () => {
    aboutWindow.classList.add('hide-window');
    setTimeout(() => {
      aboutWindow.style.top = aboutPrevPos.top;
      aboutWindow.style.left = aboutPrevPos.left;
      aboutWindow.style.width = aboutPrevPos.width;
      aboutWindow.style.height = aboutPrevPos.height;
      aboutWindow.style.resize = 'both';
      aboutMaximized = false;
      taskbar.classList.remove('fullscreen');
      aboutWindow.style.display = 'none';
      aboutWindow.classList.remove('hide-window');
      const taskIcon = document.getElementById('about-task');
      if (taskIcon && taskIcon.dataset.pinned !== 'true') taskIcon.remove();
    }, 500);
  });

  
  if (edgeWindow) {
    edgeWindow.style.resize = 'both';
    const edgeMinBtn = edgeWindow.querySelector('.min');
    const edgeMaxBtn = edgeWindow.querySelector('.max');
    const edgeCloseBtn = edgeWindow.querySelector('.close');

    

    edgeMinBtn.addEventListener('click', () => {
      edgeWindow.classList.add('hide-window');
      setTimeout(() => {
        if (edgeMaximized) {
          edgeWindow.style.top = edgePrevPos.top;
          edgeWindow.style.left = edgePrevPos.left;
          edgeWindow.style.width = edgePrevPos.width;
          edgeWindow.style.height = edgePrevPos.height;
          edgeWindow.style.resize = 'both';
        }
        edgeWindow.style.display = 'none';
        edgeWindow.classList.remove('hide-window');
        const taskIcon = document.getElementById((edgeWindow.id||'').replace('-window','-task'));
        if (taskIcon) updateTaskbarIconState(taskIcon, false);
      }, 500);
    });

    edgeMaxBtn.addEventListener('click', () => {
      if (!edgeMaximized) {
        edgePrevPos = {
          top: edgeWindow.style.top,
          left: edgeWindow.style.left,
          width: edgeWindow.style.width,
          height: edgeWindow.style.height
        };
        edgeWindow.style.top = '0';
        edgeWindow.style.left = '0';
        edgeWindow.style.width = '100%';
        edgeWindow.style.height = 'calc(100% - 70px)';
        edgeWindow.style.resize = 'none';
        edgeMaximized = true;
        toggleFullscreenTaskbar(true);
      } else {
        edgeWindow.style.top = edgePrevPos.top;
        edgeWindow.style.left = edgePrevPos.left;
        edgeWindow.style.width = edgePrevPos.width;
        edgeWindow.style.height = edgePrevPos.height;
        edgeWindow.style.resize = 'both';
        edgeMaximized = false;
        toggleFullscreenTaskbar(false);
      }
    });

    edgeCloseBtn.addEventListener('click', () => {
      edgeWindow.classList.add('hide-window');
      setTimeout(() => {
        edgeWindow.style.top = edgePrevPos.top;
        edgeWindow.style.left = edgePrevPos.left;
        edgeWindow.style.width = edgePrevPos.width;
        edgeWindow.style.height = edgePrevPos.height;
        edgeWindow.style.resize = 'both';
        edgeMaximized = false;
        taskbar.classList.remove('fullscreen');
        edgeWindow.style.display = 'none';
        edgeWindow.classList.remove('hide-window');
        const taskIcon = document.getElementById('edge-task');
        if (taskIcon && taskIcon.dataset.pinned !== 'true') taskIcon.remove();
      }, 500);
    });

    
    const edgeTitleBar = edgeWindow.querySelector('.title-bar');
    let edgeDragging = false;
    let edgeStartX, edgeStartY;

    edgeTitleBar.addEventListener('mousedown', (e) => {
      if (edgeMaximized) {
        edgeDragging = true;
        edgeStartX = e.clientX;
        edgeStartY = e.clientY;
        edgeMaxBtn.click();
        return;
      }

      edgeDragging = false;
      edgeStartX = e.clientX;
      edgeStartY = e.clientY;

      let shiftX = e.clientX - edgeWindow.getBoundingClientRect().left;
      let shiftY = e.clientY - edgeWindow.getBoundingClientRect().top;

      function moveAt(pageX, pageY) {
        edgeWindow.style.left = pageX - shiftX + 'px';
        edgeWindow.style.top = pageY - shiftY + 'px';
      }

      function onMouseMove(e) {
        if (Math.abs(e.clientX - edgeStartX) > 10 || Math.abs(e.clientY - edgeStartY) > 10) {
          edgeDragging = true;
        }
        if (edgeDragging) moveAt(e.pageX, e.pageY);
      }

      edgeTitleBar.addEventListener('dblclick', () => {
        edgeMaxBtn.click();
      });

      document.addEventListener('mousemove', onMouseMove);

      document.onmouseup = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.onmouseup = null;

        if (edgeDragging) {
          const rect = edgeWindow.getBoundingClientRect();
          const screenWidth = window.innerWidth;
          if (rect.left < 50) {
            edgeWindow.style.left = '0';
            edgeWindow.style.top = '0';
            edgeWindow.style.width = '50%';
            edgeWindow.style.height = '100%';
            edgeWindow.style.resize = 'none';
          } else if (rect.right > screenWidth - 50) {
            edgeWindow.style.left = '50%';
            edgeWindow.style.top = '0';
            edgeWindow.style.width = '50%';
            edgeWindow.style.height = '100%';
            edgeWindow.style.resize = 'none';
          }
        }

        const rect = edgeWindow.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        if (rect.left < 0) edgeWindow.style.left = '0px';
        if (rect.right > screenWidth) edgeWindow.style.left = (screenWidth - rect.width) + 'px';
        if (rect.top < 0) edgeWindow.style.top = '0px';
        if (rect.bottom > screenHeight) edgeWindow.style.top = (screenHeight - rect.height) + 'px';
      };
    });
  }
  function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    const date = now.toLocaleDateString();
    clock.textContent = `${time} ${date}`;
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Clock: show animated calendar + notifications popup with month navigation
  (function attachClockPanel() {
    if (!clock) return;
    let displayDate = new Date(); // currently shown month
    const today = new Date();
    // Monday-first weekday names
    const weekdayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

    function renderCalendarHtml(d) {
      const month = d.getMonth();
      const year = d.getFullYear();
      const first = new Date(year, month, 1);
      const last = new Date(year, month + 1, 0);
      const header = `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid rgba(0,0,0,0.06);">
          <div style="display:flex;gap:8px;align-items:center;">
            <button id="cal-prev" style="background:transparent;border:none;cursor:pointer;font-size:14px;padding:6px">◀</button>
            <strong class="cal-month-label" style=\"font-size:14px\">${first.toLocaleString(undefined,{month:'long'})} ${year}</strong>
            <button id="cal-next" style="background:transparent;border:none;cursor:pointer;font-size:14px;padding:6px">▶</button>
          </div>
          <div style=\"font-size:12px;color:rgba(0,0,0,0.6)\">${today.toDateString()}</div>
        </div>`;

      // weekday headers
      let weekdays = '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;padding:8px 10px;font-size:12px;color:rgba(0,0,0,0.6);">';
      weekdayNames.forEach(w => { weekdays += `<div style="text-align:center;font-weight:600">${w}</div>`; });
      weekdays += '</div>';

      // days grid (Monday-first)
      let daysHtml = '<div class="calendar-area" style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;padding:6px 10px;">';
      const startPad = (first.getDay() + 6) % 7; // shift so Monday=0
      for (let i = 0; i < startPad; i++) daysHtml += '<div></div>';
      for (let day = 1; day <= last.getDate(); day++) {
        const isToday = (year === today.getFullYear() && month === today.getMonth() && day === today.getDate());
        const style = isToday ? 'background:var(--accent-color);color:white;font-weight:700;border-radius:8px;padding:8px;text-align:center;' : 'padding:8px;border-radius:8px;text-align:center;';
        daysHtml += `<div style="${style}">${day}</div>`;
      }
      daysHtml += '</div>';

      return header + weekdays + daysHtml;
    }

    function openClockPanel() {
      let panel = document.getElementById('clock-panel');
      if (panel) return; // already open
      panel = document.createElement('div');
      panel.id = 'clock-panel';
      panel.style.position = 'fixed';
      const rect = clock.getBoundingClientRect();
      panel.style.left = (rect.right - 340) + 'px';
      panel.style.bottom = (window.innerHeight - rect.top + 12) + 'px';
      panel.style.width = '340px';
      panel.style.maxWidth = '92vw';
      panel.style.background = 'rgba(255,255,255,0.97)';
      panel.style.color = '#111';
      panel.style.borderRadius = '12px';
      panel.style.boxShadow = '0 18px 40px rgba(0,0,0,0.45)';
      panel.style.zIndex = 40000;
      panel.style.overflow = 'hidden';
      panel.style.transform = 'translateY(12px) scale(0.98)';
      panel.style.opacity = '0';
      panel.style.transition = 'transform 260ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease';

      const notifs = localStorage.getItem('WinNotifications') ? JSON.parse(localStorage.getItem('WinNotifications')) : [{title:'Welcome',body:'Windows 12 interface loaded.'}];
      const notifsHtml = `<div style="padding:8px 12px;border-top:1px solid rgba(0,0,0,0.06);max-height:160px;overflow:auto;"><strong style=\"display:block;margin-bottom:8px;\">Notifications</strong>${notifs.map(n=>`<div style=\"padding:8px;border-radius:8px;margin-bottom:6px;background:rgba(0,0,0,0.03);\"><strong>${n.title}</strong><div style=\"font-size:12px;color:rgba(0,0,0,0.6)\">${n.body}</div></div>`).join('')}</div>`;

      panel.innerHTML = `<div style="display:flex;flex-direction:column;">${renderCalendarHtml(displayDate)}${notifsHtml}</div>`;
      document.body.appendChild(panel);

      // optionally open the quick settings popup (`popupMenu`) together
      try {
        const popup = document.getElementById('popupMenu');
        if (popup) {
          popup.style.display = 'block';
          popup.classList.add('show');
          panel._openedPopup = true;
        }
      } catch(e) {}

      // animate in
      requestAnimationFrame(() => { panel.style.transform = 'translateY(0) scale(1)'; panel.style.opacity = '1'; });

      function refresh() {
        const inner = panel.firstElementChild;
        if (!inner) return;
        inner.innerHTML = renderCalendarHtml(displayDate) + notifsHtml;
        // reattach handlers
        const p = panel.querySelector('#cal-prev');
        const n = panel.querySelector('#cal-next');
        if (p) p.addEventListener('click', (ev) => { ev.stopPropagation(); displayDate = new Date(displayDate.getFullYear(), displayDate.getMonth() - 1, 1); refresh(); });
        if (n) n.addEventListener('click', (ev) => { ev.stopPropagation(); displayDate = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 1); refresh(); });
      }
      refresh();

      function closePanel() {
        if (!panel) return;
        panel.style.transform = 'translateY(12px) scale(0.98)'; panel.style.opacity = '0';
        setTimeout(() => { try { panel.remove(); } catch(e){} }, 260);
        // also hide popup if we opened it
        try {
          if (panel._openedPopup) {
            const popup = document.getElementById('popupMenu');
            if (popup) {
              popup.classList.remove('show');
              setTimeout(() => { popup.style.display = 'none'; }, 200);
            }
          }
        } catch(e) {}
        document.removeEventListener('click', onDocClick);
      }

      function onDocClick(e) {
        if (!panel.contains(e.target) && e.target !== clock) closePanel();
      }

      document.addEventListener('click', onDocClick);
    }

    clock.addEventListener('click', (e) => { e.stopPropagation(); // don't close start menu accidentally
      const existing = document.getElementById('clock-panel');
      if (existing) {
        try { const popup = document.getElementById('popupMenu'); if (popup) { popup.classList.remove('show'); setTimeout(() => { popup.style.display = 'none'; }, 200); } } catch(e){}
        existing.remove();
        return;
      }
      openClockPanel();
    });
  })();

  
  wifiIcon.textContent = navigator.onLine ? "🛜" : "🚫";
  window.addEventListener('online', () => wifiIcon.textContent = "🛜");
  window.addEventListener('offline', () => wifiIcon.textContent = "🚫");

  
  if (navigator.getBattery) {
    navigator.getBattery().then(battery => {
      function updateBattery() {
        const level = Math.round(battery.level * 100);
        if (battery.charging) {
          batteryIcon.textContent = "🔌";
        } else if (battery.level > 0.2) {
          batteryIcon.textContent = "🔋";
        } else {
          batteryIcon.textContent = "🪫";
        }
        document.getElementById('battery-info').textContent = level + '%';
      }
      updateBattery();
      battery.addEventListener('levelchange', updateBattery);
      battery.addEventListener('chargingchange', updateBattery);
    });
  }

  pcIcon.addEventListener('mousedown', (e) => {
    let shiftX = e.clientX - pcIcon.getBoundingClientRect().left;
    let shiftY = e.clientY - pcIcon.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
      pcIcon.style.left = pageX - shiftX + 'px';
      pcIcon.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(e) {
      moveAt(e.pageX, e.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);

    document.onmouseup = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.onmouseup = null;
    };
  });

  aboutIcon.addEventListener('mousedown', (e) => {
    let shiftX = e.clientX - aboutIcon.getBoundingClientRect().left;
    let shiftY = e.clientY - aboutIcon.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
      aboutIcon.style.left = pageX - shiftX + 'px';
      aboutIcon.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(e) {
      moveAt(e.pageX, e.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);

    document.onmouseup = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.onmouseup = null;
    };
  });  

  aboutIcon.ondragstart = () => false;

  
  edgeIcon.addEventListener('mousedown', (e) => {
    let shiftX = e.clientX - edgeIcon.getBoundingClientRect().left;
    let shiftY = e.clientY - edgeIcon.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
      edgeIcon.style.left = pageX - shiftX + 'px';
      edgeIcon.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(e) {
      moveAt(e.pageX, e.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);

    document.onmouseup = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.onmouseup = null;
    };
  });

  
  settingsIcon.addEventListener('mousedown', (e) => {
    let shiftX = e.clientX - settingsIcon.getBoundingClientRect().left;
    let shiftY = e.clientY - settingsIcon.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
      settingsIcon.style.left = pageX - shiftX + 'px';
      settingsIcon.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(e) {
      moveAt(e.pageX, e.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);

    document.onmouseup = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.onmouseup = null;
    };
  });

  edgeIcon.ondragstart = () => false;
  settingsIcon.ondragstart = () => false;

  const selectionBox = document.createElement('div');
  selectionBox.className = 'selection-box';
  desktop.appendChild(selectionBox);

  const desktopItems = Array.from(desktop.querySelectorAll('.icon, .desktop-icon'));
  const selectedIcons = new Set();
  const groupFolder = document.createElement('div');
  groupFolder.className = 'group-folder-overlay';
  document.body.appendChild(groupFolder);

  let startX = 0;
  let startY = 0;
  let selectionActive = false;
  let groupOverlayTimeout = null;
  let toastTimeout = null;

  function clearSelection() {
    selectedIcons.forEach(item => item.classList.remove('selected'));
    selectedIcons.clear();
  }

  function addSelection(item) {
    item.classList.add('selected');
    selectedIcons.add(item);
  }

  function setSelection(items) {
    clearSelection();
    items.forEach(addSelection);
  }

  function rectsIntersect(rectA, rectB) {
    return !(rectB.left > rectA.right || rectB.right < rectA.left || rectB.top > rectA.bottom || rectB.bottom < rectA.top);
  }

  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 2600);
  }
  // expose to global so other appended modules can call
  try { window.showToast = showToast; } catch(e) {}

  function hideGroupFolder() {
    groupFolder.classList.remove('active');
    groupFolder.style.display = 'none';
    if (groupOverlayTimeout) {
      clearTimeout(groupOverlayTimeout);
      groupOverlayTimeout = null;
    }
  }

  function showGroupFolder(x, y) {
    const icons = Array.from(selectedIcons);
    if (icons.length < 2) return;

    const content = icons.map(icon => {
      const label = icon.querySelector('span')?.textContent || 'App';
      const img = icon.querySelector('img')?.src || '';
      return `<div class="group-folder-icon"><img src="${img}" alt="${label}"><span>${label}</span></div>`;
    }).join('');

    groupFolder.innerHTML = `
      <h4>App group (${icons.length})</h4>
      <div class="group-folder-icons">${content}</div>
      <button type="button">Open group</button>
    `;

    groupFolder.style.visibility = 'hidden';
    groupFolder.style.display = 'block';
    const rect = groupFolder.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = x;
    let top = y;
    if (left + rect.width > vw) left = Math.max(10, vw - rect.width - 10);
    if (top + rect.height > vh) top = Math.max(10, vh - rect.height - 10);

    groupFolder.style.left = `${left}px`;
    groupFolder.style.top = `${top}px`;
    groupFolder.style.visibility = 'visible';
    groupFolder.classList.add('active');

    const button = groupFolder.querySelector('button');
    if (button) {
      button.onclick = () => {
        hideGroupFolder();
        const icons = Array.from(selectedIcons);
        if (icons.length >= 2) {
          createGroupFromSelection(icons);
          showToast('Group created');
          if (InGameJolt) {
            fetch(`https//api.gamejolt.com/api/game/v1_2/trophies/add-achieved/?game_id=${gameID}&username=${username}&user_token=${userToken}&trophy_id=296789`);
          }
        } else {
          showToast('Need 2 or more icons to create a group');
        }
      };
    }

    if (groupOverlayTimeout) clearTimeout(groupOverlayTimeout);
    groupOverlayTimeout = setTimeout(hideGroupFolder, 7000);
  }

  
  function createGroupFromSelection(icons) {
    if (!icons || icons.length < 2) return;
    const name = prompt('Enter group name:', 'New group') || 'New group';

    if (name === "0000") {
      window.open("DSoDindex.html", "_self");
    }

    const rects = icons.map(ic => ic.getBoundingClientRect());
    const left = Math.min(...rects.map(r => r.left));
    const top = Math.min(...rects.map(r => r.top));

    const folder = document.createElement('div');
    folder.className = 'desktop-folder';
    folder.style.left = (left - desktop.getBoundingClientRect().left) + 'px';
    folder.style.top = (top - desktop.getBoundingClientRect().top) + 'px';

    const label = document.createElement('div');
    label.className = 'folder-label';
    label.textContent = name;
    folder.appendChild(label);

    const thumbs = document.createElement('div');
    thumbs.className = 'folder-thumbs';
    icons.forEach(ic => {
      const thumb = document.createElement('div');
      thumb.className = 'folder-thumb';
      const img = ic.querySelector('img') ? ic.querySelector('img').cloneNode(true) : document.createElement('div');
      const span = document.createElement('span');
      span.textContent = ic.querySelector('span')?.textContent || '';
      thumb.appendChild(img);
      thumb.appendChild(span);
      thumbs.appendChild(thumb);
      ic.remove();
    });

    folder.appendChild(thumbs);
    desktop.appendChild(folder);

    folder.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      let shiftX = e.clientX - folder.getBoundingClientRect().left;
      let shiftY = e.clientY - folder.getBoundingClientRect().top;
      function moveAt(pageX, pageY) {
        folder.style.left = (pageX - shiftX - desktop.getBoundingClientRect().left) + 'px';
        folder.style.top = (pageY - shiftY - desktop.getBoundingClientRect().top) + 'px';
      }
      function onMouseMove(ev) { moveAt(ev.pageX, ev.pageY); }
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', function up() { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', up); });
    });

    folder.addEventListener('dblclick', () => {
      openFolderWindow(folder);
    });

    
    folder.addEventListener('contextmenu', (ev) => {
      showFolderContextMenu(ev, folder);
    });

    clearSelection();

    function openFolderWindow(folderElement) {
      const folderName = folderElement.querySelector('.folder-label')?.textContent || 'Folder';
      const icons = folderElement.querySelectorAll('.folder-thumb');
      
      const folderWindow = document.createElement('div');
      folderWindow.className = 'window';
      folderWindow.id = `folder-${Date.now()}`;
      folderWindow.style.display = 'block';
      folderWindow.style.width = '500px';
      folderWindow.style.height = '350px';
      
      const titleBar = document.createElement('div');
      titleBar.className = 'title-bar';
      titleBar.innerHTML = `
        <span class="title">📁 ${folderName}</span>
        <div class="window-buttons">
          <button class="min">–</button>
          <button class="max">□</button>
          <button class="close">×</button>
        </div>
      `;
      
      const content = document.createElement('div');
      content.style.padding = '12px';
      content.style.overflowY = 'auto';
      content.style.display = 'grid';
      content.style.gridTemplateColumns = 'repeat(5, 1fr)';
      content.style.gap = '12px';
      content.style.height = 'calc(100% - 40px)';
      content.style.background = '#f5f5f5';

      
      let iconSize = 40; 
      const toolbar = document.createElement('div');
      toolbar.style.display = 'flex';
      toolbar.style.alignItems = 'center';
      toolbar.style.gap = '8px';
      toolbar.style.padding = '8px 12px';
      toolbar.style.borderBottom = '1px solid rgba(0,0,0,0.08)';
      toolbar.style.background = '#f7f7f7';

      const sizeLabel = document.createElement('label');
      sizeLabel.textContent = 'Icon size:';
      sizeLabel.style.fontSize = '13px';
      sizeLabel.style.color = '#333';

      const sizeInput = document.createElement('input');
      sizeInput.type = 'range';
      sizeInput.min = '24';
      sizeInput.max = '120';
      sizeInput.value = String(iconSize);
      sizeInput.style.flex = '1';

      const sizeValue = document.createElement('span');
      sizeValue.textContent = iconSize + 'px';
      sizeValue.style.minWidth = '46px';
      sizeValue.style.textAlign = 'right';
      sizeValue.style.fontSize = '13px';
      sizeValue.style.color = '#333';

      toolbar.appendChild(sizeLabel);
      toolbar.appendChild(sizeInput);
      toolbar.appendChild(sizeValue);

      sizeInput.addEventListener('input', () => {
        iconSize = parseInt(sizeInput.value, 10) || 40;
        sizeValue.textContent = iconSize + 'px';
        content.querySelectorAll('img').forEach(img => {
          img.style.width = iconSize + 'px';
          img.style.height = iconSize + 'px';
        });
        content.querySelectorAll('div').forEach(div => {
          const lbl = div.querySelector('span');
          if (lbl) lbl.style.fontSize = Math.max(10, Math.round(iconSize / 4)) + 'px';
        });
      });
      
      icons.forEach(thumb => {
        const iconDiv = document.createElement('div');
        iconDiv.style.textAlign = 'center';
        iconDiv.style.cursor = 'pointer';
        iconDiv.style.padding = '8px';
        iconDiv.style.borderRadius = '6px';
        
        const img = thumb.querySelector('img')?.cloneNode(true);
        if (img) {
          img.style.width = iconSize + 'px';
          img.style.height = iconSize + 'px';
          img.style.objectFit = 'contain';
          img.style.display = 'block';
          img.style.margin = '0 auto';
        }
        const span = thumb.querySelector('span')?.cloneNode(true);
        if (span) span.style.display = 'block';
        if (span) span.style.marginTop = '4px';
        if (span) span.style.fontSize = Math.max(10, Math.round(iconSize / 4)) + 'px';
        
        if (img) iconDiv.appendChild(img);
        if (span) iconDiv.appendChild(span);
        
        iconDiv.addEventListener('mouseenter', () => {
          iconDiv.style.background = 'rgba(0,120,215,0.15)';
        });
        iconDiv.addEventListener('mouseleave', () => {
          iconDiv.style.background = '';
        });
        
        iconDiv.addEventListener('dblclick', () => {
          const appName = span?.textContent.toLowerCase() || '';
          if (appName.includes('edge')) openEdge();
          else if (appName.includes('settings')) openSettings();
          else if (appName.includes('about')) openAbout();
          folderWindow.remove();
        });
        
        content.appendChild(iconDiv);
      });
      
      folderWindow.appendChild(titleBar);
      folderWindow.appendChild(content);
      document.body.appendChild(folderWindow);
      
      const minBtn = folderWindow.querySelector('.min');
      const maxBtn = folderWindow.querySelector('.max');
      const closeBtn = folderWindow.querySelector('.close');
      
      minBtn.addEventListener('click', () => {
        folderWindow.remove();
      });
      
      maxBtn.addEventListener('click', () => {
        const isMax = folderWindow.getAttribute('data-max') === 'true';
        if (!isMax) {
          folderWindow.setAttribute('data-max', 'true');
          folderWindow.style.top = '0';
          folderWindow.style.left = '0';
          folderWindow.style.width = '100%';
          folderWindow.style.height = 'calc(100% - 70px)';
        } else {
          folderWindow.setAttribute('data-max', 'false');
          folderWindow.style.top = '100px';
          folderWindow.style.left = '100px';
          folderWindow.style.width = '500px';
          folderWindow.style.height = '350px';
        }
      });
      
      closeBtn.addEventListener('click', () => {
        folderWindow.remove();
      });
      
      
      let dragging = false;
      titleBar.addEventListener('mousedown', (e) => {
        dragging = true;
        let shiftX = e.clientX - folderWindow.getBoundingClientRect().left;
        let shiftY = e.clientY - folderWindow.getBoundingClientRect().top;
        
        function moveAt(pageX, pageY) {
          folderWindow.style.left = (pageX - shiftX) + 'px';
          folderWindow.style.top = (pageY - shiftY) + 'px';
        }
        
        function onMouseMove(e) {
          if (dragging) moveAt(e.pageX, e.pageY);
        }
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', () => {
          dragging = false;
          document.removeEventListener('mousemove', onMouseMove);
        });
      });
    }

    function showFolderContextMenu(e, folderElement) {
      e.preventDefault();
      
      const menu = document.createElement('div');
      menu.style.position = 'fixed';
      menu.style.background = 'rgba(40,40,40,0.95)';
      menu.style.color = 'white';
      menu.style.borderRadius = '6px';
      menu.style.padding = '6px 0';
      menu.style.zIndex = '10000';
      menu.style.minWidth = '180px';
      menu.style.left = e.clientX + 'px';
      menu.style.top = e.clientY + 'px';
      
      const items = [
        { icon: '📂', label: 'Open', fn: () => openFolderWindow(folderElement) },
        { icon: '✏️', label: 'Rename', fn: () => renameFolderDialog(folderElement) },
        { icon: '🎨', label: 'Color', fn: () => changeFolderColor(folderElement) },
        { icon: '🗑️', label: 'Delete (extract)', fn: () => deleteFolderExtractFiles(folderElement) }
      ];
      
      items.forEach(item => {
        const div = document.createElement('div');
        div.style.padding = '8px 12px';
        div.style.cursor = 'pointer';
        div.style.display = 'flex';
        div.style.gap = '8px';
        div.innerHTML = `<span>${item.icon}</span><span>${item.label}</span>`;
        
        div.addEventListener('mouseenter', () => {
          div.style.background = 'rgba(255,255,255,0.15)';
        });
        div.addEventListener('mouseleave', () => {
          div.style.background = '';
        });
        div.addEventListener('click', () => {
          item.fn();
          menu.remove();
        });
        
        menu.appendChild(div);
      });
      
      document.body.appendChild(menu);
      
      setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
          if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
          }
        });
      }, 10);
    }

    function renameFolderDialog(folderElement) {
      const label = folderElement.querySelector('.folder-label');
      const current = label.textContent;
      const newName = prompt('New folder name:', current);
      
      if (newName?.trim()) {
        label.textContent = newName.trim();
        showToast(`Renamed to "${newName.trim()}"`);
      }
    }

    function changeFolderColor(folderElement) {
      const input = document.createElement('input');
      input.type = 'color';
      input.style.display = 'none';
      document.body.appendChild(input);
      
      input.addEventListener('change', () => {
        const color = input.value;
        folderElement.style.background = color;
        folderElement.style.color = getContrastColor(color);
        input.remove();
        showToast('Folder color changed');
      });
      
      input.click();
    }

    function getContrastColor(hex) {
      const r = parseInt(hex.substr(1, 2), 16);
      const g = parseInt(hex.substr(3, 2), 16);
      const b = parseInt(hex.substr(5, 2), 16);
      return ((r * 299 + g * 587 + b * 114) / 1000) > 128 ? '#000' : '#fff';
    }

    function deleteFolderExtractFiles(folderElement) {
      const label = folderElement.querySelector('.folder-label')?.textContent || 'Folder';
      
      if (!confirm(`Delete "${label}"?\nPrograms will be moved to desktop.`)) return;
      
      const thumbs = folderElement.querySelectorAll('.folder-thumb');
      const folderRect = folderElement.getBoundingClientRect();
      const desktopRect = desktop.getBoundingClientRect();
      
      let index = 0;
      thumbs.forEach(thumb => {
        const span = thumb.querySelector('span');
        const appName = span?.textContent || '';
        
        
        let icon = Array.from(desktopItems).find(item => 
          item.querySelector('span')?.textContent === appName
        );
        
        if (icon) {
          const newLeft = parseInt(folderElement.style.left) + (index % 3) * 90;
          const newTop = parseInt(folderElement.style.top) + Math.floor(index / 3) * 90;
          
          icon.style.left = newLeft + 'px';
          icon.style.top = newTop + 'px';
          icon.style.display = 'block';
          desktop.appendChild(icon);
          index++;
        }
      });
      
      folderElement.remove();
      showToast(`"${label}" deleted. Programs restored to desktop.`);
    }
  }

  function iconMouseDown(e) {
    if (e.button !== 0) return;
    const item = e.currentTarget;
    if (item.id === 'recycle-bin' || item.closest('#recycle-bin')) return;
    if (!selectedIcons.has(item)) {
      if (!e.ctrlKey) {
        clearSelection();
      }
      addSelection(item);
    } else if (e.ctrlKey) {
      if (selectedIcons.has(item)) {
        item.classList.toggle('selected');
        if (!item.classList.contains('selected')) selectedIcons.delete(item);
      }
    }

    const initialPositions = Array.from(selectedIcons).map(icon => ({
      icon,
      left: icon.offsetLeft,
      top: icon.offsetTop
    }));

    const dragStartX = e.clientX;
    const dragStartY = e.clientY;

    function onMouseMove(moveEvent) {
      const deltaX = moveEvent.clientX - dragStartX;
      const deltaY = moveEvent.clientY - dragStartY;
      initialPositions.forEach(({ icon, left, top }) => {
        icon.style.left = `${left + deltaX}px`;
        icon.style.top = `${top + deltaY}px`;
      });
      hideGroupFolder();
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  function iconContextMenu(e) {
    const item = e.currentTarget;
    if (!selectedIcons.has(item)) {
      clearSelection();
      addSelection(item);
    }
    if (selectedIcons.size > 1) {
      e.preventDefault();
      console.log('Showing group folder for', selectedIcons.size, 'icons');
      showGroupFolder(e.clientX, e.clientY);
    } else {
      console.log('Only one icon selected, not showing group');
    }
  }

  desktopItems.forEach(item => {
    item.addEventListener('mousedown', iconMouseDown);
    item.addEventListener('contextmenu', iconContextMenu);
    item.ondragstart = () => false;
  });

  desktop.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    
    if (e.target.closest('.icon') || e.target.closest('.desktop-icon')) return;
    
    clearSelection();
    selectionActive = true;
    startX = e.clientX;
    startY = e.clientY;

    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';
    selectionBox.style.display = 'block';

    function onMouseMove(ev) {
      const currentX = ev.clientX;
      const currentY = ev.clientY;

      selectionBox.style.left = `${Math.min(startX, currentX)}px`;
      selectionBox.style.top = `${Math.min(startY, currentY)}px`;
      selectionBox.style.width = `${Math.abs(currentX - startX)}px`;
      selectionBox.style.height = `${Math.abs(currentY - startY)}px`;
    }

    function onMouseUp() {
      
      const boxRect = selectionBox.getBoundingClientRect();
      
      const allDesktopItems = Array.from(desktop.querySelectorAll('.icon, .desktop-icon'));
      const selected = allDesktopItems.filter(icon => rectsIntersect(boxRect, icon.getBoundingClientRect()));
      if (selected.length > 0) {
        setSelection(selected);
      }

      selectionBox.style.display = 'none';
      selectionActive = false;

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  const shutdownBtn = document.getElementById('shutdown');
  const restartBtn = document.getElementById('restart');
  const logoutBtn = document.getElementById('logout');

  shutdownBtn.addEventListener('click', () => {
    startButton.classList.remove('active');
    location.href = './shutdownIndex.html';
    startMenu.style.display = 'none';
  });

  restartBtn.addEventListener('click', () => {
    startButton.classList.remove('active');
    location.href = './restartIndex.html';
    startMenu.style.display = 'none';
  });

  logoutBtn.addEventListener('click', () => {
    startButton.classList.remove('active');
    startMenu.style.display = 'none';
    desktop.style.display = 'none';
    taskbar.style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
  });  

  document.addEventListener('click', (e) => {
    if (startMenu.classList.contains('show') &&
        !startMenu.contains(e.target) &&
        e.target !== startButton) {
      startMenu.classList.remove('show');
      startButton.classList.remove('active');
      setTimeout(() => startMenu.style.display = 'none', 300);
    }
  });

  
  const settingsCategories = document.querySelectorAll('.settings-category');
  const categoryContents = document.querySelectorAll('.category-content');
  const subcategories = document.querySelectorAll('.subcategory');
  const subContents = document.querySelectorAll('.sub-content');



  settingsCategories.forEach(cat => {
    cat.addEventListener('click', () => {
      settingsCategories.forEach(c => c.classList.remove('active'));
      cat.classList.add('active');
      categoryContents.forEach(cont => cont.classList.remove('active'));
      const contentId = cat.dataset.category + '-content';
      const contentElement = document.getElementById(contentId);
      if (contentElement) {
        contentElement.classList.add('active');
      } else {
        console.warn('Content element not found:', contentId);
      }
    });
  });

  subcategories.forEach(sub => {
    sub.addEventListener('click', () => {
      subcategories.forEach(s => s.classList.remove('active'));
      sub.classList.add('active');
      subContents.forEach(cont => cont.classList.remove('active'));
      const subId = sub.dataset.sub + '-sub';
      const subElement = document.getElementById(subId);
      if (subElement) {
        subElement.classList.add('active');
      } else {
        console.warn('Sub-element not found:', subId);
      }
    });
  });



  const displayBrightness = document.getElementById('brightness');
  const nightLightToggle = document.getElementById('night-light');
  const scaleSelect = document.getElementById('scale');
  const resolutionSelect = document.getElementById('resolution');
  const orientationSelect = document.getElementById('orientation');
  const soundVolumeControl = document.getElementById('volume');
  const monoAudioControl = document.getElementById('mono-audio');
  const inputVolumeControl = document.getElementById('input-volume');
  const volumeMixerBtn = document.getElementById('volume-mixer');
  const notificationsToggle = document.getElementById('notifications-toggle');
  const doNotDisturbToggle = document.getElementById('do-not-disturb');
  const autoDndToggle = document.getElementById('auto-dnd');
  const focusSelect = document.getElementById('focus');

  const displayState = {
    brightness: 50,
    nightLight: false,
    scale: 100,
    resolution: '1920x1080',
    orientation: 'landscape'
  };

  function refreshDisplaySettings() {
    const filters = [`brightness(${displayState.brightness / 100})`];
    if (displayState.nightLight) {
      filters.push('sepia(0.15) saturate(1.1)');
    }
    desktop.style.filter = filters.join(' ');
    desktop.style.zoom = `${displayState.scale / 100}`;
    if (displayState.orientation === 'portrait') {
      desktop.style.transform = 'rotate(90deg) scale(0.9)';
      desktop.style.transformOrigin = 'top left';
    } else {
      desktop.style.transform = '';
    }
  }

  if (displayBrightness) {
    displayBrightness.addEventListener('input', (e) => {
      displayState.brightness = e.target.value;
      refreshDisplaySettings();
    });
  }

  if (nightLightToggle) {
    nightLightToggle.addEventListener('change', (e) => {
      displayState.nightLight = e.target.checked;
      refreshDisplaySettings();
    });
  }

  if (scaleSelect) {
    scaleSelect.addEventListener('change', (e) => {
      displayState.scale = parseInt(e.target.value, 10) || 100;
      refreshDisplaySettings();
      showToast(`Scale set to ${displayState.scale}%`);
    });
  }

  if (resolutionSelect) {
    resolutionSelect.addEventListener('change', (e) => {
      displayState.resolution = e.target.value;
      showToast(`Resolution set to ${displayState.resolution}`);
    });
  }

  if (orientationSelect) {
    orientationSelect.addEventListener('change', (e) => {
      displayState.orientation = e.target.value;
      refreshDisplaySettings();
      showToast(`Orientation: ${displayState.orientation}`);
    });
  }

  
  const startSearchInput = document.getElementById('start-search-input');
  if (startSearchInput) {
    const startApps = Array.from(document.querySelectorAll('#start-menu .app-item'));
    startSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      startApps.forEach(a => {
        const text = (a.textContent || '').toLowerCase();
        a.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  if (soundVolumeControl) {
    soundVolumeControl.addEventListener('input', (e) => {
      if (gainNode) {
        gainNode.gain.value = e.target.value / 100;
      }
    });
  }

  if (monoAudioControl) {
    monoAudioControl.addEventListener('change', (e) => {
      showToast(`Mono audio ${e.target.checked ? 'enabled' : 'disabled'}`);
    });
  }

  if (inputVolumeControl) {
    inputVolumeControl.addEventListener('input', (e) => {
      showToast(`Input volume ${e.target.value}%`);
    });
  }

  if (volumeMixerBtn) {
    volumeMixerBtn.addEventListener('click', () => {
      showToast('Volume mixer opened (simulated)');
    });
  }

  if (notificationsToggle) {
    notificationsToggle.addEventListener('change', (e) => {
      showToast(`Notifications ${e.target.checked ? 'enabled' : 'disabled'}`);
    });
  }

  if (doNotDisturbToggle) {
    doNotDisturbToggle.addEventListener('change', (e) => {
      showToast(`Do not disturb ${e.target.checked ? 'enabled' : 'disabled'}`);
    });
  }

  if (autoDndToggle) {
    autoDndToggle.addEventListener('change', (e) => {
      showToast(`Auto DND ${e.target.checked ? 'enabled' : 'disabled'}`);
    });
  }

  if (focusSelect) {
    focusSelect.addEventListener('change', (e) => {
      showToast(`Focus mode: ${e.target.value}`);
    });
  }

  
  accentColorInput.addEventListener('input', (e) => {
    const color = e.target.value;
    document.documentElement.style.setProperty('--accent-color', color);
    preview.querySelector('.preview-taskbar').style.background = color;
  });

  
  wallpaperInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(ev) {
        desktop.style.background = '';
        desktop.style.backgroundImage = `url(${ev.target.result})`;
        desktop.style.backgroundSize = 'cover';
        desktop.style.backgroundPosition = 'center';
        desktop.style.backgroundRepeat = 'no-repeat';
        preview.style.backgroundImage = `url(${ev.target.result})`;
      };
      reader.readAsDataURL(file);
    }
  });

  
  const copilotStart = document.getElementById('copilot-start');
  const copilotIcon = document.getElementById('copilot-icon');
  const copilotWindow = document.getElementById('copilot-window');
  const copilotIframe = document.getElementById('copilot-iframe');
  function openCopilot() {
    if (!copilotWindow) return;
    // close start menu if opening from Start
    try { startMenu.classList.remove('show'); startButton.classList.remove('active'); startMenu.style.display = 'none'; } catch(e){}
    copilotWindow.style.display = 'block';
    copilotWindow.classList.add('show-window');
    
    if (copilotIframe && (!copilotIframe.src || copilotIframe.src === '')) {
      copilotIframe.src = 'https//www.chatbase.co/V2Y3Li96lT888HyVSbwTZ/help';
    }
    
    if (!document.getElementById('copilot-task')) {
      const btn = document.createElement('span');
      btn.id = 'copilot-task';
      btn.dataset.pinned = 'false';
      btn.dataset.customClick = 'true';
      btn.textContent = '🤖';
      btn.style.margin = '0 6px';
      btn.style.cursor = 'pointer';
      btn.style.borderRadius = '6px';
      btn.addEventListener('mouseenter', () => { btn.style.background = 'rgba(255,255,255,0.08)'; btn.style.backdropFilter = 'blur(6px)'; });
      btn.addEventListener('mouseleave', () => { btn.style.background = ''; btn.style.backdropFilter = ''; });
      taskbarPrograms.appendChild(btn);
      btn.addEventListener('click', () => handleTaskClick(btn));
    }

    
    try { if (typeof makeDraggable === 'function') makeDraggable(copilotWindow); } catch (e) {  }

    
    const cMin = copilotWindow.querySelector('.min');
    const cMax = copilotWindow.querySelector('.max');
    const cClose = copilotWindow.querySelector('.close');
    if (cMin) cMin.addEventListener('click', () => { copilotWindow.classList.add('hide-window'); setTimeout(() => { copilotWindow.style.display = 'none'; copilotWindow.classList.remove('hide-window'); const taskIcon = document.getElementById((copilotWindow.id||'').replace('-window','-task')); if (taskIcon) updateTaskbarIconState(taskIcon, false); }, 400); });
    let copilotMaximized = false;
    let copilotPrevPos = { top: copilotWindow.style.top || '150px', left: copilotWindow.style.left || '150px', width: copilotWindow.style.width || '900px', height: copilotWindow.style.height || '600px' };
    if (cMax) cMax.addEventListener('click', () => {
      if (!copilotMaximized) {
        copilotPrevPos = { top: copilotWindow.style.top, left: copilotWindow.style.left, width: copilotWindow.style.width, height: copilotWindow.style.height };
        copilotWindow.style.top = '0'; copilotWindow.style.left = '0'; copilotWindow.style.width = '100%'; copilotWindow.style.height = 'calc(100% - 70px)'; copilotWindow.style.resize = 'none'; copilotMaximized = true; taskbar.classList.add('fullscreen');
      } else {
        copilotWindow.style.top = copilotPrevPos.top; copilotWindow.style.left = copilotPrevPos.left; copilotWindow.style.width = copilotPrevPos.width; copilotWindow.style.height = copilotPrevPos.height; copilotWindow.style.resize = 'both'; copilotMaximized = false; taskbar.classList.remove('fullscreen');
      }
    });
    if (cClose) cClose.addEventListener('click', () => { copilotWindow.classList.add('hide-window'); setTimeout(() => { copilotWindow.style.display = 'none'; copilotWindow.classList.remove('hide-window'); const tb = document.getElementById('copilot-task'); if (tb && tb.dataset.pinned !== 'true') tb.remove(); }, 400); });
  }
  if (copilotStart) copilotStart.addEventListener('click', openCopilot);
  if (copilotIcon) copilotIcon.addEventListener('dblclick', openCopilot);
  if (copilotWindow) {
    const cClose = copilotWindow.querySelector('.close');
    if (cClose) cClose.addEventListener('click', () => {
      copilotWindow.classList.add('hide-window');
      setTimeout(() => { copilotWindow.style.display = 'none'; copilotWindow.classList.remove('hide-window'); const tb = document.getElementById('copilot-task'); if (tb && tb.dataset.pinned !== 'true') tb.remove(); }, 400);
    });
  }

  
  function resizeEdgeIframe() {
    const edgeWin = document.getElementById('edge-window');
    const edgeIframe = document.getElementById('edge-iframe');
    if (!edgeWin || !edgeIframe) return;
    const content = edgeWin.querySelector('.window-content');
    const toolbar = content ? content.querySelector('.edge-toolbar') : null;
    const toolbarH = toolbar ? toolbar.offsetHeight : 0;
    const h = Math.max(200, (content.clientHeight - toolbarH));
    edgeIframe.style.height = h + 'px';
  }
  window.addEventListener('resize', resizeEdgeIframe);
  setTimeout(resizeEdgeIframe, 200);

  
  const startFocusBtn = document.getElementById('start-focus-btn');
  const focusDuration = document.getElementById('focus-duration');
  const hideTaskbarIconsCb = document.getElementById('hide-taskbar-icons');
  const enableDndFocusCb = document.getElementById('enable-dnd-focus');
  let focusTimeout = null;
  if (startFocusBtn) {
    startFocusBtn.addEventListener('click', () => {
      const mins = parseInt(focusDuration?.value || 25, 10);
      const ms = Math.max(1, mins) * 60 * 1000;
      if (enableDndFocusCb && enableDndFocusCb.checked) window.suppressConsoleToasts = true;
      if (hideTaskbarIconsCb && hideTaskbarIconsCb.checked) document.body.classList.add('focus-hide-taskbar');
      showToast(`Focus session started for ${mins} minute(s)`);
      clearTimeout(focusTimeout);
      focusTimeout = setTimeout(() => {
        window.suppressConsoleToasts = false;
        document.body.classList.remove('focus-hide-taskbar');
        showToast('Focus session ended');
      }, ms);
    });
  }

  const focusMore = document.getElementById('focus-more');
  if (focusMore) focusMore.addEventListener('click', () => window.open('https://support.microsoft.com/en-us/windows/focus-stay-on-task-without-distractions-in-windows-cbcc9ddb-8164-43fa-8919-b9a2af072382', '_blank'));

  
  const screenWait = document.getElementById('screen-wait-select');
  const sleepWait = document.getElementById('sleep-wait-select');
  const powerRecToggle = document.getElementById('power-recommendations-toggle');
  const powerRecDiv = document.getElementById('power-recommendations');
  const showBatteryPercentCb = document.getElementById('show-battery-percent');
  const powerSaverToggle = document.getElementById('power-saver-options-toggle');
  const powerSaverOptions = document.getElementById('power-saver-options');
  const ultraPowerCb = document.getElementById('ultra-power');

  const waitOptions = ['1 minute','2 minutes','3 minutes (recommended)','5 minutes','10 minutes','15 minutes','20 minutes','25 minutes','30 minutes','45 minutes','1 hour','2 hours','3 hours','4 hours','5 hours','Never'];
  function populateWait(sel) {
    if (!sel) return;
    sel.innerHTML = '';
    waitOptions.forEach(opt => { const o = document.createElement('option'); o.textContent = opt; sel.appendChild(o); });
  }
  populateWait(screenWait);
  populateWait(sleepWait);

  const recommendations = [
    {id:'dark-mode', text:'Enable dark mode', fixed:false},
    {id:'reduce-brightness', text:'Set screen brightness to energy-efficient level', fixed:false},
    {id:'sleep-3', text:'Put device to sleep after 3 minutes', fixed:false},
    {id:'turn-off-screen-3', text:'Turn off screen after 3 minutes', fixed:false},
    {id:'disable-screensaver', text:'Disable screensaver', fixed:false}
  ];

  function renderPowerRecommendations() {
    if (!powerRecDiv) return;
    powerRecDiv.innerHTML = '';
    recommendations.forEach(r => {
      const item = document.createElement('div');
      item.style.display = 'flex'; item.style.justifyContent = 'space-between'; item.style.alignItems = 'center'; item.style.marginBottom = '6px';
      const left = document.createElement('div');
      left.innerHTML = `${r.fixed ? '' : '<strong>!</strong> '} ${r.text}`;
      const btn = document.createElement('button'); btn.textContent = r.fixed ? 'Fixed' : 'Fix';
      btn.disabled = r.fixed;
      btn.addEventListener('click', () => { r.fixed = true; btn.textContent = 'Fixed'; btn.disabled = true; renderPowerRecommendations(); showToast(`Recommendation applied: ${r.text}`); });
      item.appendChild(left); item.appendChild(btn);
      powerRecDiv.appendChild(item);
    });
  }
  if (powerRecToggle && powerRecDiv) {
    powerRecToggle.addEventListener('click', () => {
      powerRecDiv.style.display = powerRecDiv.style.display === 'block' ? 'none' : 'block';
      renderPowerRecommendations();
    });
  }

  if (powerSaverToggle && powerSaverOptions) {
    powerSaverToggle.addEventListener('click', () => {
      powerSaverOptions.style.display = powerSaverOptions.style.display === 'block' ? 'none' : 'block';
    });
  }

  if (ultraPowerCb) {
    ultraPowerCb.addEventListener('change', (e) => {
      document.body.classList.toggle('ultra-power', e.target.checked);
      document.body.classList.toggle('dark-mode', e.target.checked);
      if (e.target.checked) {
        
        showToast('Ultra power saving enabled');
      } else showToast('Ultra power saving disabled');
    });
  }

  
  const realBatteryPercentEl = document.getElementById('real-battery-percent');
  const batteryEmojiStatus = document.getElementById('battery-emoji-status');
  if (navigator.getBattery) {
    navigator.getBattery().then(b => {
      function update() {
        const p = Math.round(b.level * 100) + '%';
        if (realBatteryPercentEl) realBatteryPercentEl.textContent = p;
        if (batteryIcon && document.getElementById('show-battery-percent')?.checked) batteryIcon.textContent = p;
        if (batteryEmojiStatus) batteryEmojiStatus.textContent = (b.charging ? 'Charging ⚡' : 'On battery');
      }
      b.addEventListener('levelchange', update);
      b.addEventListener('chargingchange', update);
      update();
    });
  }

  if (showBatteryPercentCb) {
    showBatteryPercentCb.addEventListener('change', (e) => {
      if (e.target.checked) {
        if (realBatteryPercentEl) batteryIcon.textContent = realBatteryPercentEl.textContent || '100%';
        else batteryIcon.textContent = '100%';
      } else {
        batteryIcon.textContent = '🔋';
      }
    });
  }

  
  const storageBar = document.getElementById('storage-bar');
  const storageFree = document.getElementById('storage-free');
  const storageSystem = document.getElementById('storage-system');
  const storageApps = document.getElementById('storage-apps');
  const cleanTempBtn = document.getElementById('clean-temp-btn');
  const autoCleanTemp = document.getElementById('auto-clean-temp');
  let storage = { total:200, system:17, apps:3 };
  function refreshStorage() {
    const used = storage.system + storage.apps;
    const free = Math.max(0, storage.total - used);
    if (storageBar) storageBar.style.width = ((used / storage.total) * 100) + '%';
    if (storageFree) storageFree.textContent = free + ' GB';
    if (storageSystem) storageSystem.textContent = storage.system + ' GB';
    if (storageApps) storageApps.textContent = storage.apps + ' GB';
  }
  refreshStorage();

  if (cleanTempBtn) {
    cleanTempBtn.addEventListener('click', () => {
      
      const freed = Math.floor(Math.random() * 5) + 2;
      storage.apps = Math.max(0, storage.apps - freed);
      refreshStorage();
      showToast(`Cleaned ${freed} GB of temporary files`);
    });
  }
  if (autoCleanTemp && autoCleanTemp.checked) {
    
    setInterval(() => { if (autoCleanTemp.checked) { storage.apps = Math.max(0, storage.apps - 1); refreshStorage(); } }, 1000 * 60 * 60);
  }

  
  if (edgeIcon) {
    edgeIcon.addEventListener('dblclick', () => {
      openEdge();
    });
  } else {
    console.warn('edgeIcon not found');
  }

  
  if (settingsIcon) {
    settingsIcon.addEventListener('dblclick', () => {
      openSettings();
    });
  } else {
    console.warn('settingsIcon not found');
  }

  
  if (edgeStart) {
    edgeStart.addEventListener('click', () => {
      startMenu.style.display = 'none';
      startButton.classList.remove('active');
      openEdge();
    });
  } else {
    console.warn('edgeStart not found');
  }

  if (settingsStart) {
    settingsStart.addEventListener('click', () => {
      startMenu.style.display = 'none';
      startButton.classList.remove('active');
      openSettings();
    });
  } else {
    console.warn('settingsStart not found');
  }

  if (aboutStart) {
    aboutStart.addEventListener('click', () => {
      startMenu.style.display = 'none';
      startButton.classList.remove('active');
      aboutWindow.style.display = 'block';
      aboutWindow.classList.add('show-window');
    });
  } else {
    console.warn('aboutStart not found');
  }

  
  function openEdge() {
    if (!edgeWindow) return console.warn('edgeWindow element missing');
    edgeWindow.style.display = 'block';
    startButton.classList.remove('active');
    edgeWindow.classList.add('show-window');

    if (!document.getElementById('edge-task')) {
      if (InGameJolt) {
        fetch(`https//api.gamejolt.com/api/game/v1_2/trophies/add-achieved/?game_id=${gameID}&username=${username}&user_token=${userToken}&trophy_id=296793`);
      }
      const btn = document.createElement('span');
      btn.id = 'edge-task';
      btn.dataset.pinned = 'false';
      btn.dataset.customClick = 'true';
      btn.textContent = '🌐';
      btn.style.marginRight = '4px';
      btn.style.marginLeft = '4px';
      btn.style.marginTop = '12px';
      btn.style.marginBottom = '12px';
      btn.style.cursor = 'pointer';
      btn.style.borderRadius = '3px';
      btn.addEventListener('mouseenter', () => {
        btn.style.background = 'rgba(255,255,255,0.2)';
        btn.style.backdropFilter = 'blur(10px)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = '';
        btn.style.backdropFilter = '';
      });
      taskbarPrograms.appendChild(btn);
      btn.addEventListener('click', () => {
        if (edgeWindow.style.display === 'block') {
          edgeWindow.classList.add('hide-window');
          setTimeout(() => {
            if (edgeMaximized) {
              edgeWindow.style.top = edgePrevPos.top;
              edgeWindow.style.left = edgePrevPos.left;
              edgeWindow.style.width = edgePrevPos.width;
              edgeWindow.style.height = edgePrevPos.height;
              edgeWindow.style.resize = 'both';
              taskbar.classList.remove('fullscreen');
            }
            edgeWindow.style.display = 'none';
            edgeWindow.classList.remove('hide-window');
          }, 500);
        } else {
          edgeWindow.style.display = 'block';
          setTimeout(() => {
            edgeWindow.classList.add('show-window');
            if (edgeMaximized) {
              edgeWindow.style.top = '0';
              edgeWindow.style.left = '0';
              edgeWindow.style.width = '100%';
              edgeWindow.style.height = 'calc(100% - 70px)';
              edgeWindow.style.resize = 'none';
              taskbar.classList.add('fullscreen');
            }
            try { if (typeof resizeEdgeIframe === 'function') resizeEdgeIframe(); } catch (e) {}
          }, 10);
        }
      });
    }
  }

  function toggleFullscreenTaskbar(isFullscreen) {
    const taskbar = document.getElementById('taskbar');
    if (isFullscreen) {
      taskbar.classList.add('fullscreen');
    } else {
      taskbar.classList.remove('fullscreen');
    }
  }

  const contextMenu = document.getElementById('settings-context');
  const pinTaskbar = document.getElementById('pin-taskbar');
  const closeWindow = document.getElementById('close-window');
  let currentContextWindow = null;

  function closeContextWindow() {
    if (!currentContextWindow) return;
    currentContextWindow.classList.add('hide-window');
    setTimeout(() => {
      const isSettings = currentContextWindow.id === 'settings-window';
      const isAbout = currentContextWindow.id === 'about-window';
      if (isSettings && maximized) {
        settingsWindow.style.top = prevPos.top;
        settingsWindow.style.left = prevPos.left;
        settingsWindow.style.width = prevPos.width;
        settingsWindow.style.height = prevPos.height;
        settingsWindow.style.resize = 'both';
        taskbar.classList.remove('fullscreen');
        maximized = false;
      } else if (isAbout && aboutMaximized) {
        aboutWindow.style.top = aboutPrevPos.top;
        aboutWindow.style.left = aboutPrevPos.left;
        aboutWindow.style.width = aboutPrevPos.width;
        aboutWindow.style.height = aboutPrevPos.height;
        aboutWindow.style.resize = 'both';
        taskbar.classList.remove('fullscreen');
        aboutMaximized = false;
      }
      currentContextWindow.style.display = 'none';
      currentContextWindow.classList.remove('hide-window');
      const taskIcon = document.getElementById(isSettings ? 'settings-task' : 'about-task');
      if (taskIcon && taskIcon.dataset.pinned !== 'true') taskIcon.remove();
    }, 500);
  }

  if (settingsWindow && contextMenu) {
    settingsWindow.addEventListener('contextmenu', (e) => {
      if (maximized) return;
      currentContextWindow = settingsWindow;
      e.preventDefault();
      
      const x = e.clientX;
      const y = e.clientY;
      
      contextMenu.style.display = 'block';
      contextMenu.classList.add('show');
      const rect = contextMenu.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let left = x;
      let top = y;
      if (left + rect.width > vw) left = Math.max(8, vw - rect.width - 8);
      if (top + rect.height > vh) top = Math.max(8, vh - rect.height - 8);
      contextMenu.style.left = left + 'px';
      contextMenu.style.top = top + 'px';
    });
  }

  if (aboutWindow && contextMenu) {
    aboutWindow.addEventListener('contextmenu', (e) => {
      if (aboutMaximized) return;
      currentContextWindow = aboutWindow;
      e.preventDefault();
      
      const x = e.clientX;
      const y = e.clientY;
      
      contextMenu.style.display = 'block';
      contextMenu.classList.add('show');
      const rect = contextMenu.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let left = x;
      let top = y;
      if (left + rect.width > vw) left = Math.max(8, vw - rect.width - 8);
      if (top + rect.height > vh) top = Math.max(8, vh - rect.height - 8);
      contextMenu.style.left = left + 'px';
      contextMenu.style.top = top + 'px';
    });
  }

  document.addEventListener('click', (e) => {
    if (!contextMenu.contains(e.target)) {
      contextMenu.classList.remove('show');
      contextMenu.style.display = 'none';
    }
  });

  if (pinTaskbar) {
    pinTaskbar.addEventListener('click', () => {
      if (contextMenu) {
        contextMenu.classList.remove('show');
        contextMenu.style.display = 'none';
      }
    });
  }

  if (closeWindow) {
    closeWindow.addEventListener('click', () => {
      closeContextWindow();
      if (contextMenu) {
        contextMenu.classList.remove('show');
        contextMenu.style.display = 'none';
      }
    });
  }

  aboutTabs = document.querySelectorAll('#about-window .tabs button');
  aboutIntro = document.getElementById('about-intro');
  aboutUpdates = document.getElementById('about-updates');
  aboutComing = document.getElementById('about-coming');

  if (aboutIcon) {
    aboutIcon.addEventListener('dblclick', () => {
      openAbout();
  });
  } else {
    console.warn('aboutIcon not found');
  }

  function openAbout() {
    if (InGameJolt) {
      fetch(`https//api.gamejolt.com/api/game/v1_2/trophies/add-achieved/?game_id=${gameID}&username=${username}&user_token=${userToken}&trophy_id=296791`);
    }
    aboutWindow.style.display = 'block';
      aboutWindow.classList.add('show-window');
    if (!document.getElementById('about-task')) {
      const btn = document.createElement('span');
      btn.id = 'about-task';
      btn.textContent = 'ℹ️';
      btn.dataset.customClick = 'true';
      btn.style.marginRight = '4px';
      btn.style.marginLeft = '4px';
      btn.style.marginTop = '12px';
      btn.style.marginBottom = '12px';
      btn.style.cursor = 'pointer';
      btn.style.borderRadius = '3px';
      btn.addEventListener('mouseenter', () => {
        btn.style.background = 'rgba(255,255,255,0.2)';
        btn.style.backdropFilter = 'blur(10px)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = '';
        btn.style.backdropFilter = '';
      });
      taskbarPrograms.appendChild(btn);
      btn.addEventListener('click', () => handleTaskClick(btn));
    }
  }

  aboutTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const aboutContact = document.getElementById('about-contact');
      const aboutDevelopers = document.getElementById('about-developers');
      
      aboutIntro.style.display = tab.dataset.tab === 'intro' ? 'block' : 'none';
      aboutUpdates.style.display = tab.dataset.tab === 'updates' ? 'block' : 'none';
      aboutComing.style.display = tab.dataset.tab === 'coming' ? 'block' : 'none';
      aboutContact.style.display = tab.dataset.tab === 'contact' ? 'block' : 'none';
      
      
      if (tab.dataset.tab === 'developers') {
        if (!sessionStorage.getItem('developerAccess')) {
          const password = prompt('Enter developer password:');
          const correctPassword = 'Dev#Mat2026!Pr0j'; 
          
          if (password === correctPassword) {
            sessionStorage.setItem('developerAccess', 'true');
            aboutDevelopers.style.display = 'block';
            alert('Access granted for this session!');
          } else if (password !== null) {
            alert('Incorrect password!');
            tab.blur();
            aboutTabs[0].click(); 
          }
        } else {
          aboutDevelopers.style.display = 'block';
        }
      } else {
        aboutDevelopers.style.display = 'none';
      }
    });
  });

  const wallpaperOptions = document.querySelectorAll('.wallpaper-option');

    const savedWallpaper = localStorage.getItem('wallpaper');
    if (savedWallpaper) {
      desktop.style.background = '';
      desktop.style.backgroundImage = `url(${savedWallpaper})`;
      desktop.style.backgroundSize = 'cover';
      desktop.style.backgroundPosition = 'center';
      desktop.style.backgroundRepeat = 'no-repeat';
    }
    wallpaperOptions.forEach(option => {
      option.addEventListener('click', () => {
        const selected = option.getAttribute('src');
        desktop.style.background = '';
        desktop.style.backgroundImage = `url(${selected})`;
        desktop.style.backgroundSize = 'cover';
        desktop.style.backgroundPosition = 'center';
        desktop.style.backgroundRepeat = 'no-repeat';
        localStorage.setItem('wallpaper', selected);
      });
    });

    
    const sendMessageBtn = document.getElementById('send-message-btn');
    const contactUsername = document.getElementById('contact-username');
    const contactMessage = document.getElementById('contact-message');
    const knownBugsList = document.getElementById('known-bugs-list');

    
    function loadBugsFromStorage() {
      const savedBugs = localStorage.getItem('reportedBugs');
      if (savedBugs) {
        const bugs = JSON.parse(savedBugs);
        knownBugsList.innerHTML = '';
        if (bugs.length > 0) {
          bugs.forEach((bug, index) => {
            const bugItem = document.createElement('li');
            bugItem.style.padding = '12px';
            bugItem.style.background = bug.status === 'completed' ? '#d4edda' : bug.status === 'planned' ? '#fff3cd' : bug.status === 'in-progress' ? '#cfe2ff' : '#f0f0f0';
            bugItem.style.margin = '5px 0';
            bugItem.style.borderRadius = '4px';
            bugItem.style.borderLeft = '3px solid var(--accent-color)';
            bugItem.style.display = 'flex';
            bugItem.style.justifyContent = 'space-between';
            bugItem.style.alignItems = 'center';
            bugItem.style.flexWrap = 'wrap';

            const textDiv = document.createElement('div');
            textDiv.style.flex = '1';
            textDiv.style.marginRight = '10px';
            
            let statusBadge = '';
            if (bug.status === 'completed') statusBadge = ' ✅ Completed';
            else if (bug.status === 'planned') statusBadge = ' 📋 Planned';
            else if (bug.status === 'in-progress') statusBadge = ' ⚙️ In Progress';
            
            textDiv.innerHTML = `<strong>${bug.username}:</strong> ${bug.message}${statusBadge}`;
            bugItem.appendChild(textDiv);

            const buttonsDiv = document.createElement('div');
            buttonsDiv.style.display = 'flex';
            buttonsDiv.style.gap = '5px';
            buttonsDiv.style.flexWrap = 'wrap';

            
            const doneBtn = document.createElement('button');
            doneBtn.textContent = '✓ Done';
            doneBtn.style.padding = '4px 8px';
            doneBtn.style.background = '#28a745';
            doneBtn.style.color = 'white';
            doneBtn.style.border = 'none';
            doneBtn.style.borderRadius = '3px';
            doneBtn.style.cursor = 'pointer';
            doneBtn.style.fontSize = '12px';
            doneBtn.addEventListener('click', () => {
              bugs[index].status = 'completed';
              localStorage.setItem('reportedBugs', JSON.stringify(bugs));
              loadBugsFromStorage();
            });
            buttonsDiv.appendChild(doneBtn);

            
            const plannedBtn = document.createElement('button');
            plannedBtn.textContent = '📋 Planned';
            plannedBtn.style.padding = '4px 8px';
            plannedBtn.style.background = '#ffc107';
            plannedBtn.style.color = '#000';
            plannedBtn.style.border = 'none';
            plannedBtn.style.borderRadius = '3px';
            plannedBtn.style.cursor = 'pointer';
            plannedBtn.style.fontSize = '12px';
            plannedBtn.addEventListener('click', () => {
              bugs[index].status = 'planned';
              localStorage.setItem('reportedBugs', JSON.stringify(bugs));
              loadBugsFromStorage();
            });
            buttonsDiv.appendChild(plannedBtn);

            
            const inProgressBtn = document.createElement('button');
            inProgressBtn.textContent = '⚙️ In Progress';
            inProgressBtn.style.padding = '4px 8px';
            inProgressBtn.style.background = '#17a2b8';
            inProgressBtn.style.color = 'white';
            inProgressBtn.style.border = 'none';
            inProgressBtn.style.borderRadius = '3px';
            inProgressBtn.style.cursor = 'pointer';
            inProgressBtn.style.fontSize = '12px';
            inProgressBtn.addEventListener('click', () => {
              bugs[index].status = 'in-progress';
              localStorage.setItem('reportedBugs', JSON.stringify(bugs));
              loadBugsFromStorage();
            });
            buttonsDiv.appendChild(inProgressBtn);

            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑️ Delete';
            deleteBtn.style.padding = '4px 8px';
            deleteBtn.style.background = '#dc3545';
            deleteBtn.style.color = 'white';
            deleteBtn.style.border = 'none';
            deleteBtn.style.borderRadius = '3px';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.style.fontSize = '12px';
            deleteBtn.addEventListener('click', () => {
              bugs.splice(index, 1);
              localStorage.setItem('reportedBugs', JSON.stringify(bugs));
              loadBugsFromStorage();
            });
            buttonsDiv.appendChild(deleteBtn);

            bugItem.appendChild(buttonsDiv);
            knownBugsList.appendChild(bugItem);
          });
        }
      }
    }

    
    loadBugsFromStorage();

    sendMessageBtn.addEventListener('click', () => {
      const username = contactUsername.value.trim();
      const message = contactMessage.value.trim();

      if (!username || !message) {
        alert('Please fill in both fields!');
        return;
      }

      
      let bugs = [];
      const savedBugs = localStorage.getItem('reportedBugs');
      if (savedBugs) {
        bugs = JSON.parse(savedBugs);
      }

      if (InGameJolt) {
        fetch(`https//api.gamejolt.com/api/game/v1_2/trophies/add-achieved/?game_id=${gameID}&username=${username}&user_token=${userToken}&trophy_id=296792`);
      }

      
      bugs.push({ username, message, timestamp: new Date().toISOString(), status: 'new' });
      localStorage.setItem('reportedBugs', JSON.stringify(bugs));

      
      loadBugsFromStorage();

      
      contactUsername.value = '';
      contactMessage.value = '';
      alert('Your messange has been send to Matviy_7878!');
    });

function toggleMenu(id) {
    const menu = document.getElementById(id);

    if (!menu) {
      console.error('Menu element not found:', id);
      return;
    }

    if (menu.classList.contains("show")) {
      menu.classList.remove("show");
      menu.classList.add("hide");
      menu.addEventListener("animationend", () => {
        if (menu.classList.contains("hide")) {
          menu.style.display = "none";
        }
      }, { once: true });
    } else {
      menu.style.display = "block";
      menu.classList.remove("hide");
      menu.classList.add("show");
    }
  }


  const systemIconsBtn = document.getElementById("system-icons");
  if (systemIconsBtn) {
    
    systemIconsBtn.addEventListener('click', (e) => {
      toggleMenu("popupMenu");
      if (InGameJolt) {
        fetch(`https//api.gamejolt.com/api/game/v1_2/trophies/add-achieved/?game_id=${gameID}&username=${username}&user_token=${userToken}&trophy_id=296794`);
      }
      e.stopPropagation(); 
    });
    
    
    const trayItems = systemIconsBtn.querySelectorAll('.tray, #clock');
    trayItems.forEach(item => {
      item.addEventListener('click', (e) => {
        toggleMenu("popupMenu");
        if (InGameJolt) {
          fetch(`https//api.gamejolt.com/api/game/v1_2/trophies/add-achieved/?game_id=${gameID}&username=${username}&user_token=${userToken}&trophy_id=296794`);
        }
        e.stopPropagation();
      });
    });
  } else {
    console.warn('system-icons element not found');
  }

  function openApp() {
    const win = document.getElementById("about-window");
    win.style.display = "block";
  }

  let wifiEnabled = true;
  let btEnabled = false;
  let airplane = false;
  let saver = false;
  let night = false;
  let hotspot = false;

  
  const wifiTurnBtn = document.getElementById("wifi-turn");

  
  if (wifiTurnBtn) {
    wifiTurnBtn.classList.add('active');
    wifiTurnBtn.onclick = () => {
      wifiEnabled = !wifiEnabled;
      const status = wifiTurnBtn.querySelector('.status');
      if (wifiEnabled) {
        wifiTurnBtn.classList.add('active');
        status.textContent = 'ON';
      } else {
        wifiTurnBtn.classList.remove('active');
        status.textContent = 'OFF';
      }
    };
  }

  const btToggleBtn = document.getElementById("btToggle");
  if (btToggleBtn) {
    btToggleBtn.onclick = () => {
      btEnabled = !btEnabled;
      const status = btToggleBtn.querySelector('.status');
      if (btEnabled) {
        btToggleBtn.classList.add('active');
        status.textContent = 'ON';
      } else {
        btToggleBtn.classList.remove('active');
        status.textContent = 'OFF';
      }
    };
  }

  
  const airToggleBtn = document.getElementById("airToggle");
  if (airToggleBtn) {
    airToggleBtn.onclick = () => {
      airplane = !airplane;
      const status = airToggleBtn.querySelector('.status');
      if (airplane) {
        airToggleBtn.classList.add('active');
        status.textContent = 'ON';
        wifiEnabled = false;
        if (wifiTurnBtn) {
          wifiTurnBtn.classList.remove('active');
          const wifiStatus = wifiTurnBtn.querySelector('.status');
          if (wifiStatus) wifiStatus.textContent = 'OFF';
        }
      } else {
        airToggleBtn.classList.remove('active');
        status.textContent = 'OFF';
      }
    };
  }

  
  const powerToggleBtn = document.getElementById("powerToggle");
  if (powerToggleBtn) {
    powerToggleBtn.onclick = () => {
      saver = !saver;
      const status = powerToggleBtn.querySelector('.status');
      if (saver) {
        powerToggleBtn.classList.add('active');
        status.textContent = 'ON';
        document.body.style.filter = "brightness(80%)";
        document.body.style.transition = "filter 0.3s";
      } else {
        powerToggleBtn.classList.remove('active');
        status.textContent = 'OFF';
        document.body.style.filter = "brightness(100%)";
      }
    };
  }

  
  const nightToggleBtn = document.getElementById("nightToggle");
  if (nightToggleBtn) {
    nightToggleBtn.onclick = () => {
      night = !night;
      const status = nightToggleBtn.querySelector('.status');
      if (night) {
        nightToggleBtn.classList.add('active');
        status.textContent = 'ON';
        document.body.style.backgroundColor = "#222";
      } else {
        nightToggleBtn.classList.remove('active');
        status.textContent = 'OFF';
        document.body.style.backgroundColor = "";
      }
    };
  }

  
  const hotspotToggleBtn = document.getElementById("hotspotToggle");
  if (hotspotToggleBtn) {
    hotspotToggleBtn.onclick = () => {
      hotspot = !hotspot;
      const status = hotspotToggleBtn.querySelector('.status');
      if (hotspot) {
        hotspotToggleBtn.classList.add('active');
        status.textContent = 'ON';
      } else {
        hotspotToggleBtn.classList.remove('active');
        status.textContent = 'OFF';
      }
    };
  }

  
  const volumeSlider = document.getElementById("volume-slider");
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      if (gainNode) {
        const volume = e.target.value / 100;
        gainNode.gain.value = volume;
      }
    });
  }

  
  const brightnessSlider = document.getElementById("brightness-slider");
  if (brightnessSlider) {
    brightnessSlider.addEventListener('input', (e) => {
      const brightness = e.target.value;
      document.body.style.filter = `brightness(${brightness / 100})`;
    });
  }

  
  const settingsBtn = document.getElementById("settings-btn");
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      toggleMenu("popupMenu");
        if (InGameJolt) {
          fetch(`https//api.gamejolt.com/api/game/v1_2/trophies/add-achieved/?game_id=${gameID}&username=${username}&user_token=${userToken}&trophy_id=296794`);
        }
      openSettings();
    });
  }
});

function openAbout() {
  aboutWindow.style.display = 'block';
    aboutWindow.classList.add('show-window');
  if (!document.getElementById('about-task')) {
    const btn = document.createElement('span');
    btn.id = 'about-task';
    btn.textContent = 'ℹ️';
    btn.style.marginRight = '4px';
    btn.style.marginLeft = '4px';
    btn.style.marginTop = '12px';
    btn.style.marginBottom = '12px';
    btn.style.cursor = 'pointer';
    btn.style.borderRadius = '3px';
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(255,255,255,0.2)';
      btn.style.backdropFilter = 'blur(10px)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = '';
      btn.style.backdropFilter = '';
    });
      taskbarPrograms.appendChild(btn);
      btn.addEventListener('click', () => handleTaskClick(btn));
  }
}

function showWelcome() {
  document.getElementById("overlay").style.display = "flex";
}

function hideWelcome() {
  document.getElementById("overlay").style.display = "none";
}

function acceptWelcome() {
  openAbout();
  hideWelcome();
}

/* --- Additional features: Activation, Windows Meet, Desktops, Shift+Tab, Recycle Bin --- */

// Activation: count lines and validate product key against active_keys.json
async function initActivation() {
  const el = document.getElementById('build-lines');
  const statusEl = document.getElementById('activation-status');
  try {
    const files = ['index.html','script.js','style.css'];
    let total = 0;
    await Promise.all(files.map(async f => {
      try {
        const res = await fetch(f + '?_=' + Date.now());
        if (!res.ok) return;
        const text = await res.text();
        total += text.split('\n').length;
      } catch(e){}
    }));
    if (el) el.textContent = total;
  } catch (e) {
    if (el) el.textContent = 'N/A';
  }

  async function checkKey(key) {
    if (!key) return statusEl.textContent = 'No key entered.';
    try {
      const res = await fetch('active_keys.json?_=' + Date.now());
      if (!res.ok) {
        statusEl.style.color = 'green';
        statusEl.textContent = 'Windows activated.';
        return;
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.keys || []);
      if (list.includes(key.trim())) {
        statusEl.style.color = 'red';
        statusEl.textContent = 'Error: invalid key.';
      } else {
        statusEl.style.color = 'green';
        statusEl.textContent = 'Windows activated.';
      }
    } catch (e) {
      statusEl.style.color = 'green';
      statusEl.textContent = 'Windows activated.';
    }
  }

  const input = document.getElementById('product-key-input');
  if (input) {
    input.addEventListener('blur', () => checkKey(input.value));
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') checkKey(input.value); });
    setTimeout(() => checkKey(input.value), 500);
  }
}

window.addEventListener('load', () => setTimeout(initActivation, 800));

/* Windows Meet app */
function generateId(len=8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i=0;i<len;i++) out += chars[Math.floor(Math.random()*chars.length)];
  return out;
}

function initMeet() {
  const meetWindow = document.getElementById('meet-window');
  const meetStart = document.getElementById('meet-start');
  const meetUserEl = document.getElementById('meet-user');
  const profileNameEl = document.getElementById('meet-profile-name');
  const profileIdEl = document.getElementById('meet-profile-id');
  const chatsListEl = document.getElementById('chats-list');
  const chatBody = document.getElementById('chat-body');
  const chatHeader = document.getElementById('chat-header');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-msg');
  const attachBtn = document.getElementById('attach-file');
  const fileInput = document.getElementById('chat-file');
  const addFriendId = document.getElementById('add-friend-id');
  const addFriendBtn = document.getElementById('add-friend-btn');

  function saveChats(chats) { localStorage.setItem('WinMeetChats', JSON.stringify(chats || {})); }
  function loadChats() { try { return JSON.parse(localStorage.getItem('WinMeetChats')||'{}'); } catch(e){return{}} }

  let user = localStorage.getItem('WinMeetUser');
  let userId = localStorage.getItem('WinMeetID');
  if (!user || !userId) {
    user = prompt('Welcome to Windows Meet — enter your display name:');
    if (!user) user = 'User';
    userId = generateId();
    localStorage.setItem('WinMeetUser', user);
    localStorage.setItem('WinMeetID', userId);
    localStorage.setItem('WinMeetUser_' + userId, JSON.stringify({name:user,id:userId}));
  }

  if (meetUserEl) meetUserEl.textContent = user;
  if (profileNameEl) profileNameEl.textContent = user;
  if (profileIdEl) profileIdEl.textContent = 'ID: ' + userId;

  function renderChats() {
    const chats = loadChats();
    chatsListEl.innerHTML = '';
    Object.keys(chats).forEach(cid => {
      const c = chats[cid];
      const el = document.createElement('div');
      el.className = 'meet-chat-item';
      el.style.padding = '8px';
      el.style.borderRadius = '6px';
      el.style.cursor = 'pointer';
      el.textContent = (c.name || c.id) + (c.unread? (' ('+c.unread+')') : '');
      el.addEventListener('click', () => selectChat(cid));
      chatsListEl.appendChild(el);
    });
    if (!Object.keys(chats).length) {
      chatsListEl.innerHTML = '<div style="opacity:0.7; padding:8px;">No chats yet</div>';
    }
  }

  let currentChat = null;
  function selectChat(cid) {
    const chats = loadChats();
    currentChat = cid;
    const c = chats[cid];
    chatHeader.textContent = c ? (c.name || c.id) : 'No chat selected';
    if (!c || !c.messages || !c.messages.length) {
      chatBody.innerHTML = '<div style="opacity:0.6;">No messages yet</div>';
      return;
    }
    chatBody.innerHTML = '';
    c.messages.forEach(m => {
      const d = document.createElement('div');
      d.style.margin = '6px 0';
      d.textContent = (m.from === userId ? 'You: ' : (m.fromName || m.from) + ': ') + (m.type==='file' ? '[File] ' + (m.name||'file') : m.text);
      chatBody.appendChild(d);
    });
    c.unread = 0; saveChats(chats); renderChats();
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function sendMessage(text, opts={}) {
    if (!currentChat) return alert('Select a chat first');
    const chats = loadChats();
    const c = chats[currentChat] = chats[currentChat] || {id:currentChat, name:currentChat, messages:[]};
    const msg = { from: userId, fromName: user, text: text, time: Date.now(), type: opts.file ? 'file' : 'text', name: opts.name };
    c.messages.push(msg);
    saveChats(chats);
    selectChat(currentChat);
  }

  sendBtn.addEventListener('click', () => {
    const txt = chatInput.value.trim();
    if (!txt) return;
    sendMessage(txt);
    chatInput.value = '';
  });

  attachBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result;
      // store filename only to avoid huge data
      sendMessage('[file]', { file:true, name: f.name });
    };
    reader.readAsDataURL(f);
  });

  addFriendBtn.addEventListener('click', () => {
    const id = (addFriendId.value||'').trim();
    if (!id) return alert('Enter friend ID');
    const chats = loadChats();
    const cid = 'chat_' + generateId(6);
    chats[cid] = { id: cid, name: 'Friend ' + id, participants: [userId, id], messages: [] };
    // send automatic wave
    chats[cid].messages.push({from:userId, fromName:user, text:'👋', time:Date.now()});
    saveChats(chats);
    // if friend exists locally, also add to their store
    try {
      const other = JSON.parse(localStorage.getItem('WinMeetUser_' + id) || 'null');
      if (other && other.id === id) {
        // write to their chat store (if running in same browser)
        const otherChats = JSON.parse(localStorage.getItem('WinMeetChats_' + id) || '{}');
        const otherCid = 'chat_' + generateId(6);
        otherChats[otherCid] = { id: otherCid, name: user, participants: [id, userId], messages: [{from:userId, fromName:user, text:'👋', time:Date.now()}] };
        localStorage.setItem('WinMeetChats_' + id, JSON.stringify(otherChats));
      }
    } catch(e){}
    renderChats();
    addFriendId.value = '';
  });

  // create taskbar button when opening
  function ensureTaskbarButton() {
    if (!document.getElementById('meet-task')) {
      const btn = document.createElement('div'); btn.id = 'meet-task'; btn.className = 'task-icon'; btn.textContent = '📞'; btn.title = 'Windows Meet'; btn.dataset.pinned = 'true'; btn.dataset.customClick = 'true';
      btn.addEventListener('click', () => { try { handleTaskClick(btn); } catch(e) { const mw = document.getElementById('meet-window'); if (!mw) return; mw.style.display = mw.style.display === 'block' ? 'none' : 'block'; updateTaskbarIconState(btn, mw.style.display === 'block'); } });
      document.getElementById('taskbar-programs').appendChild(btn);
      try { if (window.enhanceTaskIcon) window.enhanceTaskIcon(btn); else enhanceTaskIcon(btn); } catch (e) { console.warn('enhanceTaskIcon not available yet', e); }
    }
  }

  if (meetStart) meetStart.addEventListener('click', () => { if (meetWindow) { meetWindow.style.display = 'block'; setTimeout(() => meetWindow.classList.add('show-window'), 10); ensureTaskbarButton(); renderChats(); const tb = document.getElementById('meet-task'); if (tb) updateTaskbarIconState(tb, true); } });
  if (document.getElementById('copilot-start')) {
    // open meet also from desktop icon if needed later
  }

  // initial render
  renderChats();
  // ensure taskbar button exists after first init
  try { ensureTaskbarButton(); } catch(e) {}
}

// Initialize Meet after load
// Windows Meet will be initialized on first open (lazy init)
document.getElementById('meet-start')?.addEventListener('click', () => {
  if (!window._meetInitialized) { try { initMeet(); } catch(e){console.warn('initMeet failed', e);} window._meetInitialized = true; }
  // close start menu when opening
  try { startMenu.classList.remove('show'); startButton.classList.remove('active'); startMenu.style.display = 'none'; } catch(e){}
  const mw = document.getElementById('meet-window'); if (mw) { mw.style.display = 'block'; setTimeout(() => mw.classList.add('show-window'), 10); const tb = document.getElementById('meet-task'); if (tb) updateTaskbarIconState(tb, true); }
});

/* Desktops switcher (simple UI only) */
function initDesktops() {
  const btn = document.getElementById('desktops-button');
  if (!btn) return;
  let desktops = JSON.parse(localStorage.getItem('WinDesktops') || 'null');
  if (!desktops) { desktops = { list: [{id:'d0', name:'Desktop 1'}], active: 0 }; localStorage.setItem('WinDesktops', JSON.stringify(desktops)); }

  function renderMenu() {
    let menu = document.getElementById('desktops-menu');
    if (!menu) {
      menu = document.createElement('div'); menu.id = 'desktops-menu'; menu.style.position='fixed'; menu.style.bottom='80px'; menu.style.left='20px'; menu.style.background='rgba(20,20,20,0.95)'; menu.style.color='white'; menu.style.padding='8px'; menu.style.borderRadius='8px'; menu.style.zIndex=20000; document.body.appendChild(menu);
    }
    menu.innerHTML = '';
    desktops.list.forEach((d,i)=>{
      const el = document.createElement('div'); el.style.padding='6px'; el.style.cursor='pointer'; el.textContent = d.name + (i===desktops.active?' (active)':''); el.addEventListener('click', ()=>{ desktops.active=i; localStorage.setItem('WinDesktops', JSON.stringify(desktops)); renderMenu(); }); menu.appendChild(el);
    });
    const add = document.createElement('button'); add.textContent='Add desktop'; add.addEventListener('click', ()=>{ desktops.list.push({id:'d'+Date.now(), name:'Desktop '+(desktops.list.length+1)}); localStorage.setItem('WinDesktops', JSON.stringify(desktops)); renderMenu(); }); menu.appendChild(add);
  }

  btn.addEventListener('click', (e)=>{ const existing = document.getElementById('desktops-menu'); if (existing) existing.remove(); else renderMenu(); });
}
window.addEventListener('load', initDesktops);

/* Shift+Tab window switcher (Alt+Tab-like but with Shift+Tab) */
(() => {
  let overlay = null;
  let windowsList = [];
  let idx = 0;
  function showOverlay() {
    if (!overlay) {
      overlay = document.createElement('div'); overlay.id='alt-tab-overlay'; overlay.style.position='fixed'; overlay.style.left='50%'; overlay.style.top='30%'; overlay.style.transform='translateX(-50%)'; overlay.style.background='rgba(20,20,20,0.9)'; overlay.style.color='white'; overlay.style.padding='12px'; overlay.style.borderRadius='8px'; overlay.style.display='flex'; overlay.style.gap='8px'; overlay.style.zIndex=30000; document.body.appendChild(overlay);
    }
    overlay.innerHTML='';
    windowsList = Array.from(document.querySelectorAll('.window')).filter(w=>w.style.display!=='none');
    windowsList.forEach((w,i)=>{
      const el = document.createElement('div'); el.style.padding='8px'; el.style.borderRadius='6px'; el.style.minWidth='140px'; el.style.textAlign='center'; el.style.cursor='default'; el.textContent = w.querySelector('.title-bar .title') ? w.querySelector('.title-bar .title').textContent : (w.id||'Window');
      if (i===idx) el.style.boxShadow='0 6px 18px rgba(0,120,215,0.6)';
      overlay.appendChild(el);
    });
    overlay.style.display='flex';
  }
  function hideOverlay() { if (overlay) overlay.style.display='none'; }

  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault(); showOverlay(); idx = (idx+1) % Math.max(1, windowsList.length || 1);
      // update highlight
      Array.from(overlay.children).forEach((c,i)=> c.style.boxShadow = i===idx ? '0 6px 18px rgba(0,120,215,0.6)' : '');
    }
  });
  document.addEventListener('keyup', (e)=>{
    if (e.key === 'Shift') {
      // choose selected
      if (windowsList && windowsList[idx]) {
        windowsList.forEach(w=>w.style.zIndex='1000');
        const chosen = windowsList[idx];
        chosen.style.display = 'block';
        chosen.classList.add('show-window');
        chosen.style.zIndex = '2000';
      }
      hideOverlay();
    }
  });
})();

/* Recycle Bin: drag desktop icons to bin and manage bin */
(() => {
  const bin = document.getElementById('recycle-bin');
  const desktopEl = document.getElementById('desktop');
  if (!bin || !desktopEl) return;
  let draggingItem = null;
  let dragEl = null;
  const storeKey = 'WinRecycleBin';
  function loadBin() { try { return JSON.parse(localStorage.getItem(storeKey)||'[]'); } catch(e){return[];} }
  function saveBin(arr) { localStorage.setItem(storeKey, JSON.stringify(arr)); }

  function onMouseDown(e) {
    const target = e.target.closest('.icon, .desktop-icon');
    if (!target) return;
    // do not allow dragging the recycle bin itself
    if (target.id === 'recycle-bin' || target.closest('#recycle-bin')) return;
    draggingItem = target;
    dragEl = target.cloneNode(true);
    dragEl.style.position='fixed'; dragEl.style.pointerEvents='none'; dragEl.style.opacity='0.8'; dragEl.style.left = e.clientX + 'px'; dragEl.style.top = e.clientY + 'px'; dragEl.style.transform='translate(-50%,-50%)'; dragEl.style.zIndex='40000'; document.body.appendChild(dragEl);
    function move(e2){ if (dragEl) { dragEl.style.left = e2.clientX + 'px'; dragEl.style.top = e2.clientY + 'px'; } }
    function up(e2){
      document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up);
      if (!dragEl) return;
      const r = bin.getBoundingClientRect();
      if (e2.clientX >= r.left && e2.clientX <= r.right && e2.clientY >= r.top && e2.clientY <= r.bottom) {
        // delete
        const arr = loadBin();
        const id = draggingItem.id || ('item_'+Date.now());
        const name = draggingItem.querySelector('span') ? draggingItem.querySelector('span').textContent : draggingItem.id || 'Item';
        arr.push({id,name,html:draggingItem.outerHTML});
        saveBin(arr);
        draggingItem.style.display = 'none';
        try { (window.showToast || function(m){ console.log(m); })("Moved to Recycle Bin: " + name); } catch(e){ console.log('toast', e); }
      }
      dragEl.remove(); dragEl = null; draggingItem = null;
    }
    document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
  }
  desktopEl.addEventListener('mousedown', onMouseDown);

  bin.addEventListener('dblclick', () => {
    // open recycle window
    const arr = loadBin();
    const win = document.createElement('div'); win.className='window'; win.dataset.temporary = 'true'; win.style.display='block'; win.style.width='600px'; win.style.height='400px'; win.style.left='120px'; win.style.top='80px'; win.style.position='fixed'; win.style.zIndex='50000';
    win.innerHTML = `<div class="title-bar"><span class="title">🗑️ Recycle Bin</span><div class="window-buttons"><button class="min">–</button><button class="max">□</button><button class="close">×</button></div></div><div class="window-content" style="padding:8px; overflow:auto; height:calc(100% - 40px);"><div style="display:flex; gap:8px; margin-bottom:8px;"><button id="bin-restore">Restore selected</button><button id="bin-delete">Delete selected</button><button id="bin-clear">Clear bin</button></div><div id="bin-list" style="overflow:auto; height:calc(100% - 56px);"></div></div>`;
    document.body.appendChild(win);
    // wire window controls for this dynamically created window
    try { if (typeof wireWindowControls === 'function') wireWindowControls(win); } catch(e) {}
    const binList = win.querySelector('#bin-list');
    function render() {
      const a = loadBin(); binList.innerHTML=''; if (!a.length) binList.innerHTML='<div style="opacity:0.7;">Bin is empty</div>';
      a.forEach((it,i)=>{
        const el = document.createElement('div'); el.style.padding='8px'; el.style.borderBottom='1px solid rgba(0,0,0,0.05)'; el.dataset.index=i; el.textContent = it.name; el.addEventListener('click', ()=>{ binList.querySelectorAll('div').forEach(d=>d.style.background=''); el.style.background='rgba(0,120,215,0.08)'; binList._selected = i; }); binList.appendChild(el);
      });
    }
    render();
    win.querySelector('.close').addEventListener('click', ()=> win.remove());
    win.querySelector('#bin-clear').addEventListener('click', ()=>{ if (!confirm('Clear recycle bin?')) return; saveBin([]); render(); });
    win.querySelector('#bin-delete').addEventListener('click', ()=>{
      const idx = binList._selected; if (idx==null) return alert('Select item');
      const a=loadBin(); const it=a[idx];
      if (!it) return alert('Item not found');
      if ((it.name||'').toLowerCase().includes('recycle') || (it.name||'').toLowerCase().includes('recycle bin')) { return alert('Cannot delete the Recycle Bin item.'); }
      if ((it.name||'').toLowerCase().includes('this pc') || (it.name||'').toLowerCase().includes('my computer')) { console.error('Desktop is not found'); setTimeout(() => window.open('RSoDindex.html', '_self'), 2000); return; }
      const removed = a.splice(idx,1)[0]; saveBin(a); render(); try { (window.showToast||function(m){console.log(m);})('Deleted: ' + (removed.name||'item')); } catch(e){}
    });
    win.querySelector('#bin-restore').addEventListener('click', ()=>{ const idx = binList._selected; if (idx==null) return alert('Select item'); const a=loadBin(); const it=a.splice(idx,1)[0]; saveBin(a); render(); // attempt to restore: if id matches this-pc then open file viewer
      if (it.name && it.name.toLowerCase().includes('this pc')) {
        const fwin = document.createElement('div'); fwin.className='window'; fwin.dataset.temporary = 'true'; fwin.style.display='block'; fwin.style.width='500px'; fwin.style.height='320px'; fwin.style.left='220px'; fwin.style.top='140px'; fwin.style.position='fixed'; fwin.style.zIndex='51000'; fwin.innerHTML = `<div class="title-bar"><span class="title">This PC - Recovered file</span><div class="window-buttons"><button class="min">–</button><button class="max">□</button><button class="close">×</button></div></div><div style="padding:12px;">You restored This PC. Opened recovery file:<pre style="background:#f6f6f6;padding:12px;border-radius:6px;color:#111;">This PC was converted to a recovery file. Replace this with your document.</pre></div>`; document.body.appendChild(fwin); try { if (typeof wireWindowControls === 'function') wireWindowControls(fwin); } catch(e){} }
    });
  });
})();
