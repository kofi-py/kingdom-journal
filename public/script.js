// === Firebase Setup ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCWu9AAv-zsohJUFnfmEVHvcYdXP2KVToA",
  authDomain: "kingdomjournal-4e15c.firebaseapp.com",
  projectId: "kingdomjournal-4e15c",
  storageBucket: "kingdomjournal-4e15c.appspot.com",
  messagingSenderId: "543626332515",
  appId: "1:543626332515:web:0a88d2ca71ade70a026b56",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// === DOM Elements ===
const saveBtn = document.getElementById("saveBtn");
const journalEntry = document.getElementById("journalEntry");
const submitThought = document.getElementById("submitThought");
const nameInput = document.getElementById("nameInput");
const thoughtInput = document.getElementById("thoughtInput");
const thoughtsList = document.getElementById("thoughtsList");

// === Authentication Functions ===
function typeWriterEffect(element, text, speed = 50) {
  let i = 0;
  element.textContent = "";
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}

// === Save Journal Entry to localStorage ===
saveBtn.addEventListener("click", () => {
  const content = journalEntry.value.trim();
  if (!content) return alert("Please write something before saving!");

  const entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
  entries.unshift({ date: new Date().toLocaleString(), text: content });
  localStorage.setItem("journalEntries", JSON.stringify(entries));

  journalEntry.value = "";
  loadJournalEntries();
  // Trigger confetti effect
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
});

// === Load Verse of the Day ===
async function loadVerseOfTheDay() {
  const verseText = document.getElementById("verseText");
  const verseRef = document.getElementById("verseRef");
  const verses = [
    "John 3:16",
    "Psalm 23:1",
    "Romans 8:28",
    "Proverbs 3:5-6",
    "Isaiah 41:10",
    "Philippians 4:13",
    "Joshua 1:9",
    "Galatians 2:20",
  ];

  const day = Math.floor(
    (new Date() - new Date(new Date().getFullYear(), 0, 0)) /
      (1000 * 60 * 60 * 24)
  );
  const ref = verses[day % verses.length];

  try {
    const res = await fetch(`https://bible-api.com/${encodeURIComponent(ref)}`);
    const data = await res.json();
    verseText.textContent = `"${data.text.trim()}"`;
    typeWriterEffect(verseText, verseText.textContent);
    verseRef.textContent = `— ${data.reference}`;
  } catch {
    verseText.textContent = "Could not load verse 😔";
  }
}

// === Load Daily Devotional ===
function loadDailyDevotional() {
  const devotionals = [
    "Trust in the Lord... (Proverbs 3:5)",
    "God’s grace is sufficient (2 Cor 12:9)",
    "Be still and know (Psalm 46:10)",
    "Rejoice, pray, give thanks (1 Thess 5:16-18)",
    "Cast your cares (1 Peter 5:7)",
  ];
  const index =
    Math.floor(
      (new Date() - new Date(new Date().getFullYear(), 0, 0)) /
        (1000 * 60 * 60 * 24)
    ) % devotionals.length;
  const devotionalText = document.getElementById("devotionalText");
  typeWriterEffect(devotionalText, devotionals[index]);
}

// === Load Devotional Thoughts ===
function loadThoughts() {
  const thoughts = JSON.parse(localStorage.getItem("devotionalThoughts")) || [];
  thoughtsList.innerHTML = "";
  thoughts.forEach(({ name, thought, date }) => {
    thoughtsList.innerHTML += `
      <div class="bg-gray-100 p-3 rounded shadow-sm" animate-fadeIn>
        <p class="text-gray-700">"${thought}"</p>
        <p class="text-sm text-right text-gray-500 mt-1">— ${name} on ${date}</p>
      </div>`;
  });
}

// === Submit Devotional Thought ===
submitThought.addEventListener("click", () => {
  const name = nameInput.value.trim();
  const thought = thoughtInput.value.trim();
  if (!name || !thought) return alert("Please fill in both fields.");

  const newThought = { name, thought, date: new Date().toLocaleDateString() };
  const thoughts = JSON.parse(localStorage.getItem("devotionalThoughts")) || [];
  thoughts.unshift(newThought);
  localStorage.setItem("devotionalThoughts", JSON.stringify(thoughts));

  nameInput.value = "";
  thoughtInput.value = "";
  loadThoughts();
});

// === Load Journal Entries ===
function loadJournalEntries() {
  const entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
  const entriesList = document.getElementById("entriesList");
  entriesList.innerHTML = "";

  if (!entries.length) {
    entriesList.innerHTML = `<p class='text-gray-500 italic'>No entries yet.</p>`;
    return;
  }

  entries.forEach(({ date, text }, index) => {
    entriesList.innerHTML += `
      <div class="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
        <p class="text-gray-700 dark:text-gray-100 whitespace-pre-line">${text}</p>
        <p class="text-sm text-right text-gray-500 mt-2">🗓️ ${date}</p>

        <div class="mt-4 flex justify-between items-center">
          <button class="like-btn text-blue-500 hover:underline" data-index="${index}">
            👍 Like (<span id="like-count-${index}">0</span>)
          </button>
          <button onclick="toggleComments(${index})" class="text-sm text-indigo-600">🔽 Show/Hide Comments</button>
        </div>

        <div id="comments-section-${index}" class="mt-2 space-y-2">
          <textarea id="comment-input-${index}" class="w-full p-2 border rounded mb-2" placeholder="Add a comment..."></textarea>
          <div class="flex space-x-2 mb-2">
            <button onclick="addEmoji('😊', ${index})" class="text-xl">😊</button>
            <button onclick="addEmoji('🙏', ${index})" class="text-xl">🙏</button>
            <button onclick="addEmoji('❤️', ${index})" class="text-xl">❤️</button>
          </div>
          <button class="comment-btn bg-blue-500 text-white px-4 py-1 rounded" data-index="${index}">💬 Post Comment</button>
          <div id="comments-${index}" class="mt-2 space-y-2 text-sm text-gray-600"></div>
        </div>
      </div>`;
  });

  // Like functionality
  document.querySelectorAll(".like-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      const count = document.getElementById(`like-count-${index}`);
      count.textContent = parseInt(count.textContent) + 1;
    });
  });

  // Comment functionality
  document.querySelectorAll(".comment-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      const input = document.getElementById(`comment-input-${index}`);
      const commentsDiv = document.getElementById(`comments-${index}`);
      const comment = input.value.trim();
      if (comment) {
        commentsDiv.innerHTML += `<p class="bg-gray-200 p-2 rounded">${comment}</p>`;
        input.value = "";
      }
    });
  });
}

// === Toggle Comments Section ===
window.toggleComments = (index) => {
  const section = document.getElementById(`comments-section-${index}`);
  section.classList.toggle("hidden");
};

// === Add Emoji to Comment ===
window.addEmoji = (emoji, index) => {
  const input = document.getElementById(`comment-input-${index}`);
  if (input) {
    input.value += emoji;
    input.focus();
  }
};

// 😊 Emoji Support Functions
window.addEmojiToJournal = function (emoji) {
  const textarea = document.getElementById("journalEntry");
  textarea.value += emoji;
};

window.addEmojiToThought = function (emoji) {
  const textarea = document.getElementById("thoughtInput");
  textarea.value += emoji;
};

// === On Page Load ===
window.addEventListener("DOMContentLoaded", () => {
  loadJournalEntries();
  loadVerseOfTheDay();
  loadDailyDevotional();
  loadThoughts();
});
