const postForm = document.getElementById("postForm");
const postsDiv = document.getElementById("posts");

const API = "http://localhost:3000/api/posts";

const loadPosts = async () => {
  const res = await fetch(API);
  const posts = await res.json();
  postsDiv.innerHTML = posts
    .map(
      (post) => `
    <div class="post">
      <h3>${post.title}</h3>
      <p>${post.body}</p>
      <button onclick="deletePost(${post.id})">Delete</button>
    </div>
  `
    )
    .join("");
};

postForm.onsubmit = async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const body = document.getElementById("body").value;

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, body }),
  });

  postForm.reset();
  loadPosts();
};

const deletePost = async (id) => {
  await fetch(`${API}/${id}`, { method: "DELETE" });
  loadPosts();
};

loadPosts();
