"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  User, 
  Clock, 
  Send,
  CheckCircle2,
  AlertCircle,
  Inbox
} from "lucide-react";
import { adminApi, AdminTicket } from "@/lib/api/admin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminTicketsPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<AdminTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (session?.accessToken) {
      fetchTickets();
    }
  }, [session]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getTickets(session?.accessToken!);
      setTickets(res.tickets);
      if (selectedTicket) {
        const updated = res.tickets.find(t => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !reply.trim() || sending) return;

    try {
      setSending(true);
      await adminApi.addTicketMessage(session?.accessToken!, selectedTicket.id, reply);
      setReply("");
      toast.success("Reply sent");
      fetchTickets();
    } catch (error: any) {
      toast.error(error.message || "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await adminApi.updateTicketStatus(session?.accessToken!, id, status);
      toast.success(`Ticket marked as ${status.toLowerCase()}`);
      fetchTickets();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex gap-6 overflow-hidden">
      {/* Tickets List Sidebar */}
      <div className="w-full md:w-96 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-primary" />
            Support Inbox
          </h1>
          <Badge variant="outline" className="rounded-full">
            {tickets.length}
          </Badge>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {loading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-muted/20 animate-pulse rounded-2xl" />
            ))
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-surface rounded-3xl border border-dashed border-border">
              <Inbox className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No tickets yet</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedTicket?.id === ticket.id
                    ? "bg-primary/5 border-primary shadow-sm"
                    : "bg-surface border-border hover:border-primary/50"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge className={`text-[9px] uppercase tracking-widest ${
                    ticket.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-500' :
                    ticket.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-slate-500/10 text-slate-500'
                  } border-none`}>
                    {ticket.status}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="font-bold text-sm truncate">{ticket.subject}</div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                  <User className="w-3 h-3" />
                  {ticket.user.name}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col rounded-3xl border-border bg-surface overflow-hidden shadow-2xl relative">
        {selectedTicket ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-border bg-background/50 backdrop-blur-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-black text-lg">{selectedTicket.subject}</h2>
                  <p className="text-xs text-muted-foreground">{selectedTicket.user.name} • {selectedTicket.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedTicket.status !== 'CLOSED' ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl"
                    onClick={() => handleUpdateStatus(selectedTicket.id, "CLOSED")}
                  >
                    Close Ticket
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl border-emerald-500/50 text-emerald-500"
                    onClick={() => handleUpdateStatus(selectedTicket.id, "OPEN")}
                  >
                    Reopen Ticket
                  </Button>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-muted/20 to-transparent">
              {/* Ticket Description as first message */}
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl p-4 bg-background border border-border shadow-sm">
                  <p className="text-sm font-medium mb-1">Issue Description:</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedTicket.description}</p>
                  <div className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {selectedTicket.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                    msg.isAdmin 
                      ? 'bg-primary text-white' 
                      : 'bg-background border border-border'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <div className={`text-[10px] mt-2 flex items-center gap-1 ${
                      msg.isAdmin ? 'text-white/70' : 'text-muted-foreground'
                    }`}>
                      <Clock className="w-3 h-3" />
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-6 border-t border-border bg-background/50">
              <form onSubmit={handleSendReply} className="flex gap-4">
                <Input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your response here..."
                  className="rounded-2xl h-12 border-border/50 bg-surface shadow-inner"
                  disabled={selectedTicket.status === 'CLOSED'}
                />
                <Button 
                  type="submit" 
                  disabled={!reply.trim() || sending || selectedTicket.status === 'CLOSED'}
                  className="rounded-2xl h-12 w-12 p-0 bg-primary shadow-lg shadow-primary/20"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
              {selectedTicket.status === 'CLOSED' && (
                <p className="text-center text-[11px] text-muted-foreground mt-3 italic">
                  This ticket is closed. Reopen it to send a reply.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-12 text-center">
            <div className="h-24 w-24 rounded-full bg-muted/20 flex items-center justify-center mb-6">
              <MessageSquare className="w-12 h-12 opacity-20" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Select a ticket</h3>
            <p className="max-w-xs">Select a support ticket from the list on the left to view the conversation and respond.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
