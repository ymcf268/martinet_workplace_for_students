// register.js
document.addEventListener('DOMContentLoaded', () => {
  const nameInput = document.getElementById('nameInput');
  const registerBtn = document.getElementById('registerBtn');

  const allowedClasses = ['9VG/1','9VG/2','9VG/3','9VG/4','9VG/5','10VG/1','10VG/2','10VG/3','10VG/4','10VG/5'];

  const existingUser = JSON.parse(localStorage.getItem('mw_user') || 'null');
  if(existingUser){
    // user already exists, redirect to class page
    location.href = 'class.html';
    return;
  }

  // Add class selection dropdown
  const classSelect = document.createElement('select');
  classSelect.className = 'input';
  allowedClasses.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    classSelect.appendChild(opt);
  });
  nameInput.insertAdjacentElement('afterend', classSelect);

  registerBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const cls = classSelect.value;

    if(!name) return alert('Enter your name.');
    if(!allowedClasses.includes(cls)) return alert('Invalid class.');

    const userObj = { name, class: cls };
    localStorage.setItem('mw_user', JSON.stringify(userObj));

    // ensure class data exists
    const dataKey = 'mw_data';
    const data = JSON.parse(localStorage.getItem(dataKey) || '{}');
    if(!data.classes) data.classes = {};
    if(!data.classes[cls]) data.classes[cls] = { posts: [], classChat: [], days: {}, privateChats:{} };
    localStorage.setItem(dataKey, JSON.stringify(data));

    location.href = 'class.html';
  });
});
