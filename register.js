// register.js - localStorage multi-page registration
document.addEventListener('DOMContentLoaded', () => {
  const nameInput = document.getElementById('nameInput');
  const classSelect = document.getElementById('classInput');
  const registerBtn = document.getElementById('registerBtn');

  const existingUser = JSON.parse(localStorage.getItem('mw_user') || 'null');
  if (existingUser) {
    // user already exists, redirect to class page
    location.href = 'class.html';
    return;
  }

  registerBtn.addEventListener('click', () => {
    const name = (nameInput.value || '').trim();
    const cls = (classSelect.value || '').trim();

    if (!name) return alert('Enter your name.');
    if (!cls) return alert('Choose your class.');

    const userObj = { name, class: cls };
    localStorage.setItem('mw_user', JSON.stringify(userObj));

    // ensure class data exists and add this user to members
    const dataKey = 'mw_data';
    const data = JSON.parse(localStorage.getItem(dataKey) || '{}');
    if (!data.classes) data.classes = {};
    if (!data.privateChats) data.privateChats = {};
    if (!data.classes[cls]) data.classes[cls] = { posts: [], classChat: [], days: {}, privateChats: {}, members: [] };
    if (!Array.isArray(data.classes[cls].members)) data.classes[cls].members = [];
    if (!data.classes[cls].members.includes(name)) data.classes[cls].members.push(name);

    localStorage.setItem(dataKey, JSON.stringify(data));

    location.href = 'class.html';
  });

  // allow Enter to submit
  nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') registerBtn.click(); });
});
