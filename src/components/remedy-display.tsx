// RemedyDisplay.tsx
"use client";

import type { Remedy } from "@/services/remedies";
import { useState, useEffect, useCallback, useRef } from 'react';
import { getRemedies } from "@/services/remedies";
import { generateRemedies } from "@/ai/flows/generate-remedies-flow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Search, Leaf, ChevronDown, X, ChevronUp, AlertTriangle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface DisplayRemedy extends Remedy {
  id: string;
  isGenerated?: boolean;
}

const CATEGORIES = [
  { key: 'all', label: 'Tous', emoji: '🌿' },
  { key: 'toux', label: 'Toux', emoji: '🤧' },
  { key: 'fièvre', label: 'Fièvre', emoji: '🌡️' },
  { key: 'digestion', label: 'Digestion', emoji: '🫃' },
  { key: 'peau', label: 'Peau', emoji: '🧴' },
  { key: 'douleur', label: 'Douleurs', emoji: '💪' },
  { key: 'stress', label: 'Stress', emoji: '🧘' },
  { key: 'sommeil', label: 'Sommeil', emoji: '😴' },
  { key: 'paludisme', label: 'Paludisme', emoji: '🦟' },
  { key: 'immunité', label: 'Immunité', emoji: '🛡️' },
  { key: 'fatigue', label: 'Fatigue', emoji: '⚡' },
  { key: 'diarrhée', label: 'Diarrhée', emoji: '💧' },
];

const ITEMS_PER_PAGE = 8;

const getSymptomEmoji = (symptom: string): string => {
  const s = symptom.toLowerCase();
  if (s.includes('toux') || s.includes('rhume') || s.includes('bronchite')) return '🤧';
  if (s.includes('fièvre') || s.includes('paludisme')) return '🌡️';
  if (s.includes('digestion') || s.includes('ballonnement') || s.includes('constipation')) return '🫃';
  if (s.includes('peau') || s.includes('brûlure') || s.includes('mycose')) return '🧴';
  if (s.includes('douleur') || s.includes('rhumatisme') || s.includes('crampe')) return '💪';
  if (s.includes('stress') || s.includes('anxiété')) return '🧘';
  if (s.includes('sommeil')) return '😴';
  if (s.includes('fatigue') || s.includes('énergie')) return '⚡';
  if (s.includes('diarrhée') || s.includes('déshydratation')) return '💧';
  if (s.includes('immunité') || s.includes('prévention')) return '🛡️';
  if (s.includes('gorge')) return '🗣️';
  if (s.includes('dent') || s.includes('aphte')) return '🦷';
  if (s.includes('yeux')) return '👁️';
  if (s.includes('règles') || s.includes('allaitement')) return '👩';
  if (s.includes('plaie') || s.includes('piqûre')) return '🩹';
  return '🌿';
};

export function RemedyDisplay() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [allRemedies, setAllRemedies] = useState<DisplayRemedy[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const expandedRef = useRef<HTMLDivElement>(null);

  const loadRemedies = useCallback(async () => {
    setLoading(true);
    try {
      const fetched = await getRemedies("", "franco-wolof");
      const withIds: DisplayRemedy[] = fetched.map((r, i) => ({
        ...r,
        id: `remedy-${i}`,
      }));
      setAllRemedies(withIds);
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les remèdes." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRemedies();
  }, [loadRemedies]);

  // Scroll vers le remède ouvert
  useEffect(() => {
    if (expandedId && expandedRef.current) {
      expandedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [expandedId]);

  const filtered = allRemedies.filter((r) => {
    const matchesCategory =
      activeCategory === 'all' ||
      r.symptom.toLowerCase().includes(activeCategory) ||
      r.name.toLowerCase().includes(activeCategory) ||
      r.description.toLowerCase().includes(activeCategory);

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.symptom.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const displayed = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleSearch = async () => {
    if (!searchQuery.trim() || filtered.length > 0) return;
    setGenerating(true);
    try {
      const aiResponse = await generateRemedies({ symptom: searchQuery });
      if (aiResponse.generatedRemedies && aiResponse.generatedRemedies.length > 0) {
        const generated: DisplayRemedy[] = aiResponse.generatedRemedies.map((r, i) => ({
          name: r.name, description: r.description, symptom: r.symptom,
          imageUrl: '', id: `gen-${i}-${Date.now()}`, isGenerated: true,
        }));
        setAllRemedies((prev) => [...generated, ...prev]);
        toast({ title: "✨ Remèdes générés par l'IA" });
      } else {
        toast({ variant: "destructive", title: "Aucun résultat" });
      }
    } catch {
      toast({ variant: "destructive", title: "Erreur IA" });
    } finally {
      setGenerating(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {/* Recherche */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher un remède..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(ITEMS_PER_PAGE); setExpandedId(null); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); setExpandedId(null); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {searchQuery && filtered.length === 0 && (
          <Button onClick={handleSearch} disabled={generating} size="sm" className="shrink-0">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Catégories */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(({ key, label, emoji }) => (
          <button
            key={key}
            onClick={() => { setActiveCategory(key); setVisibleCount(ITEMS_PER_PAGE); setSearchQuery(""); setExpandedId(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
              activeCategory === key
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30'
            }`}
          >
            <span>{emoji}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Compteur */}
      {!loading && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} remède{filtered.length > 1 ? 's' : ''}
          {activeCategory !== 'all' && ` · ${CATEGORIES.find(c => c.key === activeCategory)?.label}`}
        </p>
      )}

      {/* Loading */}
      {(loading || generating) && (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl border border-border/50">
              <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vide */}
      {!loading && !generating && filtered.length === 0 && (
        <div className="text-center py-8 bg-muted/20 rounded-xl border border-border/50">
          <Leaf className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">
            {searchQuery ? `Aucun résultat pour "${searchQuery}"` : "Choisissez une catégorie"}
          </p>
        </div>
      )}

      {/* Liste — clic pour expand inline */}
      {!loading && !generating && displayed.length > 0 && (
        <div className="space-y-2">
          {displayed.map((remedy) => {
            const isOpen = expandedId === remedy.id;
            return (
              <div
                key={remedy.id}
                ref={isOpen ? expandedRef : undefined}
                className={`rounded-xl border transition-all ${
                  isOpen
                    ? 'border-primary/40 bg-primary/5 shadow-sm'
                    : 'border-border/50 bg-card hover:border-primary/20'
                }`}
              >
                {/* Header cliquable */}
                <button
                  onClick={() => toggleExpand(remedy.id)}
                  className="flex items-center gap-3 p-3 w-full text-left"
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 text-base transition-colors ${
                    isOpen ? 'bg-primary/15' : 'bg-primary/10'
                  }`}>
                    {getSymptomEmoji(remedy.symptom)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-sm truncate">{remedy.name}</h4>
                      {remedy.isGenerated && <Sparkles className="h-3 w-3 text-accent shrink-0" />}
                    </div>
                    {!isOpen && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{remedy.description}</p>
                    )}
                  </div>

                  <div className="shrink-0 text-muted-foreground">
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>

                {/* Contenu expandé */}
                {isOpen && (
                  <div className="px-3 pb-4 space-y-3">
                    {/* Badge symptôme */}
                    <div className="pl-[52px]">
                      <span className="inline-block text-[10px] font-medium text-primary bg-primary/10 rounded-md px-2 py-0.5">
                        {remedy.symptom}
                      </span>
                    </div>

                    {/* Description complète */}
                    <div className="ml-[52px] bg-background rounded-lg p-3 border border-border/30">
                      <p className="text-sm leading-relaxed">{remedy.description}</p>
                    </div>

                    {/* Avertissement */}
                    <div className="ml-[52px] flex items-start gap-2 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 rounded-lg px-3 py-2 border border-amber-200/50 dark:border-amber-800/30">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>Informatif uniquement. Consultez un professionnel de santé.</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Voir plus */}
      {hasMore && !loading && (
        <div className="text-center pt-1">
          <Button variant="outline" size="sm" onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}>
            <ChevronDown className="h-4 w-4 mr-1" />
            Voir plus ({filtered.length - visibleCount})
          </Button>
        </div>
      )}
    </div>
  );
}
