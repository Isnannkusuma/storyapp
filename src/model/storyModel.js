export default class StoryModel {
  constructor() {
    this.baseUrl = "https://story-api.dicoding.dev/v1";
    this.token = localStorage.getItem("token") || null;
    this.VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
  }

  async login(email, password) {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.message);
    this.token = data.loginResult.token;
    localStorage.setItem("token", this.token);
    return data;
  }

  async register(name, email, password) {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.message);
    return data;
  }

  async getStories() {
    const response = await fetch(`${this.baseUrl}/stories`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    const data = await response.json();
    if (data.error) throw new Error(data.message);
    return data.listStory;
  }

  async getStoryDetail(id) {
    try {
      const response = await fetch(`${this.baseUrl}/stories/${id}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      const data = await response.json();

      if (data.error) {
        throw new Error(data.message);
      }

      return data.story;
    } catch (error) {
      throw error;
    }
  }

  async addStory(description, photo, lat, lon) {
    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);
    if (lat && lon) {
      formData.append("lat", lat);
      formData.append("lon", lon);
    }

    const response = await fetch(`${this.baseUrl}/stories`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}` },
      body: formData,
    });
    const data = await response.json();
    if (data.error) throw new Error(data.message);
    return data;
  }

  async subscribePushNotification(subscription) {
    console.log('subscribePushNotification dipanggil');
    const token = localStorage.getItem('token');
    const subscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.getKey('p256dh')
          ? btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh'))))
          : '',
        auth: subscription.getKey('auth')
          ? btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
          : ''
      }
    };

    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(subscriptionData)
    });

    const data = await response.json();
    console.log('Subscribe API response:', data); // Tambahkan ini

    if (!response.ok) {
      throw new Error('Gagal subscribe push notification');
    }
    return data;
  }

  async subscribePush() {
    console.log('subscribePush dipanggil');
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) throw new Error('Browser tidak mendukung Push Notification!');
    const reg = await navigator.serviceWorker.ready;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('Izin notifikasi ditolak!');
    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.VAPID_PUBLIC_KEY)
      });
    }
    await this.subscribePushNotification(subscription);
    console.log('subscribePushNotification selesai');
  }

  async unsubscribePush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) throw new Error('Browser tidak mendukung Push Notification!');
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    if (!subscription) throw new Error('Belum berlangganan notifikasi.');
    const token = localStorage.getItem('token');
    const endpoint = subscription.endpoint;
    const res = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ endpoint })
    });
    const data = await res.json();
    console.log('Unsubscribe response:', data); // Tambahkan ini
    if (!res.ok || data.error) {
      throw new Error(data.message || 'Gagal unsubscribe push notification');
    }
    await subscription.unsubscribe();
  }

  // Helper
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  logout() {
    this.token = null;
    localStorage.removeItem("token");
  }

  isLoggedIn() {
    return !!this.token;
  }
}
