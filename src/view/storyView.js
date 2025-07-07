export default class StoryView {
  constructor() {
    this.currentPage = null;
    this.navLinks = document.getElementById("nav-links");
    this.mainContent = document.getElementById("main-content");
    this.map = null;
    this.addStoryMap = null;
    this.currentStream = null;
    this.selectedLocation = null;
    this.capturedPhotoBlob = null;
  }
  renderNavLinks(isLoggedIn) {
    const navLinks = document.getElementById("nav-links");
    if (!navLinks) return;
    navLinks.innerHTML = '';

    if (isLoggedIn) {
      navLinks.innerHTML = `
        <a href="#stories" class="nav-link">Daftar Cerita</a>
        <a href="#add-story" class="nav-link">Buat Cerita Baru</a>
        <a href="#saved-stories" class="nav-link">Cerita Tersimpan</a>
        <a href="#" id="logout-btn" class="nav-link">Logout</a>
      `;
    } else {
      navLinks.innerHTML = `
        <a href="#login" class="nav-link">Login</a>
        <a href="#register" class="nav-link">Register</a>
      `;
    }
  }

  setPresenter(presenter) {
  this.presenter = presenter;
}

  showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
      page.style.display = 'none';
      page.classList.remove('active');
    });
    const page = document.getElementById(pageId);
    if (page) {
      page.style.display = '';
      page.classList.add('active');
    }
  }

  updateNavigation() {
    const isLoggedIn = window.storyModel.isLoggedIn();

    if (isLoggedIn) {
      this.navLinks.innerHTML = `
                <a href="#stories" class="nav-link">Cerita</a>
                <a href="#add-story" class="nav-link">Tambah Cerita</a>
                <a href="#saved-stories" class="nav-link">Cerita Tersimpan</a>
                <a href="#" class="nav-link" id="logout-btn">Logout</a>
            `;
    } else {
      this.navLinks.innerHTML = `
                <a href="#login" class="nav-link">Login</a>
                <a href="#register" class="nav-link">Register</a>
            `;
    }

    // Update active nav link
    const navLinkElements = document.querySelectorAll(".nav-link");
    navLinkElements.forEach((link) => {
      link.classList.remove("active");
      if (
        link.getAttribute("href") ===
        `#${this.currentPage.replace("-page", "")}`
      ) {
        link.classList.add("active");
      }
    });
  }

  showAlert(message, type = "info") {
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    const targetPage = document.querySelector(".page.active");
    targetPage.insertBefore(alertDiv, targetPage.firstChild);

    setTimeout(() => {
      alertDiv.remove();
    }, 5000);
  }

  renderStories(stories) {
    const container = document.getElementById("stories-list");
    if (!container) return;
    if (!stories || stories.length === 0) {
      container.innerHTML = "<p>Belum ada cerita yang tersedia.</p>";
      return;
    }

    const storiesGrid = document.createElement("div");
    storiesGrid.className = "stories-grid";

    stories.forEach((story) => {
      const storyCard = document.createElement("article");
      storyCard.className = "story-card";
      storyCard.innerHTML = `
        <img src="${story.photoUrl}" alt="${story.description}" class="story-image" loading="lazy">
        <div class="story-content">
            <h2 class="story-title">${story.name}</h2>
            <p class="story-description">${story.description}</p>
            <div class="story-meta">
                <span>ID: ${story.id}</span>
                <span>${new Date(story.createdAt).toLocaleDateString("id-ID")}</span>
            </div>
            <button class="btn-simpan-story" style="margin-top:8px;">Simpan Cerita Ini</button>
        </div>
    `;

    // Event klik pada card untuk detail
    storyCard.addEventListener("click", (e) => {
      // Jangan trigger detail jika klik tombol simpan
      if (e.target.classList.contains('btn-simpan-story')) return;
      if (this.presenter) {
        this.presenter.handleStoryDetail(story.id);
      } else {
        alert("Presenter belum di-set!");
      }
    });

    // Event klik tombol simpan cerita
    const btnSimpan = storyCard.querySelector('.btn-simpan-story');
    btnSimpan.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.presenter && this.presenter.handleSaveStory) {
        this.presenter.handleSaveStory(story);
      } else {
        alert('Fitur simpan cerita belum tersedia!');
      }
    });

    storiesGrid.appendChild(storyCard);
  });

  container.innerHTML = "";
  container.appendChild(storiesGrid);

  // Initialize map with stories
  this.initializeStoriesMap(stories);
}

  renderStoryDetail(story) {
    const container = document.getElementById("story-detail-container");
    container.innerHTML = `
        <article class="story-detail">
            <img src="${story.photoUrl}" alt="${
      story.description
    }" class="story-image" loading="lazy">
            <div class="story-content">
                <h2>${story.name}</h2>
                <p>${story.description}</p>
                <p><strong>Dibuat:</strong> ${new Date(
                  story.createdAt
                ).toLocaleString("id-ID")}</p>
                ${
                  story.lat && story.lon
                    ? `<p><strong>Lokasi:</strong> (${story.lat}, ${story.lon})</p>`
                    : ""
                }
            </div>
        </article>
    `;
  }

  initializeStoriesMap(stories) {
    const mapContainer = document.getElementById("stories-map");
    mapContainer.innerHTML = '<div id="map"></div>';

    // Initialize map
    this.map = L.map("map").setView([-6.2, 106.816666], 5); // Indonesia center

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(this.map);

    // Add markers for stories with location
    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(this.map);
        marker.bindPopup(`
                    <div style="max-width: 200px;">
                        <img src="${story.photoUrl}" alt="${story.description}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
                        <h3 style="margin: 0 0 4px 0; font-size: 14px;">${story.name}</h3>
                        <p style="margin: 0; font-size: 12px; color: #666;">${story.description}</p>
                    </div>
                `);
      }
    });
  }

  initializeAddStoryMap() {
    if (this.addStoryMap) {
      this.addStoryMap.remove();
    }

    this.addStoryMap = L.map("add-story-map").setView([-6.2, 106.816666], 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(this.addStoryMap);

    let selectedMarker = null;

    this.addStoryMap.on("click", (e) => {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;

      // Remove previous marker
      if (selectedMarker) {
        this.addStoryMap.removeLayer(selectedMarker);
      }

      // Add new marker
      selectedMarker = L.marker([lat, lon]).addTo(this.addStoryMap);
      selectedMarker.bindPopup("Lokasi dipilih").openPopup();

      // Store location
      this.selectedLocation = { lat, lon };
      document.getElementById("story-lat").value = lat;
      document.getElementById("story-lon").value = lon;
    });
  }

  async initializeCamera() {
    const video = document.getElementById("camera-feed");
    const startBtn = document.getElementById("start-camera");
    const captureBtn = document.getElementById("capture-photo");
    const retakeBtn = document.getElementById("retake-photo");
    const canvas = document.getElementById("photo-canvas");
    const capturedPhoto = document.getElementById("captured-photo");
    const fileInput = document.getElementById("file-input");

    startBtn.addEventListener("click", async () => {
      try {
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Browser tidak mendukung akses kamera");
        }

        startBtn.disabled = true;
        startBtn.textContent = "Memulai kamera...";

        // Try different video constraints
        let stream = null;
        const constraints = [
          {
            video: {
              facingMode: "environment",
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
          },
          {
            video: {
              facingMode: "user",
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
          },
          { video: { width: { ideal: 640 }, height: { ideal: 480 } } },
          { video: true },
        ];

        for (let constraint of constraints) {
          try {
            stream = await navigator.mediaDevices.getUserMedia(constraint);
            break;
          } catch (err) {
            console.log("Constraint failed:", constraint, err.message);
            continue;
          }
        }

        if (!stream) {
          throw new Error(
            "Tidak dapat mengakses kamera dengan semua konfigurasi"
          );
        }

        this.currentStream = stream;
        video.srcObject = stream;

        // Wait for video to be ready
        await new Promise((resolve, reject) => {
          video.onloadedmetadata = () => {
            video.play().then(resolve).catch(reject);
          };
          video.onerror = reject;

          // Timeout after 10 seconds
          setTimeout(
            () => reject(new Error("Timeout saat memulai video")),
            10000
          );
        });

        video.style.display = "block";
        startBtn.style.display = "none";
        captureBtn.style.display = "inline-block";
      } catch (error) {
        console.error("Camera error:", error);
        startBtn.disabled = false;
        startBtn.textContent = "Buka Kamera";

        // Show file input as fallback
        this.showCameraFallback();
        this.showAlert(
          "Tidak dapat mengakses kamera: " +
            error.message +
            '. Gunakan tombol "Pilih File" sebagai alternatif.',
          "warning"
        );
      }
    });

    captureBtn.addEventListener("click", () => {
      try {
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          throw new Error("Video belum siap");
        }

        const context = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              this.showAlert("Gagal mengambil foto", "error");
              return;
            }

            const url = URL.createObjectURL(blob);
            capturedPhoto.src = url;
            capturedPhoto.style.display = "block";

            // Store photo data
            this.capturedPhotoBlob = blob;

            // Hide video and show retake button
            video.style.display = "none";
            captureBtn.style.display = "none";
            retakeBtn.style.display = "inline-block";

            // Stop camera stream
            this.stopCamera();
          },
          "image/jpeg",
          0.8
        );
      } catch (error) {
        this.showAlert("Gagal mengambil foto: " + error.message, "error");
      }
    });

    retakeBtn.addEventListener("click", () => {
      capturedPhoto.style.display = "none";
      retakeBtn.style.display = "none";
      startBtn.style.display = "inline-block";
      startBtn.disabled = false;
      startBtn.textContent = "Buka Kamera";
      this.capturedPhotoBlob = null;

      // Clean up object URL
      if (capturedPhoto.src.startsWith("blob:")) {
        URL.revokeObjectURL(capturedPhoto.src);
      }
    });

    // File input fallback
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith("image/")) {
        this.capturedPhotoBlob = file;
        const url = URL.createObjectURL(file);
        capturedPhoto.src = url;
        capturedPhoto.style.display = "block";

        // Hide camera controls and show retake
        video.style.display = "none";
        startBtn.style.display = "none";
        captureBtn.style.display = "none";
        retakeBtn.style.display = "inline-block";
      }
    });
  }

  showCameraFallback() {
    const fileInput = document.getElementById("file-input");
    const fileLabel = document.getElementById("file-input-label");
    fileInput.style.display = "block";
    fileLabel.style.display = "block";
  }

  stopCamera() {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach((track) => track.stop());
      this.currentStream = null;
    }
  }

  resetAddStoryForm() {
    document.getElementById("add-story-form").reset();
    document.getElementById("captured-photo").style.display = "none";
    document.getElementById("camera-feed").style.display = "none";
    document.getElementById("start-camera").style.display = "inline-block";
    document.getElementById("capture-photo").style.display = "none";
    document.getElementById("retake-photo").style.display = "none";
    this.capturedPhotoBlob = null;
    this.selectedLocation = null;
    this.stopCamera();

    // Reset map
    if (this.addStoryMap) {
      this.addStoryMap.remove();
      this.addStoryMap = null;
    }
  }

  showLoading(show = true) {
    const loadingElements = document.querySelectorAll(".loading");
    loadingElements.forEach((el) => {
      el.style.display = show ? "block" : "none";
    });
  }

  showStoryModal(story) {
    const modal = document.getElementById("story-modal");
    const content = document.getElementById("modal-content");
    content.innerHTML = `
    <img src="${story.photoUrl}" alt="${
      story.description
    }" style="width:100%;border-radius:8px;">
    <h2 style="margin-top:16px;">${story.name}</h2>
    <p>${story.description}</p>
    <p><strong>Dibuat:</strong> ${new Date(story.createdAt).toLocaleString(
      "id-ID"
    )}</p>
    ${
      story.lat && story.lon
        ? `<p><strong>Lokasi:</strong> (${story.lat}, ${story.lon})</p>`
        : ""
    }
  `;
    modal.style.display = "block";
    document.getElementById("close-modal").onclick = () => {
      modal.style.display = "none";
    };
    // Tutup modal jika klik di luar konten
    modal.onclick = function (e) {
      if (e.target === modal) modal.style.display = "none";
    };
  }


  renderSavedStories(stories) {
    const container = document.getElementById('saved-stories-container');
    container.innerHTML = '';
    if (!stories.length) {
      container.innerHTML = '<p>Tidak ada cerita tersimpan.</p>';
      return;
    }
    stories.forEach(story => {
      const card = document.createElement('div');
      card.className = 'saved_story_card';
      card.innerHTML = `
        <img src="${story.photoUrl}" alt="${story.title}" />
        <h3>${story.title}</h3>
        <p>${story.body}</p>
        <button class="btn-delete-saved" data-id="${story.id}">Hapus</button>
      `;
      // ===> Tambahkan event klik untuk detail
      card.addEventListener('click', (e) => {
        // Agar tombol hapus tidak ikut trigger detail
        if (e.target.classList.contains('btn-delete-saved')) return;
        if (this.presenter && this.presenter.showSavedStoryDetail) {
          this.presenter.showSavedStoryDetail(story);
        }
      });
      // Event hapus
      card.querySelector('.btn-delete-saved').addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.presenter && this.presenter.handleDeleteSavedStory) {
          this.presenter.handleDeleteSavedStory(story.id);
        }
      });
      container.appendChild(card);
    });
  }

  initializePushControls() {
    const btnSub = document.getElementById('btn-subscribe-push');
    const btnUnsub = document.getElementById('btn-unsubscribe-push');
    if (btnSub) {
      btnSub.addEventListener('click', () => {
        // Di view
        console.log('Tombol subscribe diklik');
        if (this.presenter) this.presenter.handleSubscribePush();
      });
    }
    if (btnUnsub) {
      btnUnsub.addEventListener('click', () => {
        if (this.presenter) this.presenter.handleUnsubscribePush();
      });
    }
  }
}
