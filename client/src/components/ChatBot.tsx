import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, X, Bot, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Message, Conversation, ChatMessage } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";

export function ChatBot() {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: conversation } = useQuery<Conversation & { messages: ChatMessage[] }>({
    queryKey: ["/api/conversations", activeConversationId],
    enabled: activeConversationId !== null,
  });

  const createConversation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/conversations", { title: "Customer Support" });
      return res.json();
    },
    onSuccess: (data) => {
      setActiveConversationId(data.id);
    },
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (activeConversationId === null) return;
      
      const res = await fetch(`/api/conversations/${activeConversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, language }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let assistantMessage = "";

      // Optimistically add user message if we wanted, but the backend handles it.
      // For simplicity in this fast mode, we'll just wait for the stream.
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                assistantMessage += data.content;
                // Force a re-render or update state if needed. 
                // For now, we'll invalidate after completion for simplicity.
              }
              if (data.done) {
                queryClient.invalidateQueries({ queryKey: ["/api/conversations", activeConversationId] });
              }
            } catch (e) {}
          }
        }
      }
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages]);

  const handleOpen = () => {
    setIsOpen(true);
    if (!activeConversationId) {
      createConversation.mutate();
    }
  };

  const handleSubmit = (e?: React.FormEvent, manualContent?: string) => {
    e?.preventDefault();
    const content = manualContent || input;
    if (!content.trim() || sendMessage.isPending) return;
    setInput("");
    sendMessage.mutate(content);
  };

  const QUICK_OPTIONS = language === "hi" ? [
    "अनुशंसित चाय",
    "मेरे ऑर्डर को ट्रैक करें",
    "हमारे बगीचे के बारे में",
    "सहायता",
  ] : [
    "Recommended Teas",
    "Track my Order",
    "About our Garden",
    "Support",
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] animate-in fade-in duration-300" 
          onClick={() => setIsOpen(false)}
        />
      )}
      <div className={`fixed bottom-6 right-6 ${isOpen ? "z-[70]" : "z-50"}`}>
        {!isOpen ? (
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-2xl hover:scale-110 transition-transform bg-primary text-primary-foreground border-4 border-white/20"
          onClick={handleOpen}
          data-testid="button-chat-open"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-80 md:w-96 h-[550px] flex flex-col shadow-2xl border-primary/20 animate-in slide-in-from-bottom-5 overflow-hidden">
          <CardHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0 bg-primary text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-serif">{language === "hi" ? "सहायता चैट" : "Support Chat"}</CardTitle>
                <p className="text-[10px] opacity-80 uppercase tracking-widest">{language === "hi" ? "हमेशा ऑनलाइन" : "Always Online"}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden bg-muted/5">
            <ScrollArea className="h-full p-4" ref={scrollRef}>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-white border p-3 rounded-2xl rounded-tl-none text-sm max-w-[85%] shadow-sm">
                    {language === "hi" ? "नमस्ते! मैं आपका चाय क्राफ्ट सहायक हूँ। मैं आज आपकी क्या सहायता कर सकता हूँ?" : "Hello! I'm your Chai Craft assistant. How can I help you today?"}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pl-10 mb-2">
                  {QUICK_OPTIONS.map((option) => (
                    <Button
                      key={option}
                      variant="outline"
                      size="sm"
                      className="text-[11px] rounded-full h-7 border-primary/20 hover:bg-primary hover:text-primary-foreground"
                      onClick={() => handleSubmit(undefined, option)}
                      disabled={sendMessage.isPending}
                    >
                      {option}
                    </Button>
                  ))}
                </div>

                {conversation?.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      m.role === "user" ? "bg-primary text-primary-foreground shadow-md" : "bg-primary/10 text-primary"
                    }`}>
                      {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm max-w-[85%] shadow-sm ${
                      m.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-white border rounded-tl-none"
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {sendMessage.isPending && (
                  <div className="flex gap-2 animate-pulse">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-white border p-3 rounded-2xl rounded-tl-none text-sm shadow-sm">
                      {language === "hi" ? "जवाब तैयार किया जा रहा है..." : "Crafting a response..."}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 border-t bg-white">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                placeholder={language === "hi" ? "चाय, ऑर्डर के बारे में पूछें..." : "Ask about teas, orders..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="rounded-full bg-muted/30 border-none focus-visible:ring-primary"
                data-testid="input-chat"
              />
              <Button size="icon" type="submit" disabled={!input.trim() || sendMessage.isPending} className="rounded-full">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
    </>
  );
}
