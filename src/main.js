import StoryModel from "./model/storyModel.js";
import StoryView from "./view/storyView.js";
import StoryPresenter from "./presenter/storyPresenter.js";
import { saveData, getAllData, deleteData } from './idb.js';

// Inisialisasi MVP
const model = new StoryModel();
const view = new StoryView();
const presenter = new StoryPresenter(model, view);

view.setPresenter(presenter);
presenter.init();
view.initializePushControls();

const navSaved = document.getElementById('nav-saved-stories');
if (navSaved) {
  navSaved.addEventListener('click', (e) => {
    e.preventDefault();
    presenter.showSavedStories(); // showPage sudah di dalam showSavedStories
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => {
        console.log('Service worker registered!', reg);
      })
      .catch(err => {
        console.error('Service worker registration failed:', err);
      });
  });
}





// Helper function
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}



// Contoh login dan simpan token
async function login(email, password) {
  const response = await fetch('https://story-api.dicoding.dev/v1/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (data.loginResult && data.loginResult.token) {
    localStorage.setItem('accessToken', data.loginResult.token);
    alert('Login berhasil!');
  } else {
    alert('Login gagal!');
  }
}

document.getElementById('login-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  await login(email, password);
});