const postForm = document.getElementById("postForm");
const authForm = document.getElementById("authForm");
const postsDiv = document.getElementById("posts");

const API = "http://localhost:3000/api/posts"; // Adjust if needed
let token = localStorage.getItem("token");

// Handle Auth
authForm.onsubmit = async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  await fetch("http://localhost:3000/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const res = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  token = data.token;
  localStorage.setItem("token", token);
  loadPosts();
};

// Handle Post
postForm.onsubmit = async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const body = document.getElementById("body").value.trim();

  await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, body }),
  });

  postForm.reset();
  loadPosts();
};

// Handle Delete
const deletePost = async (id) => {
  await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  loadPosts();
};

// Logout
const logout = () => {
  token = null;
  localStorage.removeItem("token");
  loadPosts();
};

// Load Posts
const loadPosts = async () => {
  const res = await fetch(API);
  const posts = await res.json();

  postsDiv.innerHTML = posts
    .map(
      (post) => `
    <div class="bg-white shadow rounded-lg p-6">
      <h3 class="text-xl font-semibold text-indigo-700 mb-2">${post.title}</h3>
      <p class="text-gray-700 mb-4 whitespace-pre-line">${post.body}</p>
      <p class="text-sm text-gray-500 italic">Posted on ${new Date(
        post.createdAt
      ).toLocaleString()}</p>
      ${
        token
          ? `<button onclick="deletePost(${post.id})" class="mt-3 inline-block bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>`
          : ""
      }
    </div>
  `
    )
    .join("");
};

loadPosts();
