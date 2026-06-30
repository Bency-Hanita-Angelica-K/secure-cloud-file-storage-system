const token = localStorage.getItem("token");

if (!token) {
  window.location = "login.html";
}

// Upload File
async function uploadFile() {
  const file = document.getElementById("fileInput").files[0];

  if (!file) {
    alert("Please select a file");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API_URL}/files/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      alert("File uploaded successfully");
      document.getElementById("fileInput").value = "";
      loadFiles();
    } else {
      alert(data.message || "Upload failed");
    }
  } catch (error) {
    alert("Something went wrong during upload");
  }
}

// Load Files
async function loadFiles() {
  try {
    const res = await fetch(`${API_URL}/files`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const files = await res.json();
    const table = document.getElementById("fileTable");

    table.innerHTML = "";

    files.forEach((file) => {
      table.innerHTML += `
        <tr>
          <td>${file.fileName}</td>

          <td>
            <a href="${file.fileUrl}" target="_blank">
              <button class="action-btn download">
                Open
              </button>
            </a>
          </td>

          <td>
            <button class="action-btn delete" onclick="deleteFile('${file._id}')">
              Delete
            </button>
          </td>
        </tr>
      `;
    });
  } catch (error) {
    alert("Unable to load files");
  }
}

// Delete File
async function deleteFile(id) {
  if (!confirm("Delete this file?")) return;

  try {
    await fetch(`${API_URL}/files/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    loadFiles();
  } catch (error) {
    alert("Unable to delete file");
  }
}

// Logout
function logout() {
  localStorage.removeItem("token");
  window.location = "login.html";
}

// Search Files
document.getElementById("searchInput").addEventListener("keyup", function () {
  const value = this.value.toLowerCase();

  document.querySelectorAll("#fileTable tr").forEach((row) => {
    row.style.display = row.innerText.toLowerCase().includes(value)
      ? ""
      : "none";
  });
});

loadFiles();