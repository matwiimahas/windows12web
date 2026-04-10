// Блокує стандартне меню по всій сторінці
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  return false; // додатково гарантує блокування
});

// Блокує сам клік правою кнопкою
document.addEventListener('mousedown', (e) => {
  if (e.button === 2) { // 2 = права кнопка
    // allow right-clicks to proceed on elements that implement a custom context menu
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
      if (allow) return; // don't prevent — let the contextmenu event fire for our custom menu
    } catch (err) {
      // if anything goes wrong, fall back to preventing the default
    }
    e.preventDefault();
    return false;
  }
});

// Audio will be initialized on first user gesture (login) to satisfy autoplay policy

// Global variables
let audioContext;
let loader, loadingScreen, desktop, taskbar, taskbarPrograms, startButton, startMenu;
let settingsWindow, aboutWindow, edgeWindow, pcIcon, aboutIcon, edgeIcon, settingsIcon;
let edgeStart, settingsStart, aboutStart, sound, loginScreen, loginButton;
let wifiIcon, batteryIcon, clock, source, gainNode;
let accentColorInput, wallpaperInput, preview;
let aboutTabs, aboutIntro, aboutUpdates, aboutComing;

window.addEventListener('load', () => {
  // Ініціалізація audio context
  function initAudio() {
    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext && audioContext.state === 'suspended') {
          audioContext.resume().catch(e => console.warn('AudioContext resume failed:', e));
        }
      }

        // Trusted sites and iframe handling for Edge
        const trustedSites = [
          'www.wikipedia.org',
          'www.mozilla.org',
          'www.bing.com',
          'matviycoderdev.neocities.org'
        ];

        function isTrustedUrl(url) {
          try {
            const u = new URL(url.startsWith('http') ? url : 'https://' + url);
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
            const normalized = url.startsWith('http') ? url : 'https://' + url;

            // Adjust iframe sandbox: allow same-origin only for explicitly trusted host (Neocities site)
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

            // Attempt to load in iframe; if framing fails (e.g., X-Frame-Options), offer to open in new tab
            let loaded = false;
            const onload = () => {
              loaded = true;
              edgeIframe.removeEventListener('load', onload);
            };
            edgeIframe.addEventListener('load', onload);
            edgeIframe.src = normalized;

            // After timeout, if not loaded, offer to open externally
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

        // Ensure when Edge opens initially, load first trusted site
        const originalOpenEdge = openEdge;
        openEdge = function() {
          originalOpenEdge();
          if (edgeIframe && (!edgeIframe.src || edgeIframe.src === 'about:blank')) {
            const first = edgeSiteSelect?.value || '';
            if (first) loadEdgeUrl(first);
          }
        };
      
      // Try to load audio, but handle CORS errors gracefully
      if (sound) {
        sound.addEventListener('error', (e) => {
          console.warn('Audio file could not be loaded (CORS or file not found):', e);
        });
        
        // Only try to create audio source if we're not on file:// protocol
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

  initAudio(); // ініціалізувати на початку

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

  // Enable resize for windows initially
  settingsWindow.style.resize = 'both';
  aboutWindow.style.resize = 'both';

  // Запуск анімації шкали
  document.body.style.cursor = 'none';
  loader.classList.add('show-progress');

  // Після завершення шкали показати екран логону (потім — робочий стіл після логіну)
  setTimeout(() => {
    loadingScreen.style.display = 'none';
    document.body.style.cursor = 'default';
    // показати логон-екран
    if (loginScreen) loginScreen.style.display = 'flex';
  }, 8000);

  // Обробник кнопки логіну — показати робочий стіл і панель задач
  if (loginButton) {
    loginButton.addEventListener('click', async () => {
      loginScreen.classList.add('fade-out');
      setTimeout(async () => {
        if (loginScreen) loginScreen.style.display = 'none';
        
        // Initialize audio on first user gesture
        try { initAudio(); } catch(e) { console.warn('initAudio failed on gesture:', e); }

        // Resume audio context after user interaction
        if (audioContext && audioContext.state === 'suspended') {
          try {
            await audioContext.resume();
            showWelcome();
          } catch (e) {
            console.warn('Could not resume AudioContext:', e);
            showWelcome();
          }
        }
        
        // Try to play sound
        if (sound) {
          sound.play().catch(e => console.warn('Could not play sound:', e));
        }
        
        desktop.style.display = 'block';
        // Показати панель задач з анімацією знизу
        sound.play('./windows-12.mp3').catch(err => console.warn("Sound error:", err));
        taskbar.style.display = 'flex';
        taskbar.classList.remove('show-taskbar');
        // триггер перерендеру для повторного запуску анімації
        void taskbar.offsetWidth;
        taskbar.classList.add('show-taskbar');
        // ховати меню пуск при вході
        startMenu.style.display = 'none';
      }, 500);
    });
  }

  // Меню Пуск
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

  // Settings
  if (settingsStart) {
    settingsStart.addEventListener('click', () => {
      startMenu.style.display = (startMenu.style.display === 'none') ? 'block' : 'none';
      settingsWindow.style.display = 'none';
      openSettings();
    });
  }

  function openSettings() {
    settingsWindow.style.display = 'block';
    startButton.classList.remove('active');
    settingsWindow.classList.add('show-window');
    // Додати іконку в панель задач
    if (!document.getElementById('settings-task')) {
      const btn = document.createElement('span');
      btn.id = 'settings-task';
      btn.textContent = '⚙️';
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
        if (settingsWindow.style.display === 'block') {
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
          }, 500);
        } else {
          settingsWindow.style.display = 'block';
            setTimeout(() => {
              settingsWindow.classList.add('show-window');
              if (maximized) {
                settingsWindow.style.top = '0';
                settingsWindow.style.left = '0';
                settingsWindow.style.width = '100%';
                settingsWindow.style.height = 'calc(100% - 70px)';
                settingsWindow.style.resize = 'none';
                taskbar.classList.add('fullscreen');
              }
            }
        , 10);};
      });
    }
  }

  // Кнопки вікна
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
    }, 500);
  });

  let maximized = false;
  let prevPos = { top: '150px', left: '150px', width: '400px', height: 'auto' };

  maxBtn.addEventListener('click', () => {
    if (!maximized) {
      // зберегти попередні розміри
      prevPos = {
        top: settingsWindow.style.top,
        left: settingsWindow.style.left,
        width: settingsWindow.style.width,
        height: settingsWindow.style.height
      };
      settingsWindow.style.top = '0';
      settingsWindow.style.left = '0';
      settingsWindow.style.width = '100%';
      settingsWindow.style.height = 'calc(100% - 70px)'; // залишає місце для панелі задач
      settingsWindow.style.resize = 'none';   // ❌ Заборона resize у повному екрані
      //settingsWindow.classList.add('animate-maximize'); // ✅ анімація збільшення
      maximized = true;
      toggleFullscreenTaskbar(true);
    } else {
      // повернути попередні розміри
      settingsWindow.style.top = prevPos.top;
      settingsWindow.style.left = prevPos.left;
      settingsWindow.style.width = prevPos.width;
      settingsWindow.style.height = prevPos.height;
      settingsWindow.style.resize = 'both';   // дозволити resize знову
      //settingsWindow.classList.add('animate-restore'); // ✅ анімація зменшення
      maximized = false;
      toggleFullscreenTaskbar(false);
    }
  });

  // Рухоме вікно Settings
  const titleBar = settingsWindow.querySelector('.title-bar');
  let settingsDragging = false;
  let settingsStartX, settingsStartY;

  titleBar.addEventListener('mousedown', (e) => {
    // Restore from maximized if dragging starts
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
      // Check if cursor moved more than 10px
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

      // Only apply snap if there was actual dragging
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

      // Keep boundary checking
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

  // Рухоме вікно About
  const aboutTitleBar = aboutWindow.querySelector('.title-bar');
  let aboutDragging = false;
  let aboutStartX, aboutStartY;

  aboutTitleBar.addEventListener('mousedown', (e) => {
    // Restore from maximized if dragging starts
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
      // Check if cursor moved more than 10px
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

      // Only apply snap if there was actual dragging
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

      // Keep boundary checking
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
      if (taskIcon) taskIcon.remove();
    }, 500);
  });

  // About window buttons
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
      if (taskIcon) taskIcon.remove();
    }, 500);
  });

  // Edge window buttons & drag
  if (edgeWindow) {
    edgeWindow.style.resize = 'both';
    const edgeMinBtn = edgeWindow.querySelector('.min');
    const edgeMaxBtn = edgeWindow.querySelector('.max');
    const edgeCloseBtn = edgeWindow.querySelector('.close');

    let edgeMaximized = false;
    let edgePrevPos = { top: '150px', left: '150px', width: '600px', height: '400px' };

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
        if (taskIcon) taskIcon.remove();
      }, 500);
    });

    // Dragging
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

  // Wi-Fi (імітація: завжди підключено)
  wifiIcon.textContent = navigator.onLine ? "🛜" : "🚫";
  window.addEventListener('online', () => wifiIcon.textContent = "🛜");
  window.addEventListener('offline', () => wifiIcon.textContent = "🚫");

  // Battery API
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

  // Movement for edge icon
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

  // Movement for settings icon
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
        } else {
          showToast('Need 2 or more icons to create a group');
        }
      };
    }

    if (groupOverlayTimeout) clearTimeout(groupOverlayTimeout);
    groupOverlayTimeout = setTimeout(hideGroupFolder, 7000);
  }

  // Create a desktop folder (group) from selected icons
  function createGroupFromSelection(icons) {
    if (!icons || icons.length < 2) return;
    const name = prompt('Enter group name:', 'New group') || 'New group';

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

    // Custom right-click menu for folders
    folder.addEventListener('contextmenu', (ev) => {
      showFolderContextMenu(ev, folder);
    });

    clearSelection();

    // ============ ФУНКЦІЇ ДЛЯ РОБОТИ З ПАПКАМИ ============

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

      // Toolbar: icon size controller
      let iconSize = 40; // default
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
      
      // Кнопки вікна
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
      
      // Drag вікна
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
        
        // Знайти оригінальну іконку
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
    // Проверяем что клик не на иконке и левая кнопка мыши
    if (e.button !== 0) return; // не левая кнопка мыши
    
    // Если клик на иконке, выходим (не начинаем выделение)
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
      // Compute selection BEFORE hiding box
      const boxRect = selectionBox.getBoundingClientRect();
      // Re-query desktop items to ensure we have up-to-date positions
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
    // якщо меню відкрите і клік не по меню та не по кнопці Пуск
    if (startMenu.classList.contains('show') &&
        !startMenu.contains(e.target) &&
        e.target !== startButton) {
      startMenu.classList.remove('show');
      startButton.classList.remove('active'); // зняти підсвічування
      setTimeout(() => startMenu.style.display = 'none', 300);
    }
  });

  // Settings categories
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

  // Зміна головного кольору
  accentColorInput.addEventListener('input', (e) => {
    const color = e.target.value;
    document.documentElement.style.setProperty('--accent-color', color);
    preview.querySelector('.preview-taskbar').style.background = color;
  });

  // Зміна фону робочого столу
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
        preview.style.backgroundImage = `url(${ev.target.result})`; // оновлення прев’ю
      };
      reader.readAsDataURL(file);
    }
  });

  // Edge icon double click
  if (edgeIcon) {
    edgeIcon.addEventListener('dblclick', () => {
      openEdge();
    });
  } else {
    console.warn('edgeIcon not found');
  }

  // Settings icon double click
  if (settingsIcon) {
    settingsIcon.addEventListener('dblclick', () => {
      openSettings();
    });
  } else {
    console.warn('settingsIcon not found');
  }

  // Start menu apps
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

  // Edge window open function & taskbar integration
  function openEdge() {
    if (!edgeWindow) return console.warn('edgeWindow element missing');
    edgeWindow.style.display = 'block';
    startButton.classList.remove('active');
    edgeWindow.classList.add('show-window');

    if (!document.getElementById('edge-task')) {
      const btn = document.createElement('span');
      btn.id = 'edge-task';
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
      if (taskIcon) taskIcon.remove();
    }, 500);
  }

  // показати меню при правому кліку на Settings
  if (settingsWindow && contextMenu) {
    settingsWindow.addEventListener('contextmenu', (e) => {
      if (maximized) return;
      currentContextWindow = settingsWindow;
      e.preventDefault(); // блокує стандартне меню
      // use client coordinates and clamp inside viewport
      const x = e.clientX;
      const y = e.clientY;
      // ensure menu is visible to measure
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

  // показати меню при правому кліку на About
  if (aboutWindow && contextMenu) {
    aboutWindow.addEventListener('contextmenu', (e) => {
      if (aboutMaximized) return;
      currentContextWindow = aboutWindow;
      e.preventDefault(); // блокує стандартне меню
      // use client coordinates and clamp inside viewport
      const x = e.clientX;
      const y = e.clientY;
      // ensure menu is visible to measure
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

  // сховати меню при кліку поза ним
  document.addEventListener('click', (e) => {
    if (!contextMenu.contains(e.target)) {
      contextMenu.classList.remove('show');
      contextMenu.style.display = 'none';
    }
  });

  // дії меню
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

  // відкриття вікна
  if (aboutIcon) {
    aboutIcon.addEventListener('dblclick', () => {
      openAbout();
  });
  } else {
    console.warn('aboutIcon not found');
  }

  function openAbout() {
    aboutWindow.style.display = 'block';
      aboutWindow.classList.add('show-window');
    // Додати іконку в панель задач
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
      btn.addEventListener('click', () => {
        if (aboutWindow.style.display === 'block') {
          aboutWindow.classList.add('hide-window');
          setTimeout(() => {
            if (aboutMaximized) {
              aboutWindow.style.top = aboutPrevPos.top;
              aboutWindow.style.left = aboutPrevPos.left;
              aboutWindow.style.width = aboutPrevPos.width;
              aboutWindow.style.height = aboutPrevPos.height;
              aboutWindow.style.resize = 'both';
              taskbar.classList.remove('fullscreen');
            }
            aboutWindow.style.display = 'none';
            aboutWindow.classList.remove('hide-window');
          }, 500);
        } else {
          aboutWindow.style.display = 'block';
          setTimeout(() => {
            aboutWindow.classList.add('show-window');
            if (aboutMaximized) {
              aboutWindow.style.top = '0';
              aboutWindow.style.left = '0';
              aboutWindow.style.width = '100%';
              aboutWindow.style.height = 'calc(100% - 70px)';
              aboutWindow.style.resize = 'none';
              taskbar.classList.add('fullscreen');
            }
          }, 10);
        }
      });
    }
  }

  // перемикання вкладок
  aboutTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const aboutContact = document.getElementById('about-contact');
      const aboutDevelopers = document.getElementById('about-developers');
      
      aboutIntro.style.display = tab.dataset.tab === 'intro' ? 'block' : 'none';
      aboutUpdates.style.display = tab.dataset.tab === 'updates' ? 'block' : 'none';
      aboutComing.style.display = tab.dataset.tab === 'coming' ? 'block' : 'none';
      aboutContact.style.display = tab.dataset.tab === 'contact' ? 'block' : 'none';
      
      // Developers only - require password
      if (tab.dataset.tab === 'developers') {
        if (!sessionStorage.getItem('developerAccess')) {
          const password = prompt('Enter developer password:');
          const correctPassword = 'Dev#Mat2026!Пр0j'; // Strong password: symbols, numbers, letters (EN, UK, PL, RU)
          
          if (password === correctPassword) {
            sessionStorage.setItem('developerAccess', 'true');
            aboutDevelopers.style.display = 'block';
            alert('Access granted for this session!');
          } else if (password !== null) {
            alert('Incorrect password!');
            tab.blur();
            aboutTabs[0].click(); // Go back to intro
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

  // завантажити фон при старті
    const savedWallpaper = localStorage.getItem('wallpaper');
    if (savedWallpaper) {
      desktop.style.background = '';
      desktop.style.backgroundImage = `url(${savedWallpaper})`;
      desktop.style.backgroundSize = 'cover';
      desktop.style.backgroundPosition = 'center';
      desktop.style.backgroundRepeat = 'no-repeat';
    }

    // вибір нового фону
    wallpaperOptions.forEach(option => {
      option.addEventListener('click', () => {
        const selected = option.getAttribute('src');
        desktop.style.background = '';
        desktop.style.backgroundImage = `url(${selected})`;
        desktop.style.backgroundSize = 'cover';
        desktop.style.backgroundPosition = 'center';
        desktop.style.backgroundRepeat = 'no-repeat';
        localStorage.setItem('wallpaper', selected); // зберегти вибір
      });
    });

    // Contact Us form handler with localStorage
    const sendMessageBtn = document.getElementById('send-message-btn');
    const contactUsername = document.getElementById('contact-username');
    const contactMessage = document.getElementById('contact-message');
    const knownBugsList = document.getElementById('known-bugs-list');

    // Load bugs from localStorage on page load
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

            // Done button
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

            // Planned button
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

            // In Progress button
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

            // Delete button
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

    // Initialize bugs list from storage
    loadBugsFromStorage();

    sendMessageBtn.addEventListener('click', () => {
      const username = contactUsername.value.trim();
      const message = contactMessage.value.trim();

      if (!username || !message) {
        alert('Please fill in both fields!');
        return;
      }

      // Get existing bugs from localStorage
      let bugs = [];
      const savedBugs = localStorage.getItem('reportedBugs');
      if (savedBugs) {
        bugs = JSON.parse(savedBugs);
      }

      // Add new bug
      bugs.push({ username, message, timestamp: new Date().toISOString(), status: 'new' });
      localStorage.setItem('reportedBugs', JSON.stringify(bugs));

      // Reload bugs list
      loadBugsFromStorage();

      // Clear form and show alert
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
      // Закриття з анімацією
      menu.classList.remove("show");
      menu.classList.add("hide");
      // Після завершення анімації сховати
      menu.addEventListener("animationend", () => {
        if (menu.classList.contains("hide")) {
          menu.style.display = "none";
        }
      }, { once: true });
    } else {
      // Відкриття з анімацією
      menu.style.display = "block";
      menu.classList.remove("hide");
      menu.classList.add("show");
    }
  }


  const systemIconsBtn = document.getElementById("system-icons");
  if (systemIconsBtn) {
    // Add click event to the system-icons div and all its children
    systemIconsBtn.addEventListener('click', (e) => {
      toggleMenu("popupMenu");
      e.stopPropagation(); // Prevent event bubbling
    });
    
    // Also add to individual tray items
    const trayItems = systemIconsBtn.querySelectorAll('.tray, #clock');
    trayItems.forEach(item => {
      item.addEventListener('click', (e) => {
        toggleMenu("popupMenu");
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

  // Initialize button states
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

  // Airplane Mode
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

  // Battery Saver
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

  // Night Light
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

  // Mobile Hotspot
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

  // Volume slider
  const volumeSlider = document.getElementById("volume-slider");
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      if (gainNode) {
        const volume = e.target.value / 100;
        gainNode.gain.value = volume;
      }
    });
  }

  // Brightness slider
  const brightnessSlider = document.getElementById("brightness-slider");
  if (brightnessSlider) {
    brightnessSlider.addEventListener('input', (e) => {
      const brightness = e.target.value;
      document.body.style.filter = `brightness(${brightness / 100})`;
    });
  }

  // Settings button
  const settingsBtn = document.getElementById("settings-btn");
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      toggleMenu("popupMenu"); // закрити popup
      openSettings(); // відкрити settings window
    });
  }
});

function openAbout() {
  aboutWindow.style.display = 'block';
    aboutWindow.classList.add('show-window');
  // Додати іконку в панель задач
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
    btn.addEventListener('click', () => {
      if (aboutWindow.style.display === 'block') {
        aboutWindow.classList.add('hide-window');
        setTimeout(() => {
          if (aboutMaximized) {
            aboutWindow.style.top = aboutPrevPos.top;
            aboutWindow.style.left = aboutPrevPos.left;
            aboutWindow.style.width = aboutPrevPos.width;
            aboutWindow.style.height = aboutPrevPos.height;
            aboutWindow.style.resize = 'both';
            taskbar.classList.remove('fullscreen');
          }
          aboutWindow.style.display = 'none';
          aboutWindow.classList.remove('hide-window');
        }, 500);
      } else {
        aboutWindow.style.display = 'block';
        setTimeout(() => {
          aboutWindow.classList.add('show-window');
          if (aboutMaximized) {
            aboutWindow.style.top = '0';
            aboutWindow.style.left = '0';
            aboutWindow.style.width = '100%';
            aboutWindow.style.height = 'calc(100% - 70px)';
            aboutWindow.style.resize = 'none';
            taskbar.classList.add('fullscreen');
          }
        }, 10);
      }
    });
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
