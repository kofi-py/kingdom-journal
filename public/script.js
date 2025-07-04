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
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

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

function showWelcome(user) {
  const welcomeBanner = document.getElementById("welcomeBanner");
  const userDisplayName = document.getElementById("userDisplayName");
  const userPic = document.getElementById("userPic");

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const signupBtn = document.getElementById("signupBtn");
  const loginBtn = document.getElementById("loginBtn");
  const googleBtn = document.getElementById("googleBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (user) {
    userDisplayName.textContent = `👋 Welcome, ${
      user.displayName || user.email
    }!`;
    welcomeBanner.classList.remove("hidden");

    if (user.photoURL && userPic) {
      userPic.src = user.photoURL;
      userPic.classList.remove("hidden");
    } else {
      userPic.classList.add("hidden");
    }

    // Hide inputs and buttons
    emailInput.classList.add("hidden");
    passwordInput.classList.add("hidden");
    signupBtn.classList.add("hidden");
    loginBtn.classList.add("hidden");
    googleBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
  } else {
    welcomeBanner.classList.add("hidden");
    userDisplayName.textContent = "";
    userPic.classList.add("hidden");

    // Show inputs and buttons
    emailInput.classList.remove("hidden");
    passwordInput.classList.remove("hidden");
    signupBtn.classList.remove("hidden");
    loginBtn.classList.remove("hidden");
    googleBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
  }
}
googleBtn.addEventListener("click", () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;

      // ✅ Use your helper function
      showWelcome(user); // ← This makes the UI show/hide stuff properly

      // 🎉 Optional: scroll to journal section
      document
        .getElementById("journalEntry")
        .scrollIntoView({ behavior: "smooth" });
    })
    .catch((error) => {
      if (error.code === "auth/popup-closed-by-user") {
        alert("Popup closed — try again when you're ready.");
      } else {
        console.error("Google sign-in error:", error.message);
        alert("Sign-in failed: " + error.message);
      }
    });
});

signupBtn.addEventListener("click", () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      showWelcome(user);
    })
    .catch((error) => {
      console.error("Sign up error:", error.message);
      alert("Sign up failed: " + error.message);
    });
});

loginBtn.addEventListener("click", () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      showWelcome(user);
    })
    .catch((error) => {
      console.error("Login error:", error.message);
      alert("Login failed: " + error.message);
    });
});

logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      console.log("Logged out successfully!");
      showLogout();
    })
    .catch((error) => {
      console.error("Logout error:", error.message);
    });
});

function showLogout() {
  const welcomeBanner = document.getElementById("welcomeBanner");
  const userDisplay = document.getElementById("userDisplayName");

  if (welcomeBanner && userDisplay) {
    welcomeBanner.classList.add("hidden");
    userDisplay.textContent = "";
  }

  // Show auth fields again
  emailInput.classList.remove("hidden");
  passwordInput.classList.remove("hidden");
  signupBtn.classList.remove("hidden");
  loginBtn.classList.remove("hidden");
  googleBtn.classList.remove("hidden");
  logoutBtn.classList.add("hidden");

  alert("You have been logged out. God bless you today! ✨");
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

  const lastThought = thoughtsList.firstElementChild;
  if (lastThought) {
    lastThought.classList.add("animate__animated", "animate__bounceIn");
  }
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
    <div class="bg-white dark:bg-gray-800 p-4 rounded shadow-sm relative">
      <p class="text-gray-700 dark:text-gray-100 whitespace-pre-line">${text}</p>
      <p class="text-sm text-right text-gray-500 mt-2">🗓️ ${date}</p>

      <div class="mt-4 flex justify-between items-center">
        <button class="like-btn text-blue-500 hover:underline" data-index="${index}">
          👍 Like (<span id="like-count-${index}">0</span>)
        </button>
        <button onclick="toggleComments(${index})" class="text-sm text-indigo-600">
          🔽 Show/Hide Comments
        </button>

        <!-- Delete button -->
        <button class="delete-btn text-red-600 hover:text-red-800 ml-4" data-index="${index}">
          🗑️ Delete
        </button>
      </div>

      <div id="comments-section-${index}" class="mt-2 space-y-2 hidden">
        <!-- Comment elements here -->
      </div>
    </div>
  `;
  });

  // Add delete functionality
  // Delete functionality
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      const entries = JSON.parse(localStorage.getItem("journalEntries")) || [];

      // Confirm before deleting
      if (confirm("Are you sure you want to delete this journal entry?")) {
        entries.splice(index, 1); // remove the entry at index
        localStorage.setItem("journalEntries", JSON.stringify(entries));
        loadJournalEntries(); // refresh the list
      }
    });
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

function createFloatingWord(word) {
  const el = document.createElement("span");
  el.textContent = word;
  el.className =
    "absolute text-xl font-bold text-indigo-500 animate-float transition-opacity duration-1000";
  el.style.left = Math.random() * window.innerWidth + "px";
  el.style.top = window.innerHeight + "px";
  el.style.opacity = Math.random();

  document.getElementById("floatingWordsContainer").appendChild(el);

  setTimeout(() => {
    el.style.transform = `translateY(-${window.innerHeight + 100}px)`;
    el.style.opacity = 0;
  }, 100);

  // Remove the element after animation
  setTimeout(() => el.remove(), 7000);
}

// Floating words loop
setInterval(() => {
  const bibleWords = [
    "Faith",
    "Grace",
    "Love",
    "Peace",
    "Jesus",
    "Hope",
    "Joy",
    "Truth",
  ];
  const word = bibleWords[Math.floor(Math.random() * bibleWords.length)];
  createFloatingWord(word);
}, 2000);

// === On Page Load ===
window.addEventListener("DOMContentLoaded", () => {
  loadJournalEntries();
  loadVerseOfTheDay();
  loadDailyDevotional();
  loadThoughts();
  createFloatingWord();
});
// === Theme Toggle ===
const html = document.getElementById("html");
const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    html.classList.toggle("dark");

    // Save preference to localStorage
    if (html.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  });

  // Load saved preference on page load
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }
}
