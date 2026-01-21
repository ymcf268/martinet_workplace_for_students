import { db, ensureAuth } from "./firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

let currentClass = "";
let currentUserName = "";

await ensureAuth();

/* ---------- HELPERS ---------- */
const classRef = (cls) => doc(db, "classes", cls);

/* ---------- REGISTER ---------- */
registerBtn.addEventListener("click", async () => {
  const name = nameInput.value.trim();
  const cls = classInput.value;

  if (!name || !cls) {
    alert("Enter name and class");
    return;
  }

  currentUserName = name;
  currentClass = cls;

  const ref = classRef(cls);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      members: [],
      classChat: []
    });
  }

  await updateDoc(ref, {
    members: arrayUnion(name)
  });

  showWorkspace();
});

/* ---------- UI ---------- */
function showWorkspace() {
  registerPage.classList.add("hidden");
  workspace.classList.remove("hidden");

  classTitle.textContent = currentClass;
  userNameDisplay.textContent = currentUserName;

  subscribeToChat();
}

/* ---------- CHAT ---------- */
function subscribeToChat() {
  onSnapshot(classRef(currentClass), (snap) => {
    if (!snap.exists()) return;

    classMessages.innerHTML = "";
    const msgs = snap.data().classChat || [];

    msgs.forEach((m) => {
      const div = document.createElement("div");
      div.innerHTML = `<b>${m.user}</b>: ${m.text}`;
      classMessages.appendChild(div);
    });

    classMessages.scrollTop = classMessages.scrollHeight;
  });
}

classSendBtn.addEventListener("click", async () => {
  const text = classChatInput.value.trim();
  if (!text) return;

  await updateDoc(classRef(currentClass), {
    classChat: arrayUnion({
      user: currentUserName,
      text,
      created: serverTimestamp()
    })
  });

  classChatInput.value = "";
});
