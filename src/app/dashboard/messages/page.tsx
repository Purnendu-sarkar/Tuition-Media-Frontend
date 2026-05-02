"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Send, Search, MessageSquare, Info, ChevronLeft, User, MoreVertical, Paperclip, Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isLoading, setIsLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (status === "authenticated" && session?.accessToken) {
      fetchConversations(session.accessToken);

      // Initialize Socket.io
      const backendUrl = publicEnv.NEXT_PUBLIC_API_BASE_URL.replace("/api/v1", "");
      const newSocket = io(backendUrl, {
        auth: { token: session.accessToken }
      });
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Connected to chat server");
      });

      newSocket.on("new_message", (message: ChatMessage) => {
        setMessages((prev) => {
          // Prevent duplicates if already added by sender
          if (prev.find(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
        
        // Update conversations list latest message preview
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async (token: string) => {
    try {
      const res = await messageApi.getConversations(token);
      setConversations(res.conversations);
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectConversation = async (conv: Conversation) => {
    if (!session?.accessToken || !socket) return;
    
    try {
      const res = await messageApi.getConversationHistory(session.accessToken, conv.id);
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

    const messageData = {
      conversationId: activeChat.id,
      content: newMessage.trim(),
      senderId: session.user.id
    };

    socket.emit("send_message", messageData);
    setNewMessage("");
  };

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participantOneId === session?.user?.id ? conv.participantTwo : conv.participantOne;
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-b-primary animate-spin" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">Loading your messages...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 h-[calc(100vh-6rem)] max-w-7xl">
      <Card className="h-full flex overflow-hidden border-border/50 bg-surface shadow-2xl rounded-3xl relative">
        
        {/* Left Pane: Conversation List */}
        <div className={`w-full md:w-[380px] flex flex-col border-r border-border/50 bg-background/20 backdrop-blur-xl ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black font-[var(--font-space-grotesk)] flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                Chats
              </h2>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input 
                placeholder="Search conversations..." 
                className="pl-11 h-12 bg-background/50 border-border/50 rounded-2xl focus:ring-primary/20" 
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {conversations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-40">
                <div className="p-4 bg-muted rounded-full mb-4">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <p className="text-sm font-medium">No active chats</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const otherUser = getOtherParticipant(conv);
                const lastMessage = conv.messages[0];
                const isActive = activeChat?.id === conv.id;

                return (
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 relative group ${
                      isActive 
                        ? 'bg-primary/10 shadow-lg shadow-primary/5 ring-1 ring-primary/20' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <div className="h-14 w-14 rounded-2xl bg-muted overflow-hidden border-2 border-background shadow-inner">
                          {otherUser.image ? (
                            <img src={otherUser.image} alt={otherUser.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-black text-xl">
                              {otherUser.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-background shadow-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className={`font-bold truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
                            {otherUser.name}
                          </h3>
                          {lastMessage && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 whitespace-nowrap ml-2">
                              {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm truncate ${isActive ? 'text-primary/70 font-medium' : 'text-muted-foreground'}`}>
                          {lastMessage ? (
                            <>
                              {lastMessage.senderId === session?.user?.id ? 'You: ' : ''}
                              {lastMessage.content}
                            </>
                          ) : (
                            <span className="italic opacity-50">No messages yet</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Chat */}
        <div className={`flex-1 flex flex-col bg-background/10 backdrop-blur-sm ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 md:p-6 border-b border-border/50 bg-surface/50 backdrop-blur-xl flex items-center justify-between z-10 shadow-sm">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden rounded-xl bg-background/50"
                    onClick={() => setActiveChat(null)}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <div className="relative">
                    <div className="h-12 w-12 rounded-2xl bg-muted overflow-hidden border-2 border-background shadow-md">
                      {getOtherParticipant(activeChat).image ? (
                        <img src={getOtherParticipant(activeChat).image!} alt="User" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-black text-lg">
                          {getOtherParticipant(activeChat).name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-background" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg tracking-tight">{getOtherParticipant(activeChat).name}</h3>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active Now
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="rounded-xl hidden sm:flex">
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <Info className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
                <div className="flex flex-col items-center py-8 opacity-40">
                  <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
                    <User className="h-10 w-10" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.3em]">Beginning of Conversation</p>
                </div>
                
                <AnimatePresence initial={false}>
                  {messages.map((msg, index) => {
                    const isMe = msg.senderId === session?.user?.id;
                    const isLastByMe = index > 0 && messages[index-1].senderId === msg.senderId;
                    
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        key={msg.id || index} 
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isLastByMe ? '-mt-4' : ''}`}
                      >
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%] md:max-w-[70%]`}>
                          <div 
                            className={`rounded-[1.5rem] px-5 py-3 shadow-xl ${
                              isMe 
                                ? 'bg-primary text-primary-foreground rounded-br-sm' 
                                : 'bg-surface border border-border/50 text-foreground rounded-bl-sm'
                            }`}
                          >
                            <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                          </div>
                          {!isLastByMe && (
                            <span className="text-[9px] font-black uppercase tracking-widest mt-2 px-1 text-muted-foreground/60">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-6 bg-surface/50 backdrop-blur-2xl border-t border-border/50">
                <form onSubmit={handleSendMessage} className="flex gap-4 items-center">
                  <Button type="button" variant="ghost" size="icon" className="rounded-xl shrink-0 hidden sm:flex">
                    <Smile className="h-6 w-6 text-muted-foreground" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input 
                      placeholder="Write your message..." 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="h-14 px-6 bg-background border-border/50 rounded-2xl text-lg font-medium focus:ring-primary/20 shadow-inner"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={!newMessage.trim()}
                    className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all shrink-0"
                  >
                    <Send className="h-6 w-6" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-12 text-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 to-transparent">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-32 h-32 bg-primary/10 rounded-[3rem] flex items-center justify-center mb-8 relative"
              >
                <MessageSquare className="h-16 w-16 text-primary/40" />
                <div className="absolute -top-2 -right-2 h-10 w-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl">
                  <Sparkles className="h-5 w-5" />
                </div>
              </motion.div>
              <h2 className="text-3xl font-black text-foreground mb-4 tracking-tight">Your Digital Classroom</h2>
              <p className="max-w-md text-lg leading-relaxed text-muted-foreground/80">Select a conversation to coordinate schedules, discuss study plans, or share academic progress.</p>
              <Button 
                variant="outline" 
                className="mt-8 h-12 px-8 rounded-2xl border-primary/20 text-primary font-bold hover:bg-primary/5"
              >
                Start New Chat
              </Button>
            </div>
          )}
        </div>

      </Card>
    </div>
  );
}

function Sparkles(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
