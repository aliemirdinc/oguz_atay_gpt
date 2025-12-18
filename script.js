import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

const SPACE_ID = "darknight42/oguz-atay-gpt"; 

// KONTROL MEKANİZMASI: Aynı anda iki soru sorulmasın
let isWaiting = false;

async function sendMessage() {
    const text = userInput.value.trim();
    
    // Eğer kutu boşsa VEYA zaten cevap bekleniyorsa (isWaiting=true) dur.
    if (text === "" || isWaiting) return;

    // 1. Durumu 'Bekliyor' yap ve tuşları kilitle
    isWaiting = true;
    userInput.disabled = true;
    sendBtn.disabled = true;

    // Kullanıcı mesajını ekrana bas
    addMessage(text, 'user');
    userInput.value = '';

    // 2. "Yazıyor..." baloncuğunu ekle (ve ID'sini sakla ki sonra silelim)
    const loadingBubbleId = addLoadingBubble();

    try {
        const client = await Client.connect(SPACE_ID);
        
        // Tahmin iste
        const result = await client.predict("/generate_response", [ text, 200 ]);
        
        // 3. Cevap geldi! Önce "Yazıyor..." balonunu sil
        removeMessage(loadingBubbleId);

        // Gerçek cevabı ekle
        const botResponse = result.data[0];
        addMessage(botResponse, 'bot');

    } catch (error) {
        console.error("Hata:", error);
        removeMessage(loadingBubbleId); // Hatada da balonu sil
        addMessage("Bağlantı koptu azizim... Kelimelerim tükendi.", 'bot');
    } finally {
        // 4. Her şey bitince kilidi aç
        isWaiting = false;
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus(); // İmleci tekrar kutuya odakla
    }
}

// Standart Mesaj Ekleme Fonksiyonu
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

// "Yazıyor..." Baloncuğu Ekleme Fonksiyonu
function addLoadingBubble() {
    const id = "loading-" + Date.now(); // Benzersiz bir isim ver
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'bot-message');
    messageDiv.id = id; // Sonradan bulup silmek için ID veriyoruz

    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.innerText = 'O'; 

    const content = document.createElement('div');
    content.classList.add('content');
    
    // Üç nokta HTML yapısı
    content.innerHTML = `
        <div class="typing-indicator">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    `;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    return id; // ID'yi geri döndür ki silerken kullanalım
}

// Mesaj Silme Fonksiyonu (Yükleniyor balonunu silmek için)
function removeMessage(id) {
    const element = document.getElementById(id);
    if (element) {
        element.remove();
    }
}

sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});