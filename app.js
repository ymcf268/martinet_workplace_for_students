// Martinet Work Place - Vanilla JS App (Firestore version)
// ORIGINAL LOGIC PRESERVED – ERRORS FIXED

import { db, ensureAuth } from "./firebase.js";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {

  await ensureAuth();

  // ===== DATA =====
  let martinetData = { classes: {}, currentUser: null };
  let currentClass = "";
  let currentUserName = "";
  let currentDay = "";

  // ===== DOM =====
  const registerPage = document.getElementById("registerPage");
  const workspace = document.getElementById("workspace");
  const nameInput = document.getElementById("nameInput");
  const classInput = document.getElementById("classInput");
  const registerBtn = document.getElementById("registerBtn");

  const classTitle = document.getElementById("classTitle");
  const userNameDisplay = document.getElementById("userNameDisplay");
  const classMessages = document.getElementById("classMessages");
  const classChatInput = document.getElementById("classChatInput");
  const classSendBtn = document.getElementById("classSendBtn");

  // ===== HELPERS =====
  const classDocRef = (name) => doc(db, "classes", name);

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

  // ===== UI =====
  function showWorkspace() {
    registerPage.classList.add("hidden");
    workspace.classList.remove("hidden");
    classTitle.textContent = currentClass;
    userNameDisplay.textContent = currentUserName;
    subscribeToClassChat();
  }

  // ===== REGISTER =====
  registerBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    const className = classInput.value.trim();

    if (!name || !className) {
      alert("Enter name and class");
      return;
    }

    await createClassIfNotExists(className);

    await updateDoc(classDocRef(className), {
      members: arrayUnion(name)
    });

    martinetData.currentUser = { name, class: className };
    currentUserName = name;
    currentClass = className;

    showWorkspace();
  });

  // ===== CLASS CHAT =====
  function subscribeToClassChat() {
    onSnapshot(classDocRef(currentClass), snap => {
      if (!snap.exists()) return;

      classMessages.innerHTML = "";
      snap.data().classChat.forEach(msg => {
        const p = document.createElement("p");
        p.innerHTML = `<strong>${msg.user}:</strong> ${msg.text}`;
        classMessages.appendChild(p);
      });
    });
  }

  classSendBtn.addEventListener("click", async () => {
    const text = classChatInput.value.trim();
    if (!text) return;

    await updateDoc(classDocRef(currentClass), {
      classChat: arrayUnion({
        user: currentUserName,
        text,
        ts: Date.now()
      })
    });

    classChatInput.value = "";
  });
});
