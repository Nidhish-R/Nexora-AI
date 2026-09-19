// ============================================================
// NEXORA AI V35
// JARVIS VOICE CORE
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("🤖 NEXORA AI V35 - JARVIS VOICE CORE");

    // ========================================================
    // ELEMENTS
    // ========================================================

    const chatBox = document.getElementById("chatBox");
    const userInput = document.getElementById("userInput");
    const recentChats = document.getElementById("recentChats");

    const voiceBtn = document.getElementById("voiceBtn");
    const sendButton = document.getElementById("sendButton");
    const newChatButton = document.getElementById("newChat");

    let currentChatId = null;

    let recognition = null;
    let isListening = false;
    let isSpeaking = false;
    let isSendingMessage = false;
    let isCreatingChat = false;

    // ============================================================
// V38 COMMAND CENTER INDICATOR
// ============================================================

function createCommandCenter() {

    if (
        document.getElementById(
            "nexoraCommandCenter"
        )
    ) {
        return;
    }

    const panel =
        document.createElement("div");

    panel.id =
        "nexoraCommandCenter";

    panel.innerHTML = `
        <div class="nexora-core">
            <span class="core-dot"></span>
            <span class="core-ring"></span>
        </div>

        <div class="command-info">
            <div class="command-title">
                NEXORA
            </div>

            <div
                id="nexoraActivity"
                class="command-activity"
            >
                ONLINE
            </div>
        </div>
    `;

    document.body.appendChild(panel);
}


// ============================================================
// COMMAND CENTER ACTIVITY
// ============================================================

function setActivity(activity) {

    const activityElement =
        document.getElementById(
            "nexoraActivity"
        );

    if (!activityElement) {
        return;
    }

    activityElement.textContent =
        activity;

    activityElement.classList.remove(
        "activity-online",
        "activity-listening",
        "activity-thinking",
        "activity-speaking"
    );

    switch (activity) {

        case "LISTENING":
            activityElement.classList.add(
                "activity-listening"
            );
            break;

        case "THINKING":
            activityElement.classList.add(
                "activity-thinking"
            );
            break;

        case "SPEAKING":
            activityElement.classList.add(
                "activity-speaking"
            );
            break;

        default:
            activityElement.classList.add(
                "activity-online"
            );
    }
}


    // ============================================================
// NEXORA V38 COMMAND CENTER STATUS
// ============================================================

function setStatus(text) {

    const status =
        document.getElementById("zyroStatus");

    if (!status) return;

    status.textContent = text;

    // Remove old state classes
    status.classList.remove(
        "nexora-online",
        "nexora-listening",
        "nexora-thinking",
        "nexora-speaking",
        "nexora-stopped"
    );

    const lowerText =
        (text || "").toLowerCase();

    if (lowerText.includes("listening")) {

        status.classList.add(
            "nexora-listening"
        );

    } else if (
        lowerText.includes("thinking")
    ) {

        status.classList.add(
            "nexora-thinking"
        );

    } else if (
        lowerText.includes("speaking")
    ) {

        status.classList.add(
            "nexora-speaking"
        );

    } else if (
        lowerText.includes("stopped")
    ) {

        status.classList.add(
            "nexora-stopped"
        );

    } else {

        status.classList.add(
            "nexora-online"
        );
    }
}

    // ========================================================
    // SAFE HTML
    // ========================================================

    function escapeHTML(text) {

        const div = document.createElement("div");

        div.innerText = text || "";

        return div.innerHTML;
    }


    function cleanNexoraHTML(text) {

        const div = document.createElement("div");

        div.innerText = text || "";

        let safe = div.innerHTML;

        safe = safe.replace(/&lt;br&gt;/gi, "<br>");
        safe = safe.replace(/&lt;br\s*\/&gt;/gi, "<br>");

        safe = safe.replace(/&lt;b&gt;/gi, "<b>");
        safe = safe.replace(/&lt;\/b&gt;/gi, "</b>");

        return safe;
    }


    // ========================================================
    // ADD MESSAGE
    // ========================================================

    function addMessage(sender, text, isUser = false) {

        if (!chatBox) return;

        const wrapper = document.createElement("div");

        wrapper.className = isUser
            ? "message user-message"
            : "message nexora-message";

        const safeText = isUser
            ? escapeHTML(text)
            : cleanNexoraHTML(text);

        wrapper.innerHTML = `
            <div class="message-content">
                <div class="message-sender">
                    ${isUser ? "YOU" : "NEXORA"}
                </div>

                <div class="message-text">
                    ${safeText}
                </div>
            </div>
        `;

        chatBox.appendChild(wrapper);

        chatBox.scrollTop = chatBox.scrollHeight;
    }


    // ========================================================
    // TYPING INDICATOR
    // ========================================================

    function showTyping() {

        if (!chatBox) return;

        removeTyping();

        const typing = document.createElement("div");

        typing.id = "nexoraTyping";

        typing.className = "message nexora-message";

        typing.innerHTML = `
            <div class="message-content">
                <div class="message-sender">
                    NEXORA
                </div>

                <div class="message-text">
                    <span>Thinking</span> 🤖
                    <span class="typing-dots">...</span>
                </div>
            </div>
        `;

        chatBox.appendChild(typing);

        chatBox.scrollTop = chatBox.scrollHeight;
    }


    function removeTyping() {

        const typing =
            document.getElementById("nexoraTyping");

        if (typing) {
            typing.remove();
        }
    }


    // ========================================================
    // JARVIS VOICE SETTINGS
    // ========================================================

    function voiceEnabled() {

        const setting =
            localStorage.getItem("zyroSound");

        return setting !== "off";
    }


    // ========================================================
    // STOP SPEAKING
    // ========================================================

    function stopSpeaking() {

        if ("speechSynthesis" in window) {

            speechSynthesis.cancel();

            isSpeaking = false;

            setStatus("NEXORA is online.");
        }
    }


    // ========================================================
    // NEXORA SPEAK
    // ========================================================

    function speak(text) {

        if (!voiceEnabled()) {
            return;
        }

        if (!("speechSynthesis" in window)) {

            console.log(
                "Speech synthesis is not supported."
            );

            return;
        }

        stopSpeaking();

        // Remove simple HTML
        const cleanText = text
            .replace(/<br\s*\/?>/gi, " ")
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/gi, " ")
            .trim();

        if (!cleanText) {
            return;
        }

        const utterance =
            new SpeechSynthesisUtterance(cleanText);

        utterance.lang = "en-US";

        // JARVIS-style voice settings
        utterance.rate = 0.92;
        utterance.pitch = 0.88;
        utterance.volume = 1;

        utterance.onstart = () => {

    isSpeaking = true;

    setActivity("SPEAKING");

    setVoiceStatus(
        "🔊 NEXORA is speaking..."
    );
};

       utterance.onend = () => {

    isSpeaking = false;

    setActivity("ONLINE");

    setVoiceStatus("");
};
       utterance.onerror = () => {

    isSpeaking = false;

    setActivity("ONLINE");

    setVoiceStatus("");
};

} 

    // ========================================================
    // STOP NEXORA BUTTON
    // ========================================================

    const stopButton =
        document.getElementById("stopNexora");

    if (stopButton) {

        stopButton.addEventListener(
            "click",
            () => {

                stopSpeaking();

                if (
                    recognition &&
                    isListening
                ) {
                    recognition.stop();
                }

                isListening = false;

                setVoiceStatus(
                    "🛑 NEXORA stopped."
                );

                setTimeout(() => {
                    setVoiceStatus("");
                }, 1500);
            }
        );
    }

    // ============================================================
// NEXORA V36 JARVIS ACTION SYSTEM
// ============================================================

function detectJarvisAction(message) {

    const text = (message || "")
        .trim()
        .toLowerCase();

    // --------------------------------------------------------
    // NEW CHAT
    // --------------------------------------------------------

    const newChatCommands = [
        "start a new chat",
        "start new chat",
        "new chat",
        "create a new chat",
        "create new chat",
        "open a new chat",
        "open new chat",
        "begin a new chat"
    ];

    if (newChatCommands.includes(text)) {
        return "new_chat";
    }


    // --------------------------------------------------------
    // CLEAR SCREEN
    // --------------------------------------------------------

    const clearCommands = [
        "clear the screen",
        "clear screen",
        "clear this chat",
        "clear chat",
        "clear conversation",
        "clear the conversation"
    ];

    if (clearCommands.includes(text)) {
        return "clear_screen";
    }


    // --------------------------------------------------------
    // STOP NEXORA
    // --------------------------------------------------------

    const stopCommands = [
        "stop nexora",
        "stop",
        "stop speaking",
        "stop talking",
        "be quiet",
        "quiet nexora"
    ];

    if (stopCommands.includes(text)) {
        return "stop";
    }


    // --------------------------------------------------------
    // START LISTENING
    // --------------------------------------------------------

    const listenCommands = [
        "start listening",
        "listen",
        "listen to me",
        "activate voice mode",
        "start voice mode"
    ];

    if (listenCommands.includes(text)) {
        return "listen";
    }


    return null;
}


// ============================================================
// JARVIS ACTION HANDLER
// ============================================================

async function executeJarvisAction(action) {

    // --------------------------------------------------------
    // STOP
    // --------------------------------------------------------

    if (action === "stop") {

        stopSpeaking();

        if (
            recognition &&
            isListening
        ) {
            recognition.stop();
        }

        isListening = false;

        setVoiceStatus(
            "🛑 NEXORA stopped."
        );

        setTimeout(() => {
            setVoiceStatus("");
        }, 1500);

        setStatus(
            "NEXORA is online."
        );

        return true;
    }


    // --------------------------------------------------------
    // CLEAR SCREEN
    // --------------------------------------------------------

    if (action === "clear_screen") {

        stopSpeaking();

        if (chatBox) {

            chatBox.innerHTML = "";

            addMessage(
                "NEXORA",
                "🧹 Screen cleared brooo! 🤖"
            );
        }

        setStatus(
            "NEXORA is online."
        );

        return true;
    }


    // --------------------------------------------------------
    // NEW CHAT
    // --------------------------------------------------------

    if (action === "new_chat") {

        stopSpeaking();

        if (isCreatingChat) {
            return true;
        }

        isCreatingChat = true;

        try {

            const response =
                await fetch(
                    "/chat/new",
                    {
                        method: "POST"
                    }
                );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {

                addMessage(
                    "NEXORA",
                    "⚠️ I couldn't create a new chat."
                );

                return true;
            }

            currentChatId =
                data.chat_id;

            if (chatBox) {

                chatBox.innerHTML = "";

                addMessage(
                    "NEXORA",
                    "🆕 New chat ready brooo! 🤖🔥"
                );
            }

           createCommandCenter();

setActivity("ONLINE");

loadChats();

setStatus(
    "NEXORA is online."
);

        } catch (error) {

            console.error(
                "❌ JARVIS NEW CHAT ERROR:",
                error
            );

            addMessage(
                "NEXORA",
                "⚠️ I couldn't create the new chat."
            );

        } finally {

            isCreatingChat = false;
        }

        return true;
    }


    // --------------------------------------------------------
    // LISTEN
    // --------------------------------------------------------

    if (action === "listen") {

        if (!recognition) {

            addMessage(
                "NEXORA",
                "⚠️ Voice recognition isn't supported in this browser."
            );

            return true;
        }

        if (isListening) {

            setVoiceStatus(
                "🎤 Already listening..."
            );

            return true;
        }

        stopSpeaking();

        try {

            recognition.start();

        } catch (error) {

            console.error(
                "❌ JARVIS LISTEN ERROR:",
                error
            );
        }

        return true;
    }


    return false;
}


    // ========================================================
    // SEND MESSAGE
    // ========================================================

    async function sendMessage() {

        if (isSendingMessage) {
            return;
        }

        const message =
            userInput?.value.trim();

        if (!message) {
            return;
        }

        // ========================================================
// JARVIS ACTION CHECK
// ========================================================

const jarvisAction =
    detectJarvisAction(message);

if (jarvisAction) {

    if (userInput) {
        userInput.value = "";
    }

    await executeJarvisAction(
        jarvisAction
    );

    return;
}

        isSendingMessage = true;

        if (userInput) {
            userInput.value = "";
        }

        stopSpeaking();

        addMessage(
            "YOU",
            message,
            true
        );
showTyping();

setActivity("THINKING");

setStatus(
    "NEXORA is thinking..."
);


        try {

            const response =
                await fetch("/chat", {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: message,
                        chat_id: currentChatId
                    })
                });

            const data =
                await response.json();

            removeTyping();

            if (!response.ok || !data.success) {

                const errorMessage =
                    data.message ||
                    "Something went wrong.";

                addMessage(
                    "NEXORA",
                    "⚠️ " + errorMessage
                );

                setStatus("NEXORA is online.");

                return;
            }

            // Save current chat
            if (data.chat_id) {
                currentChatId = data.chat_id;
            }

            const botResponse =
                data.response ||
                data.message ||
                "I don't have a response yet.";

            addMessage(
                "NEXORA",
                botResponse
            );

            // JARVIS VOICE
            speak(botResponse);

            await loadChats();

            setStatus("NEXORA is online.");

        } catch (error) {

            console.error(
                "❌ CHAT ERROR:",
                error
            );

            removeTyping();

            addMessage(
                "NEXORA",
                "⚠️ I couldn't connect right now. Please check the server."
            );

            setStatus("Connection problem.");

        } finally {

            isSendingMessage = false;
        }
    }

    


    // ========================================================
    // SEND BUTTON
    // ========================================================

    if (sendButton) {

        sendButton.addEventListener(
            "click",
            sendMessage
        );
    }


    // ========================================================
    // ENTER KEY
    // ========================================================

    if (userInput) {

        userInput.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendMessage();
                }
            }
        );
    }


    // ========================================================
    // NEW CHAT
    // ========================================================

    if (newChatButton) {

        newChatButton.addEventListener(
            "click",
            async () => {

                if (isCreatingChat) {
                    return;
                }

                isCreatingChat = true;

                stopSpeaking();

                try {

                    const response =
                        await fetch(
                            "/chat/new",
                            {
                                method: "POST"
                            }
                        );

                    const data =
                        await response.json();

                    if (!response.ok ||
                        !data.success) {

                        alert(
                            data.message ||
                            "Could not create chat."
                        );

                        return;
                    }

                    currentChatId =
                        data.chat_id;

                    if (chatBox) {

                        chatBox.innerHTML = "";

                        addMessage(
                            "NEXORA",
                            "Welcome back brooo! 🤖🔥<br><br>" +
                            "JARVIS MODE is ready.<br><br>" +
                            "Type something or use 🎤 Voice Mode!"
                        );
                    }

                    await loadChats();

                    setStatus(
                        "NEXORA is online."
                    );

                } catch (error) {

                    console.error(
                        "❌ NEW CHAT ERROR:",
                        error
                    );

                } finally {

                    isCreatingChat = false;
                }
            }
        );
    }


    // ========================================================
    // CHAT LIST
    // ========================================================

    function normalizeChats(data) {

        if (Array.isArray(data)) {
            return data;
        }

        if (data && Array.isArray(data.chats)) {
            return data.chats;
        }

        return [];
    }


    async function loadChats() {

        if (!recentChats) {
            return;
        }

        try {

            const response =
                await fetch("/chats");

            const data =
                await response.json();

            const chats =
                normalizeChats(data);

            recentChats.innerHTML = "";

            if (!chats.length) {

                recentChats.innerHTML = `
                    <div class="no-chats">
                        No recent chats
                    </div>
                `;

                return;
            }

            chats.forEach(chat => {

                const chatId =
                    chat.id;

                const title =
                    chat.title ||
                    "New Chat";

                const row =
                    document.createElement("div");

                row.className =
                    "chat-row";

                if (
                    String(chatId) ===
                    String(currentChatId)
                ) {
                    row.classList.add(
                        "active-chat"
                    );
                }

                row.innerHTML = `
                    <span class="chat-title">
                        💬 ${escapeHTML(title)}
                    </span>

                    <button
                        class="delete-chat-btn"
                        title="Delete chat"
                        type="button"
                    >
                        🗑️
                    </button>
                `;

                // Open chat
                row.addEventListener(
                    "click",
                    () => {
                        openChat(chatId);
                    }
                );

                // Delete chat
                const deleteButton =
                    row.querySelector(
                        ".delete-chat-btn"
                    );

                deleteButton.addEventListener(
                    "click",
                    async (event) => {

                        event.stopPropagation();

                        const confirmed =
                            confirm(
                                "Delete this chat?"
                            );

                        if (!confirmed) {
                            return;
                        }

                        try {

                            const deleteResponse =
                                await fetch(
                                    `/chat/${chatId}`,
                                    {
                                        method:
                                            "DELETE"
                                    }
                                );

                            const deleteData =
                                await deleteResponse.json();

                            if (
                                !deleteResponse.ok ||
                                !deleteData.success
                            ) {

                                alert(
                                    deleteData.message ||
                                    "Could not delete chat."
                                );

                                return;
                            }

                            if (
                                String(chatId) ===
                                String(currentChatId)
                            ) {

                                currentChatId =
                                    null;

                                if (chatBox) {

                                    chatBox.innerHTML = "";

                                    addMessage(
                                        "NEXORA",
                                        "Chat deleted brooo 🗑️🤖"
                                    );
                                }
                            }

                            await loadChats();

                        } catch (error) {

                            console.error(
                                "❌ DELETE ERROR:",
                                error
                            );
                        }
                    }
                );

                recentChats.appendChild(row);
            });

        } catch (error) {

            console.error(
                "❌ LOAD CHATS ERROR:",
                error
            );
        }
    }


    // ========================================================
    // MESSAGE NORMALIZER
    // ========================================================

    function normalizeMessage(message) {

        return {

            role:
                message.role ||
                message.sender ||
                "assistant",

            content:
                message.content ??
                message.message ??
                ""
        };
    }


    // ========================================================
    // OPEN CHAT
    // ========================================================

    async function openChat(chatId) {

        if (!chatId) {
            return;
        }

        stopSpeaking();

        try {

            const response =
                await fetch(
                    `/chat/${chatId}`
                );

            const data =
                await response.json();

            if (!response.ok ||
                !data.success) {

                console.error(
                    "Could not open chat:",
                    data.message
                );

                return;
            }

            currentChatId =
                chatId;

            if (chatBox) {
                chatBox.innerHTML = "";
            }

            const messages =
                data.messages || [];

            messages.forEach(message => {

                const normalized =
                    normalizeMessage(
                        message
                    );

                const isUser =
                    normalized.role === "user";

                addMessage(
                    isUser
                        ? "YOU"
                        : "NEXORA",

                    normalized.content,

                    isUser
                );
            });

            await loadChats();

        } catch (error) {

            console.error(
                "❌ OPEN CHAT ERROR:",
                error
            );
        }
    }


    // ========================================================
    // JARVIS VOICE RECOGNITION
    // ========================================================

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (SpeechRecognition) {

        recognition =
            new SpeechRecognition();

        recognition.lang =
            "en-US";

        recognition.continuous =
            false;

        recognition.interimResults =
            false;

        recognition.maxAlternatives =
            1;


        // ----------------------------------------------------
        // VOICE START
        // ----------------------------------------------------

        recognition.onstart = () => {

    isListening = true;

    setActivity("LISTENING");

    setVoiceStatus(
        "🎤 Listening..."
    );

    if (voiceBtn) {

        voiceBtn.innerHTML =
            "🛑 Stop Listening";
    }

    setStatus(
        "NEXORA is listening..."
    );
};


        // ----------------------------------------------------
        // VOICE RESULT
        // ----------------------------------------------------

        recognition.onresult =
            (event) => {

                const transcript =
                    event.results[0][0].transcript;

                console.log(
                    "🎤 Heard:",
                    transcript
                );

                if (userInput) {

                    userInput.value =
                        transcript;
                }

                setVoiceStatus(
                    "🧠 Got it!"
                );

                // Automatically send
                setTimeout(() => {

                    setVoiceStatus("");

                    sendMessage();

                }, 300);
            };


        // ----------------------------------------------------
        // VOICE ERROR
        // ----------------------------------------------------

        recognition.onerror =
            (event) => {

                console.error(
                    "🎤 VOICE ERROR:",
                    event.error
                );

                isListening = false;

                if (voiceBtn) {

                    voiceBtn.innerHTML =
                        "🎤 Voice Mode";
                }

                if (
                    event.error ===
                    "not-allowed"
                ) {

                    setVoiceStatus(
                        "⚠️ Microphone permission denied."
                    );

                } else if (
                    event.error ===
                    "no-speech"
                ) {

                    setVoiceStatus(
                        "🎤 I didn't hear anything."
                    );

                } else {

                    setVoiceStatus(
                        "⚠️ Voice input error."
                    );
                }

                setTimeout(() => {

                    setVoiceStatus("");

                }, 2000);

                setStatus(
                    "NEXORA is online."
                );
            };


        // ----------------------------------------------------
        // VOICE END
        // ----------------------------------------------------

        recognition.onend = () => {

            isListening = false;

            if (voiceBtn) {

                voiceBtn.innerHTML =
                    "🎤 Voice Mode";
            }

            if (!isSpeaking) {

                setStatus(
                    "NEXORA is online."
                );
            }
        };


        // ----------------------------------------------------
        // VOICE BUTTON
        // ----------------------------------------------------

        if (voiceBtn) {

            voiceBtn.addEventListener(
                "click",
                () => {

                    if (isSendingMessage) {
                        return;
                    }

                    if (isListening) {

                        recognition.stop();

                        return;
                    }

                    stopSpeaking();

                    try {

                        recognition.start();

                    } catch (error) {

                        console.error(
                            "🎤 START ERROR:",
                            error
                        );
                    }
                }
            );
        }

    } else {

        console.warn(
            "⚠️ Speech Recognition is not supported by this browser."
        );

        if (voiceBtn) {

            voiceBtn.addEventListener(
                "click",
                () => {

                    alert(
                        "Voice recognition is not supported in this browser. Try Google Chrome."
                    );
                }
            );
        }
    }


    // ========================================================
    // INITIALIZE
    // ========================================================

    loadChats();

    setStatus(
        "NEXORA is online."
    );

   console.log(
    "🔥 NEXORA V35 JARVIS VOICE CORE READY"
);

});