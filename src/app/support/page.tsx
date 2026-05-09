"use client";

import { useEffect, useState } from "react";
import { supportApi } from "@/lib/api/support";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search } from "lucide-react";

export default function FAQPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supportApi.getFaqs()
      .then(setFaqs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(search.toLowerCase()) || 
    faq.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-bold font-[var(--font-space-grotesk)] text-foreground tracking-tight">
          Help Center & FAQ
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find answers to common questions about our platform.
        </p>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="Search for answers..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredFaqs.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem key={faq.id} value={`item-${index}`} className="border-border/50">
                <AccordionTrigger className="text-lg font-semibold hover:text-primary transition-colors text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No FAQs found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
