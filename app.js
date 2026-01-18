// Martinet Work Place - Vanilla JS App
document.addEventListener('DOMContentLoaded', function() {
  // Data structure
  let martinetData = { classes: {}, currentUser: null };
  let currentClass = '';
  let currentUserName = '';
  let currentDay = '';
  
  // DOM elements
  const registerPage = document.getElementById('registerPage');
  const nameInput = document.getElementById('nameInput');
  const classInput = document.getElementById('classInput');
  const registerBtn = document.getElementById('registerBtn');
  const workspace = document.getElementById('workspace');
  const classTitle = document.getElementById('classTitle');
  const userNameDisplay = document.getElementById('userNameDisplay');
  const calendarEl = document.getElementById('calendar');
  const classMessages = document.getElementById('classMessages');
  const classChatInput = document.getElementById('classChatInput');
  const classSendBtn = document.getElementById('classSendBtn');

  const dayModal = document.getElementById('dayModal');
  const closeModal = document.getElementById('closeModal');
  const modalDayName = document.getElementById('modalDayName');
  const modalOptions = document.getElementById('modalOptions');
  const modalFilesList = document.getElementById('modalFilesList');
  const modalAddBtn = document.getElementById('modalAddBtn');
  const modalAskBtn = document.getElementById('modalAskBtn');

  const addForm = document.getElementById('addForm');
  const modalDayNameAdd = document.getElementById('modalDayNameAdd');
  const fileInput = document.getElementById('fileInput');
  const fileDesc = document.getElementById('fileDesc');
  const saveFileBtn = document.getElementById('saveFileBtn');
  const backFromAdd = document.getElementById('backFromAdd');

  const askForm = document.getElementById('askForm');
  const modalDayNameAsk = document.getElementById('modalDayNameAsk');
  const dayChatMessages = document.getElementById('dayChatMessages');
  const dayChatInput = document.getElementById('dayChatInput');
  const dayChatSendBtn = document.getElementById('dayChatSendBtn');
  const backFromAsk = document.getElementById('backFromAsk');

  // Load data from localStorage
  function loadData() {
    const data = JSON.parse(localStorage.getItem('martinetData'));
    if (data) {
      martinetData = data;
    }
  }
  // Save data to localStorage
  function saveData() {
    localStorage.setItem('martinetData', JSON.stringify(martinetData));
  }

  // Show register or workspace
  function showRegisterPage() {
    registerPage.classList.remove('hidden');
    workspace.classList.add('hidden');
  }
  function showWorkspace() {
    registerPage.classList.add('hidden');
    workspace.classList.remove('hidden');
    // display user info
    classTitle.textContent = currentClass;
    userNameDisplay.textContent = currentUserName;
    // build calendar and load chat
    buildCalendar();
    loadClassChat();
  }

  // Build 5-day calendar
  function buildCalendar() {
    calendarEl.innerHTML = '';
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
    days.forEach(day => {
      const dayEl = document.createElement('div');
      dayEl.classList.add('day');
      dayEl.dataset.day = day;
      dayEl.textContent = day;
      dayEl.addEventListener('click', () => openDayModal(day));
      calendarEl.appendChild(dayEl);
    });
    updateCalendarDays();
  }

  // Update calendar days (show count of files)
  function updateCalendarDays() {
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
    days.forEach(day => {
      const el = calendarEl.querySelector(`.day[data-day="${day}"]`);
      const count = martinetData.classes[currentClass].days[day].files.length;
      if (count > 0) {
        el.textContent = day + ' (' + count + ')';
      } else {
        el.textContent = day;
      }
    });
  }

  // Registration handler
  registerBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const className = classInput.value.trim();
    if (!name || !className) {
      alert('Please enter name and class.');
      return;
    }
    // Initialize class if not exist
    if (!martinetData.classes[className]) {
      martinetData.classes[className] = {
        members: [],
        days: {
          Monday: { files: [], chat: [] },
          Tuesday: { files: [], chat: [] },
          Wednesday: { files: [], chat: [] },
          Thursday: { files: [], chat: [] },
          Friday: { files: [], chat: [] }
        },
        classChat: []
      };
    }
    // Add member if new
    if (!martinetData.classes[className].members.includes(name)) {
      martinetData.classes[className].members.push(name);
    }
    // Set current user
    martinetData.currentUser = { name: name, class: className };
    saveData();
    currentUserName = name;
    currentClass = className;
    showWorkspace();
  });

  // Load class chat into UI
  function loadClassChat() {
    classMessages.innerHTML = '';
    const chatList = martinetData.classes[currentClass].classChat;
    chatList.forEach(msg => {
      const p = document.createElement('p');
      p.innerHTML = '<strong>' + msg.user + ':</strong> ' + msg.text;
      classMessages.appendChild(p);
    });
    classMessages.scrollTop = classMessages.scrollHeight;
  }

  // Add class chat message
  classSendBtn.addEventListener('click', () => {
    const text = classChatInput.value.trim();
    if (!text) return;
    const msg = { user: currentUserName, text: text };
    martinetData.classes[currentClass].classChat.push(msg);
    saveData();
    const p = document.createElement('p');
    p.innerHTML = '<strong>' + currentUserName + ':</strong> ' + text;
    classMessages.appendChild(p);
    classMessages.scrollTop = classMessages.scrollHeight;
    classChatInput.value = '';
  });
  classChatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      classSendBtn.click();
    }
  });

  // Open day modal
  function openDayModal(day) {
    currentDay = day;
    modalDayName.textContent = day;
    modalDayNameAdd.textContent = day;
    modalDayNameAsk.textContent = day;
    dayModal.classList.remove('hidden');
    modalOptions.classList.remove('hidden');
    addForm.classList.add('hidden');
    askForm.classList.add('hidden');
    populateModalFiles();
  }
  // Close day modal
  closeModal.addEventListener('click', () => {
    dayModal.classList.add('hidden');
    currentDay = '';
  });

  // Populate files list in modal
  function populateModalFiles() {
    modalFilesList.innerHTML = '';
    const files = martinetData.classes[currentClass].days[currentDay].files;
    files.forEach(fileEntry => {
      const div = document.createElement('div');
      div.classList.add('fileEntry');
      if (fileEntry.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = fileEntry.data;
        img.alt = fileEntry.name;
        img.style.maxWidth = '100px';
        div.appendChild(img);
      }
      const p = document.createElement('p');
      if (!fileEntry.type.startsWith('image/')) {
        const a = document.createElement('a');
        a.href = fileEntry.data;
        a.target = '_blank';
        a.textContent = fileEntry.name;
        p.appendChild(a);
      } else {
        p.innerHTML = '<strong>' + fileEntry.name + '</strong>';
      }
      p.innerHTML += ' - ' + fileEntry.description + ' (by ' + fileEntry.user + ')';
      div.appendChild(p);
      modalFilesList.appendChild(div);
    });
  }

  // Show Add form
  modalAddBtn.addEventListener('click', () => {
    modalOptions.classList.add('hidden');
    addForm.classList.remove('hidden');
  });
  backFromAdd.addEventListener('click', () => {
    addForm.classList.add('hidden');
    modalOptions.classList.remove('hidden');
  });

  // Show Ask chat
  modalAskBtn.addEventListener('click', () => {
    modalOptions.classList.add('hidden');
    askForm.classList.remove('hidden');
    updateDayChatMessages();
  });
  backFromAsk.addEventListener('click', () => {
    askForm.classList.add('hidden');
    modalOptions.classList.remove('hidden');
  });

  // Save file
  saveFileBtn.addEventListener('click', () => {
    const file = fileInput.files[0];
    const desc = fileDesc.value.trim();
    if (!file) {
      alert('Select a file first.');
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      const dataURL = e.target.result;
      const fileEntry = {
        name: file.name,
        type: file.type,
        data: dataURL,
        description: desc,
        user: currentUserName
      };
      martinetData.classes[currentClass].days[currentDay].files.push(fileEntry);
      saveData();
      populateModalFiles();
      updateCalendarDays();
      // reset form
      fileInput.value = '';
      fileDesc.value = '';
      // go back to options
      addForm.classList.add('hidden');
      modalOptions.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });

  // Update day chat messages UI
  function updateDayChatMessages() {
    dayChatMessages.innerHTML = '';
    const chatList = martinetData.classes[currentClass].days[currentDay].chat;
    chatList.forEach(msg => {
      const p = document.createElement('p');
      p.innerHTML = '<strong>' + msg.user + ':</strong> ' + msg.text;
      dayChatMessages.appendChild(p);
    });
    dayChatMessages.scrollTop = dayChatMessages.scrollHeight;
  }

  // Send day chat message
  dayChatSendBtn.addEventListener('click', () => {
    const text = dayChatInput.value.trim();
    if (!text) return;
    const msg = { user: currentUserName, text: text };
    martinetData.classes[currentClass].days[currentDay].chat.push(msg);
    saveData();
    const p = document.createElement('p');
    p.innerHTML = '<strong>' + currentUserName + ':</strong> ' + text;
    dayChatMessages.appendChild(p);
    dayChatMessages.scrollTop = dayChatMessages.scrollHeight;
    dayChatInput.value = '';
  });
  dayChatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      dayChatSendBtn.click();
    }
  });

  // Initialization
  loadData();
  if (martinetData.currentUser) {
    currentUserName = martinetData.currentUser.name;
    currentClass = martinetData.currentUser.class;
    showWorkspace();
  } else {
    showRegisterPage();
  }
});
