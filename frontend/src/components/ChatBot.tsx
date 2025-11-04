import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "¡Gracias por contactar a Geko! Continuemos nuestra conversación en WhatsApp para poder usar el modo de voz.",
      sender: "bot",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
    };

    setMessages((prev) => [...prev, newMessage]);

    setTimeout(() => {
      const botResponse: Message = {
        id: newMessage.id + 1,
        text:
          "¡Gracias por contactar a Geko! Continuemos nuestra conversación en WhatsApp para poder usar el modo de voz.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);

    setInputMessage("");
  };

  const handleWhatsAppRedirect = () => {
    window.open("http://wa.me/528128587932", "_blank");
  };

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          type="button"
          aria-label="Abrir asistente"
          onClick={() => setIsOpen(true)}
          className="fixed right-4 bottom-20 z-50 inline-flex items-center justify-center h-14 w-14 rounded-full shadow-xl"
          style={{
            background:
              "linear-gradient(135deg, #29BF12 0%, #FFBA49 100%)",
            color: "#fff",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          }}
>
          <MessageCircle size={22} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed right-4 bottom-20 z-50 w-80 h-96"
          role="dialog"
          aria-label="Asistente SmartStore"
        >
          <div className="relative group h-full rounded-2xl border border-white/50 bg-white/90 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden">
            {/* Subtle glow border */}
            <div className="pointer-events-none absolute -inset-[1px] rounded-2xl opacity-80 blur-[2px]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(41,191,18,0.6), rgba(255,186,73,0.5))",
              }}
            />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/60">
              <div className="flex items-center gap-2">
                <MessageCircle className="text-[#29BF12]" size={18} />
                <span className="text-sm font-semibold text-[#1a8a0a]">
                  Asistente SmartStore
                </span>
              </div>
              <button
                aria-label="Cerrar"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-white/70"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="relative z-10 flex-1 overflow-y-auto px-3 py-2 space-y-2"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-3 py-2 text-sm shadow ${
                      m.sender === "user"
                        ? "bg-[#E9F8EA] text-gray-900 border border-white/60"
                        : "bg-white/85 text-gray-900 border border-white/60"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="relative z-10 px-3 pb-3 pt-2 border-t border-white/60">
              <div className="flex items-center gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="bg-white/95"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="h-10 w-10 inline-flex items-center justify-center"
                  style={{ backgroundColor: "#29BF12" }}
                  aria-label="Enviar"
                >
                  <Send size={16} />
                </Button>
              </div>
              <button
                onClick={handleWhatsAppRedirect}
                className="mt-2 w-full h-9 rounded-lg text-sm font-medium text-white shadow-md"
                style={{
                  background: "linear-gradient(135deg, #29BF12 0%, #FFBA49 100%)",
                }}
              >
Continuar en WhatsApp (modo voz)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
