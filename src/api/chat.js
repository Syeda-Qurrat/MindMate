const API_URL = "http://127.0.0.1:8000";

export const sendMessageToMindMate = async (messages) => {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Unable to connect to MindMate.");
  }

  return data.reply;
};