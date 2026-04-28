// RemedyDisplay.tsx
"use client";

import type { Remedy } from "@/services/remedies";
import { useState, useEffect, useCallback } from 'react';
import { getRemedies } from "@/services/remedies";
import { generateRemedies } from "@/ai/flows/generate-remedies-flow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Search, Leaf, ChevronDown, X } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
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

export function RemedyDisplay() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [allRemedies, setAllRemedies] = useState<DisplayRemedy[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const loadRemedies = useCallback(async () => {
    setLoading(true);
    try {
      const fetched = await getRemedies("", "franco-wolof");
      const withIds: DisplayRemedy[] = fetched.map((r, i) => ({
        ...r,
        id: `remedy-${i}`,
      }));
      setAllRemedies(withIds);
    } catch (err: any) {
      console.error("Failed to fetch remedies:", err);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les remèdes." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRemedies();
  }, [loadRemedies]);

  // Filtrage par catégorie + recherche
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
    if (!searchQuery.trim()) return;

    // Si pas de résultats locaux, tenter la génération IA
    if (filtered.length === 0) {
      setGenerating(true);
      try {
        const aiResponse = await generateRemedies({ symptom: searchQuery });
        if (aiResponse.generatedRemedies && aiResponse.generatedRemedies.length > 0) {
          const generated: DisplayRemedy[] = aiResponse.generatedRemedies.map((r, i) => ({
            name: r.name,
            description: r.description,
            symptom: r.symptom,
            imageUrl: '',
            id: `gen-${i}-${Date.now()}`,
            isGenerated: true,
          }));
          setAllRemedies((prev) => [...generated, ...prev]);
          toast({ title: "✨ Remèdes générés par l'IA", description: `${generated.length} suggestions pour "${searchQuery}"` });
        } else {
          toast({ variant: "destructive", title: "Aucun résultat", description: "Essayez avec d'autres termes." });
        }
      } catch {
        toast({ variant: "destructive", title: "Erreur IA", description: "Impossible de générer des remèdes." });
      } finally {
        setGenerating(false);
      }
    }
  };

  const handleCategoryChange = (key: string) => {
    setActiveCategory(key);
    setVisibleCount(ITEMS_PER_PAGE);
    setSearchQuery("");
  };

  // Emoji basé sur le symptôme
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

  return (
    <div className="space-y-5">
      {/* Barre de recherche */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher un remède ou symptôme..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(ITEMS_PER_PAGE);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setVisibleCount(ITEMS_PER_PAGE); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {searchQuery && filtered.length === 0 && (
          <Button onClick={handleSearch} disabled={generating} size="sm" className="shrink-0">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span className="hidden sm:inline ml-1">IA</span>
          </Button>
        )}
      </div>

      {/* Catégories */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(({ key, label, emoji }) => (
          <button
            key={key}
            onClick={() => handleCategoryChange(key)}
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
          {filtered.length} remède{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
          {activeCategory !== 'all' && ` pour "${CATEGORIES.find(c => c.key === activeCategory)?.label}"`}
          {searchQuery && ` contenant "${searchQuery}"`}
        </p>
      )}

      {/* Loading */}
      {(loading || generating) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-4 rounded-xl border border-border/50 bg-card">
              <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aucun résultat */}
      {!loading && !generating && filtered.length === 0 && (
        <div className="text-center py-10 bg-muted/20 rounded-2xl border border-border/50">
          <Leaf className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {searchQuery
              ? `Aucun remède trouvé pour "${searchQuery}". Cliquez sur le bouton IA pour générer des suggestions.`
              : "Entrez un symptôme ou choisissez une catégorie."}
          </p>
        </div>
      )}

      {/* Liste des remèdes */}
      {!loading && !generating && displayed.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayed.map((remedy) => (
            <Dialog key={remedy.id}>
              <DialogTrigger asChild>
                <button className="flex gap-3 p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-sm transition-all text-left w-full group">
                  {/* Emoji icon */}
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-lg group-hover:bg-primary/15 transition-colors">
                    {getSymptomEmoji(remedy.symptom)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-sm truncate">{remedy.name}</h4>
                      {remedy.isGenerated && (
                        <Sparkles className="h-3 w-3 text-accent shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                      {remedy.description}
                    </p>
                    <span className="inline-block mt-1.5 text-[10px] font-medium text-primary bg-primary/10 rounded-md px-2 py-0.5">
                      {remedy.symptom}
                    </span>
                  </div>
                </button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                      {getSymptomEmoji(remedy.symptom)}
                    </div>
                    <div>
                      <DialogTitle className="text-lg flex items-center gap-2">
                        {remedy.name}
                        {remedy.isGenerated && <Sparkles className="h-4 w-4 text-accent" />}
                      </DialogTitle>
                      <DialogDescription className="text-xs mt-0.5">
                        Symptôme : {remedy.symptom}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="py-4">
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <p className="text-sm leading-relaxed">{remedy.description}</p>
                  </div>

                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200/50 dark:border-amber-800/30">
                    <p className="text-xs text-amber-800 dark:text-amber-200">
                      ⚠️ Ces remèdes sont informatifs et ne remplacent pas un avis médical. Consultez toujours un professionnel de santé.
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary" size="sm">Fermer</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}

      {/* Bouton Voir plus */}
      {hasMore && !loading && (
        <div className="text-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
          >
            <ChevronDown className="h-4 w-4 mr-1" />
            Voir plus ({filtered.length - visibleCount} restants)
          </Button>
        </div>
      )}
    </div>
  );
}
