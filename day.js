// day.js
(function(){
  function read(k){ return JSON.parse(localStorage.getItem(k) || 'null'); }
  function write(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
  const user = read('mw_user'); if(!user) return location.href = 'index.html';

  const qs = new URLSearchParams(location.search);
  const date = qs.get('date') || new Date().toISOString().slice(0,10);

  document.getElementById('dayTitle').textContent = (new Date(date)).toLocaleDateString();
  document.getElementById('dayClass').textContent = user.class;
  document.getElementById('addClass').value = user.class;

  const addForm = document.getElementById('addForm');
  const askSection = document.getElementById('askSection');
  const showAdd = document.getElementById('showAdd');
  const showAsk = document.getElementById('showAsk');
  const cancelAdd = document.getElementById('cancelAdd');
  const deployBtn = document.getElementById('deployBtn');
  const addTime = document.getElementById('addTime');
  const addDesc = document.getElementById('addDesc');
  const addFile = document.getElementById('addFile');

  const dayChat = document.getElementById('dayChat');
  const dayChatInput = document.getElementById('dayChatInput');
  const dayChatSend = document.getElementById('dayChatSend');

  const dataKey = 'mw_data';
  const data = read(dataKey) || { classes: {} };
  if(!data.classes[user.class]) data.classes[user.class] = { posts: [], classChat: [], days: {}, privateChats:{}, members: [] };
  if(!data.classes[user.class].days[date]) data.classes[user.class].days[date] = { posts: [], chat: [] };
  write(dataKey, data);

  function showAddForm(){ addForm.classList.remove('hidden'); askSection.classList.add('hidden'); }
  function showAskForm(){ askSection.classList.remove('hidden'); addForm.classList.add('hidden'); loadDayChat(); }

  showAdd.addEventListener('click', showAddForm);
  showAsk.addEventListener('click', showAskForm);
  cancelAdd.addEventListener('click', ()=>{ addForm.classList.add('hidden'); });

  // deploy post
  deployBtn.addEventListener('click', async ()=>{
    const cls = document.getElementById('addClass').value;
    const desc = (addDesc.value || '').trim();
    const time = (addTime.value || '').trim();
    const file = addFile.files[0];
    if(!desc && !file) return alert('Add a description or file.');

    let fileData = null;
    if(file){
      fileData = await toDataURL(file);
    }

    const entry = {
      id: Date.now(),
      user: user.name,
      date,
      time: time || null,
      desc: desc || null,
      file: fileData ? { name: file.name, type: file.type, data: fileData } : null,
      created: Date.now()
    };

    const cur = read(dataKey);
    if(!cur.classes[cls]) cur.classes[cls] = { posts: [], classChat: [], days: {}, privateChats:{}, members: [] };
    // push to class posts (global) and day node
    cur.classes[cls].posts = cur.classes[cls].posts || [];
    cur.classes[cls].posts.push(entry);
    cur.classes[cls].days = cur.classes[cls].days || {};
    cur.classes[cls].days[date] = cur.classes[cls].days[date] || { posts: [], chat: [] };
    cur.classes[cls].days[date].posts.push(entry);
    write(dataKey, cur);

    // clear form and go back to class
    addDesc.value = ''; addTime.value = ''; addFile.value = '';
    location.href = 'class.html';
  });

  function toDataURL(file){ return new Promise((res,rej)=>{
    const r = new FileReader(); r.onload = ()=>res(r.result); r.onerror = ()=>rej(); r.readAsDataURL(file);
  }); }

  // day chat
  function loadDayChat(){
    dayChat.innerHTML = '';
    const cur = read(dataKey);
    const list = (cur.classes[user.class].days[date].chat || []);
    if(list.length === 0) dayChat.innerHTML = '<div class="muted small">No questions yet.</div>';
    list.forEach(m=>{
      const d = document.createElement('div'); d.className = 'post-row';
      d.innerHTML = `<div style="font-size:12px;color:var(--muted)">${m.time} • ${m.user}</div><div>${m.text}</div>`;
      dayChat.appendChild(d);
    });
    dayChat.scrollTop = dayChat.scrollHeight;
  }

  dayChatSend.addEventListener('click', ()=>{
    const txt = (dayChatInput.value || '').trim(); if(!txt) return;
    const cur = read(dataKey);
    const entry = { user: user.name, text: txt, time: (new Date()).toLocaleString() };
    cur.classes[user.class].days[date].chat.push(entry);
    write(dataKey, cur);
    dayChatInput.value = '';
    loadDayChat();
  });
  dayChatInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') dayChatSend.click(); });

  // initial view
  // show add by default
  showAddForm();
  loadDayChat();
})();
