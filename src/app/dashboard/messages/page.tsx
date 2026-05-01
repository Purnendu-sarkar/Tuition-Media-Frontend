"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Send, Search, MessageSquare, Info } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { messageApi, Conversation, ChatMessage } from "@/lib/api/messages";
import { publicEnv } from "@/lib/public-env";

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (status === "authenticated" && session?.user?.accessToken) {
      fetchConversations(session.user.accessToken);

      // Initialize Socket.io
      const backendUrl = publicEnv.NEXT_PUBLIC_API_BASE_URL.replace("/api/v1", "");
      const newSocket = io(backendUrl);
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Connected to chat server");
      });

      newSocket.on("new_message", (message: ChatMessage) => {
        setMessages((prev) => [...prev, message]);
        // Also update conversations list latest message preview
        setConversations(prevConvs => prevConvs.map(conv => {
          if (conv.id === message.conversationId) {
            return { ...conv, messages: [message], updatedAt: new Date().toISOString() };
          }
          return conv;
        }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [status, session]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async (token: string) => {
    try {
      const res = await messageApi.getConversations(token);
      setConversations(res.conversations);
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    }
  };

  const handleSelectConversation = async (conv: Conversation) => {
    if (!session?.user?.accessToken || !socket) return;
    
    try {
      const res = await messageApi.getConversationHistory(session.user.accessToken, conv.id);
      setActiveChat(res.conversation);
      setMessages(res.conversation.messages);
      
      // Join the socket room
      socket.emit("join_conversation", conv.id);
    } catch (error) {
      console.error("Failed to fetch conversation history", error);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !socket || !session?.user) return;

    socket.emit("send_message", {
      conversationId: activeChat.id,
      content: newMessage.trim(),
      senderId: session.user.id
    });

    setNewMessage("");
  };

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participantOneId === session?.user?.id ? conv.participantTwo : conv.participantOne;
  };

  if (status === "loading") {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-5rem)]">
      <Card className="h-full flex overflow-hidden border-border bg-surface shadow-sm">
        
        {/* Left Pane: Conversation List */}
        <div className={`w-full md:w-1/3 flex flex-col border-r border-border ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-border bg-background/50">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" /> Messages
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-9 bg-surface" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm">No active conversations.</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const otherUser = getOtherParticipant(conv);
                const lastMessage = conv.messages[0];
                const isActive = activeChat?.id === conv.id;

                return (
                  <div 
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-4 border-b border-border/50 cursor-pointer transition-colors ${
                      isActive ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-muted/30 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-muted overflow-hidden shrink-0 border border-border">
                        {otherUser.image ? (
                          <img src={otherUser.image} alt={otherUser.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-primary/20 text-primary font-bold">
                            {otherUser.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-semibold text-foreground truncate">{otherUser.name}</h3>
                          {lastMessage && (
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                              {new Date(lastMessage.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage ? (
                            <>
                              {lastMessage.senderId === session?.user?.id ? 'You: ' : ''}
                              {lastMessage.content}
                            </>
                          ) : (
                            <span className="italic">No messages yet</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Chat */}
        <div className={`w-full md:w-2/3 flex flex-col bg-background/30 ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="md:hidden mr-2"
                    onClick={() => setActiveChat(null)}
                  >
                    &larr; Back
                  </Button>
                  <div className="h-10 w-10 rounded-full bg-muted overflow-hidden border border-border">
                    {getOtherParticipant(activeChat).image ? (
                      <img src={getOtherParticipant(activeChat).image!} alt="User" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-primary/20 text-primary font-bold">
                        {getOtherParticipant(activeChat).name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{getOtherParticipant(activeChat).name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Info className="h-5 w-5" />
                </Button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="text-center pb-4">
                  <span className="text-xs bg-muted/50 text-muted-foreground px-3 py-1 rounded-full">
                    Conversation Started
                  </span>
                </div>
                
                {messages.map((msg, index) => {
                  const isMe = msg.senderId === session?.user?.id;
                  
                  return (
                    <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          isMe 
                            ? 'bg-primary text-primary-foreground rounded-br-sm' 
                            : 'bg-surface border border-border text-foreground rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 bg-surface border-t border-border">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input 
                    placeholder="Type your message..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-background"
                  />
                  <Button type="submit" size="sm" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
              <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Your Messages</h2>
              <p className="max-w-sm text-sm">Select a conversation from the left sidebar to start chatting, or apply to a job to initiate a new connection.</p>
            </div>
          )}
        </div>

      </Card>
    </div>
  );
}
