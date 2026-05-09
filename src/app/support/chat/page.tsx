"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supportApi } from "@/lib/api/support";
import { MessageSquare, Send, Plus, X } from "lucide-react";

export default function ChatPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isNewTicket, setIsNewTicket] = useState(false);
  
  // New ticket state
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (session?.accessToken) {
      loadTickets();
    } else {
      setLoading(false);
    }
  }, [session]);

  const loadTickets = async () => {
    if (!session?.accessToken) return;
    try {
      const data = await supportApi.getUserTickets(session.accessToken);
      setTickets(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken) return;
    setCreating(true);
    try {
      const newTicket = await supportApi.createTicket(session.accessToken, {
        subject,
        description,
      });
      setTickets([...tickets, { ...newTicket, messages: [] }]);
      setActiveTicket({ ...newTicket, messages: [] });
      setIsNewTicket(false);
      setSubject("");
      setDescription("");
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken || !activeTicket || !message.trim()) return;

    const content = message;
    setMessage("");
    try {
      const newMessage = await supportApi.addTicketMessage(session.accessToken, activeTicket.id, content);
      
      const updatedTicket = {
        ...activeTicket,
        messages: [...activeTicket.messages, newMessage],
      };
      
      setActiveTicket(updatedTicket);
      setTickets(tickets.map(t => t.id === activeTicket.id ? updatedTicket : t));
    } catch (error) {
      console.error(error);
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
        <MessageSquare className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-foreground">Sign in to get support</h2>
        <p className="text-muted-foreground">You need to be logged in to create or view support tickets.</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-4xl font-bold font-[var(--font-space-grotesk)] text-foreground tracking-tight">
          Live Support Chat
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Chat with our support team or manage your existing tickets.
        </p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Ticket List Sidebar */}
        <div className="w-1/3 flex flex-col bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <h3 className="font-semibold text-lg text-foreground">Your Tickets</h3>
            <button
              onClick={() => {
                setIsNewTicket(true);
                setActiveTicket(null);
              }}
              className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? (
              <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
            ) : tickets.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">No tickets found.</div>
            ) : (
              tickets.map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => {
                    setActiveTicket(ticket);
                    setIsNewTicket(false);
                  }}
                  className={`w-full text-left p-4 rounded-2xl transition-all ${activeTicket?.id === ticket.id ? 'bg-primary/10 border border-primary/20 shadow-sm' : 'hover:bg-muted/50 border border-transparent'}`}
                >
                  <div className="font-semibold truncate text-foreground">{ticket.subject}</div>
                  <div className="text-xs mt-1 text-muted-foreground flex justify-between">
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium ${
                      ticket.status === 'OPEN' ? 'bg-blue-500/10 text-blue-500' :
                      ticket.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-green-500/10 text-green-500'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat / New Ticket Area */}
        <div className="flex-1 flex flex-col bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl overflow-hidden shadow-sm">
          {isNewTicket ? (
            <div className="p-6 md:p-8 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Create New Ticket</h2>
                <button onClick={() => setIsNewTicket(false)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateTicket} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Subject</label>
                  <input
                    required
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Briefly describe your issue..."
                    className="w-full p-4 rounded-2xl border border-border/50 bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Description</label>
                  <textarea
                    required
                    rows={6}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Provide details about what you need help with..."
                    className="w-full p-4 rounded-2xl border border-border/50 bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-4 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Submit Ticket"}
                </button>
              </form>
            </div>
          ) : activeTicket ? (
            <>
              <div className="p-4 md:px-6 md:py-5 border-b border-border/50 flex flex-col bg-background/20">
                <h2 className="text-xl font-bold text-foreground truncate">{activeTicket.subject}</h2>
                <p className="text-sm text-muted-foreground mt-1 truncate">{activeTicket.description}</p>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto space-y-4 flex flex-col">
                {activeTicket.messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                    <p>No messages yet. Our support team will reply soon.</p>
                  </div>
                ) : (
                  activeTicket.messages.map((msg: any) => {
                    const isOwn = msg.senderId === session.user?.id;
                    return (
                      <div key={msg.id} className={`flex flex-col max-w-[80%] ${isOwn ? 'self-end items-end' : 'self-start items-start'}`}>
                        <div className={`px-4 py-3 rounded-2xl ${
                          isOwn 
                            ? 'bg-primary text-white rounded-br-sm' 
                            : 'bg-muted border border-border/50 text-foreground rounded-bl-sm'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-4 border-t border-border/50 bg-background/20">
                <form onSubmit={handleSendMessage} className="relative flex items-center">
                  <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full pl-4 pr-14 py-4 rounded-2xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="absolute right-2 p-2 rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
              <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
              <h3 className="text-xl font-semibold mb-2 text-foreground">Select a ticket</h3>
              <p>Choose an existing ticket from the list or create a new one to get help.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
