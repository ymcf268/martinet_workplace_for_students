// class.js
(function(){
  const HOUR_START = 8;
  const HOUR_COUNT = 11; // 8..18 inclusive
  const SLOT_HEIGHT = 60; // matches CSS var

  // helpers
  const read = (k) => JSON.parse(localStorage.getItem(k) || 'null');
  const write = (k,v) => localStorage.setItem(k, JSON.stringify(v));
  const user = read('mw_user');
  if(!user) return location.href = 'index.html';

  const dataKey = 'mw_data';
  const data = read(dataKey) || { classes: {} };
  const clsName = user.class || '9vg2';
  const cls = data.classes[clsName] || (data.classes[clsName] = { posts: [], classChat: [], days: {} });

  // DOM
  const classTitle = document.getElementById('classTitle');
  const userName = document.getElementById('userName');
  const weekPicker = document.getElementById('weekPicker');
  const weekContainer = document.getElementById('weekContainer');
  const classChat = document.getElementById('classChat');
  const classChatInput = document.getElementById('classChatInput');
  const classChatSend = document.getElementById('classChatSend');
  const postsList = document.getElementById('postsList');
  const openMonth = document.getElementById('openMonth');
  const monthModal = document.getElementById('monthModal');
  const monthGrid = document.getElementById('monthGrid');
  const closeMonth = document.getElementById('closeMonth');
  const logout = document.getElementById('logout');

  classTitle.textContent = clsName;
  userName.textContent = user.name;

  // init week date (centered on Monday of current or chosen date)
  let referenceDate = new Date();
  // weekPicker default
  weekPicker.value = new Date().toISOString().slice(0,10);

  weekPicker.addEventListener('change', ()=> {
    referenceDate = new Date(weekPicker.value + 'T00:00:00');
    renderWeek();
  });

  logout.addEventListener('click', ()=> {
    localStorage.removeItem('mw_user');
    location.href = 'index.html';
  });

  function startOfWeek(d){
    const dt = new Date(d);
    const day = dt.getDay(); // 0 sun
    const diff = (day + 6) % 7; // monday = 0
    dt.setDate(dt.getDate() - diff);
    dt.setHours(0,0,0,0);
    return dt;
  }

  function formatDayISO(d){ return d.toISOString().slice(0,10); }
  function formatShort(d){ return d.toLocaleDateString(undefined, { weekday:'short', day:'numeric' }); }

  // color generator from name
  function colorFromName(name){
    let h=0;
    for(let i=0;i<name.length;i++) h = (h*31 + name.charCodeAt(i)) % 360;
    const s = 65; const l = 70;
    return `hsl(${h}deg ${s}% ${l}%)`;
  }

  // render hours column
  function renderHours(){
    const hoursEl = document.querySelector('.hours');
    hoursEl.innerHTML = '';
    for(let i=0;i<HOUR_COUNT;i++){
      const hr = document.createElement('div');
      const hour = HOUR_START + i;
      hr.textContent = `${String(hour).padStart(2,'0')}:00`;
      hoursEl.appendChild(hr);
    }
  }

  // Build a unique posts array (avoid duplicates coming from class.posts + days[date].posts)
  function collectUniquePosts(sourceCls) {
    const map = new Map();
    function makeKey(p){
      if(p.id) return `id:${p.id}`;
      if(p.created) return `created:${p.created}`;
      return `fk:${p.date || ''}|${p.time || ''}|${p.user || ''}|${p.desc || ''}`;
    }

    const topPosts = sourceCls.posts || [];
    topPosts.forEach(p=>{ try { map.set(makeKey(p), p); } catch(e){ } });

    if(sourceCls.days){
      for(const isoKey in sourceCls.days){
        const pList = sourceCls.days[isoKey].posts || [];
        pList.forEach(p=>{ try { map.set(makeKey(p), p); } catch(e){ } });
      }
    }

    return Array.from(map.values());
  }

  // render week columns
  function renderWeek(){
    renderHours();
    weekContainer.innerHTML = '';
    const monday = startOfWeek(referenceDate);
    const todayISO = new Date().toISOString().slice(0,10);

    for(let i=0;i<5;i++){
      const d = new Date(monday); d.setDate(monday.getDate() + i);
      const iso = formatDayISO(d);
      const col = document.createElement('div');
      col.className = 'day-column' + (iso === todayISO ? ' today' : '');
      col.dataset.iso = iso;

      const header = document.createElement('div');
      header.className = 'day-header';
      header.innerHTML = `<div>${d.toLocaleDateString(undefined,{weekday:'short'})}</div><div class="date">${d.getDate()}</div>`;
      header.addEventListener('click', ()=> location.href = `day.html?date=${iso}`);

      const body = document.createElement('div');
      body.className = 'column-body';

      for(let s=0;s<HOUR_COUNT;s++){
        const slot = document.createElement('div');
        slot.className = 'slot';
        body.appendChild(slot);
      }

      col.appendChild(header);
      col.appendChild(body);
      weekContainer.appendChild(col);
    }

    renderPostsInWeek();
  }

  function renderPostsInWeek(){
    const cols = weekContainer.querySelectorAll('.day-column');
    cols.forEach(c=>{
      const body = c.querySelector('.column-body');
      const evs = body.querySelectorAll('.event-block');
      evs.forEach(e=>e.remove());
    });

    const posts = collectUniquePosts(cls);

    posts.forEach(p=>{
      if(!p || !p.date) return;
      const targetCol = weekContainer.querySelector(`.day-column[data-iso="${p.date}"]`);
      if(!targetCol) return;
      const body = targetCol.querySelector('.column-body');

      const el = document.createElement('div');
      el.className = 'event-block';
      el.style.background = colorFromName(p.user || 'anon');

      const title = document.createElement('div'); title.className = 'event-title';
      title.textContent = p.desc || (p.file && p.file.name) || 'Post';
      const meta = document.createElement('div'); meta.className = 'event-meta';
      meta.textContent = p.time ? `${p.time} • ${p.user}` : p.user;

      el.appendChild(title);
      el.appendChild(meta);

      if(p.file && p.file.type && p.file.type.startsWith('image/')){
        const img = document.createElement('img');
        img.src = p.file.data;
        img.style.width = '36px';
        img.style.height = '26px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '6px';
        img.style.marginLeft = '6px';
        el.insertBefore(img, meta);
      }

      if(p.time){
        const parts = (''+p.time).split(':').map(x=>parseInt(x,10));
        if(parts.length >= 1 && !isNaN(parts[0])){
          const hour = parts[0]; const minute = parts[1] || 0;
          const minutesFromStart = (hour - HOUR_START) * 60 + minute;
          const top = (minutesFromStart / 60) * SLOT_HEIGHT;
          el.style.top = Math.max(0, top) + 'px';
          el.style.height = Math.max(36, SLOT_HEIGHT * 0.6) + 'px';
        } else {
          el.style.top = '4px'; el.style.height = '40px';
        }
      } else {
        el.style.top = '6px'; el.style.height = '40px';
      }

      body.appendChild(el);
    });

  }

  function renderRecentPosts(){
    postsList.innerHTML = '';
    const unique = collectUniquePosts(cls);
    unique.sort((a,b)=> (b.created || b.id || 0) - (a.created || a.id || 0));
    const show = unique.slice(0,8);
    if(show.length === 0){ postsList.innerHTML = '<div class="muted small">No posts yet</div>'; return; }

    show.forEach(p=>{
      const row = document.createElement('div'); row.className = 'post-row';
      const thumb = document.createElement('div'); thumb.className = 'post-thumb';
      if(p.file && p.file.type && p.file.type.startsWith('image/')){
        const img = document.createElement('img'); img.src = p.file.data; thumb.appendChild(img);
      } else { thumb.textContent = 'F'; }
      const body = document.createElement('div'); body.className = 'post-body';
      body.innerHTML = `<div style="font-weight:600">${p.desc || p.file?.name || 'Post'}</div><div class="post-meta">${p.date} ${p.time ? '• ' + p.time : ''} • ${p.user}</div>`;
      row.appendChild(thumb); row.appendChild(body);
      postsList.appendChild(row);
    });
  }

  function renderClassChat(){
    classChat.innerHTML = '';
    const list = (cls.classChat || []);
    if(list.length === 0) classChat.innerHTML = '<div class="muted">No messages yet.</div>';
    list.forEach(m=>{
      const p = document.createElement('div'); p.style.marginBottom='8px';
      p.innerHTML = `<div style="font-size:12px;color:var(--muted)">${m.time} • ${m.user}</div><div>${m.text}</div>`;
      classChat.appendChild(p);
    });
    classChat.scrollTop = classChat.scrollHeight;
  }

  classChatSend.addEventListener('click', ()=>{
    const txt = (classChatInput.value || '').trim(); if(!txt) return;
    const now = new Date().toLocaleString();
    cls.classChat.push({ user: user.name, text: txt, time: now });
    write(dataKey, data);
    classChatInput.value = '';
    renderClassChat();
    renderRecentPosts();
    renderPostsInWeek();
  });
  classChatInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') classChatSend.click(); });

  // month modal fixed
  openMonth.addEventListener('click', ()=> {
    renderMonthGrid();
    monthModal.style.display = 'grid';
  });
  closeMonth.addEventListener('click', ()=> monthModal.style.display = 'none');

  function renderMonthGrid(){
    monthGrid.innerHTML = '';
    const now = referenceDate;
    const year = now.getFullYear(); const month = now.getMonth();
    const first = new Date(year, month, 1);
    const blanks = (first.getDay() + 6) % 7;
    for(let i=0;i<blanks;i++){ const cell = document.createElement('div'); cell.className='cell'; monthGrid.appendChild(cell); }
    const daysInMonth = new Date(year, month+1, 0).getDate();
    for(let d=1; d<=daysInMonth; d++){
      const dt = new Date(year, month, d);
      const iso = dt.toISOString().slice(0,10);
      const cell = document.createElement('div'); cell.className='cell'; cell.textContent = d;
      cell.addEventListener('click', ()=> {
        monthModal.style.display = 'none';
        location.href = `day.html?date=${iso}`;
      });
      monthGrid.appendChild(cell);
    }
  }

  // live update observer (poll)
  let last = JSON.stringify(read(dataKey));
  setInterval(()=>{
    const now = JSON.stringify(read(dataKey));
    if(now !== last){
      last = now;
      const nd = read(dataKey);
      Object.assign(data, nd);
      if(data.classes && data.classes[clsName]) Object.assign(cls, data.classes[clsName]);
      renderClassChat();
      renderRecentPosts();
      renderPostsInWeek();
    }
  }, 800);

  // initial render
  renderWeek();
  renderClassChat();
  renderRecentPosts();

})();
