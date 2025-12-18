// Hugging Face bağlantı aracını yüklüyoruz
import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Senin Hugging Face Alanının Adresi
const SPACE_ID = "darknight42/oguz-atay-gpt"; 

async function sendMessage() {
    const text = userInput.value.trim();
    if (text === "") return;

    // 1. Kullanıcı mesajını ekrana bas
    addMessage(text, 'user');
    userInput.value = '';
    
    // Yükleniyor efekti verelim (Opsiyonel: Butonu pasif yapabilirsin)
    sendBtn.disabled = true;

    try {
        const client = await Client.connect(SPACE_ID);
        
        // Rastgelelik ekle: Cevap uzunluğu 150 ile 300 harf arasında değişsin.
        // Böylece bazen kısa ve öz, bazen uzun ve detaylı konuşur.
        const randomLength = Math.floor(Math.random() * (300 - 150 + 1)) + 150;

        // Tahmin iste (Sabit 200 yerine randomLength yolluyoruz)
        const result = await client.predict("/generate_response", [ text, randomLength ]);

        // Gelen cevabı al (Gradio genelde veriyi 'data' dizisi içinde döner)
        const botResponse = result.data[0];

        // 3. Cevabı ekrana bas
        addMessage(botResponse, 'bot');

    } catch (error) {
        console.error("Hata:", error);
        addMessage("Bağlantı kurulamadı azizim... Bir hata var.", 'bot');
    } finally {
        sendBtn.disabled = false;
    }
}

// Ekrana mesaj kutusu ekleyen fonksiyon (Tasarım aynı kalıyor)
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);

    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.innerText = sender === 'user' ? 'S' : 'O'; 

    const content = document.createElement('div');
    content.classList.add('content');
    content.innerText = text;

    if (sender === 'user') {
        messageDiv.appendChild(content);
        messageDiv.appendChild(avatar);
    } else {
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
    }

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Tıklama ve Enter tuşu olayları
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});