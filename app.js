// Martinet Work Place - Vanilla JS App (Firestore version)
// ORIGINAL CODE PRESERVED – Firebase ADDED (DO NOT REMOVE COMMENTS)

import { db, ensureAuth } from "./firebase.js";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async function() {

  // ===== FIREBASE AUTH (ADDED) =====
  await ensureAuth();

  // ===== FIREBASE HELPERS (DO NOT REMOVE) =====
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db, ensureAuth } from "./firebase.js";

function classDocRef(className) {
  return doc(db, "classes", className);
}

async function createClassIfNotExists(className) {
  const ref = classDocRef(className);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      members: [],
      classChat: [],
      days: {
        Monday: { files: [], chat: [] },
        Tuesday: { files: [], chat: [] },
        Wednesday: { files: [], chat: [] },
        Thursday: { files: [], chat: [] },
        Friday: { files: [], chat: [] }
      }
    });
  }
}

async function loadClassFromFirestore(className) {
  const ref = classDocRef(className);

  onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;
    martinetData.classes[className] = snap.data();
    loadClassChat();
    updateCalendarDays();
  });
}

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

  // ===== FIREBASE HELPERS (ADDED) =====
  function classDocRef(className) {
    return doc(db, "classes", className);
  }

  async function loadClassFromFirestore(className) {
    const snap = await getDoc(classDocRef(className));
    if (snap.exists()) {
      martinetData.classes[className] = snap.data();
    }
  }

  async function createClassIfNotExists(className) {
    const ref = classDocRef(className);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        members: [],
        days: {
          Monday: { files: [], chat: [] },
          Tuesday: { files: [], chat: [] },
          Wednesday: { files: [], chat: [] },
          Thursday: { files: [], chat: [] },
          Friday: { files: [], chat: [] }
        },
        classChat: []
      });
    }
  }

  // Show register or workspace
  function showRegisterPage() {
    registerPage.classList.remove('hidden');
    workspace.classList.add('hidden');
  }

  function showWorkspace() {
    registerPage.classList.add('hidden');
    workspace.classList.remove('hidden');
    classTitle.textContent = currentClass;
    userNameDisplay.textContent = currentUserName;
    buildCalendar();
    subscribeToClassChat();
  }

  // Build 5-day calendar
  function buildCalendar() {
    calendarEl.innerHTML = '';
    ['Monday','Tuesday','Wednesday','Thursday','Friday'].forEach(day => {
      const el = document.createElement('div');
      el.classList.add('day');
      el.dataset.day = day;
      el.textContent = day;
      el.addEventListener('click', () => openDayModal(day));
      calendarEl.appendChild(el);
    });
  }

  // ===== REGISTRATION =====
  registerBtn.addEventListener('click', async () => {
  await ensureAuth(); // 🔥 REQUIRED
    const name = nameInput.value.trim();
    const className = classInput.value.trim();
    if (!name || !className) {
      alert('Please enter name and class.');
      return;
    }

    await createClassIfNotExists(className);
    await loadClassFromFirestore(className);

    await updateDoc(classDocRef(className), {
      members: arrayUnion(name)
    });

    martinetData.currentUser = { name, class: className };
    currentUserName = name;
    currentClass = className;

    showWorkspace();
  });

  // ===== LIVE CLASS CHAT (REALTIME) =====
  function subscribeToClassChat() {
    onSnapshot(classDocRef(currentClass), snap => {
      if (!snap.exists()) return;
      martinetData.classes[currentClass] = snap.data();
      classMessages.innerHTML = '';
      snap.data().classChat.forEach(msg => {
        const p = document.createElement('p');
        p.innerHTML = `<strong>${msg.user}:</strong> ${msg.text}`;
        classMessages.appendChild(p);
      });
      classMessages.scrollTop = classMessages.scrollHeight;
    });
  }

  classSendBtn.addEventListener('click', async () => {
    const text = classChatInput.value.trim();
    if (!text) return;

    await updateDoc(classDocRef(currentClass), {
      classChat: arrayUnion({
        user: currentUserName,
        text,
        ts: Date.now()
      })
    });

    classChatInput.value = '';
  });

  classChatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') classSendBtn.click();
  });

  // ===== DAY MODAL =====
  function openDayModal(day) {
    currentDay = day;
    modalDayName.textContent = day;
    modalDayNameAdd.textContent = day;
    modalDayNameAsk.textContent = day;
    dayModal.classList.remove('hidden');
    modalOptions.classList.remove('hidden');
    addForm.classList.add('hidden');
    askForm.classList.add('hidden');
    subscribeToDay();
  }

  closeModal.addEventListener('click', () => {
    dayModal.classList.add('hidden');
    currentDay = '';
  });

  // ===== LIVE DAY CHAT + FILES =====
  function subscribeToDay() {
    onSnapshot(classDocRef(currentClass), snap => {
      const day = snap.data().days[currentDay];

      modalFilesList.innerHTML = '';
      day.files.forEach(file => {
        const p = document.createElement('p');
        p.innerHTML = `<strong>${file.name}</strong> - ${file.description} (by ${file.user})`;
        modalFilesList.appendChild(p);
      });

      dayChatMessages.innerHTML = '';
      day.chat.forEach(msg => {
        const p = document.createElement('p');
        p.innerHTML = `<strong>${msg.user}:</strong> ${msg.text}`;
        dayChatMessages.appendChild(p);
      });
    });
  }

  dayChatSendBtn.addEventListener('click', async () => {
    const text = dayChatInput.value.trim();
    if (!text) return;

    const ref = classDocRef(currentClass);
    const snap = await getDoc(ref);
    const data = snap.data();

    data.days[currentDay].chat.push({
      user: currentUserName,
      text,
      ts: Date.now()
    });

    await updateDoc(ref, { days: data.days });
    dayChatInput.value = '';
  });

  // ===== FILE UPLOAD =====
  saveFileBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async e => {
      const ref = classDocRef(currentClass);
      const snap = await getDoc(ref);
      const data = snap.data();

      data.days[currentDay].files.push({
        name: file.name,
        type: file.type,
        data: e.target.result,
        description: fileDesc.value,
        user: currentUserName
      });

      await updateDoc(ref, { days: data.days });
      fileInput.value = '';
      fileDesc.value = '';
    };
    reader.readAsDataURL(file);
  });

  // Init
  showRegisterPage();
});
