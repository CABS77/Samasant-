
// RemedyDisplay.tsx
"use client";

import type { Remedy } from "@/services/remedies";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getRemedies } from "@/services/remedies";
import { generateRemedies } from "@/ai/flows/generate-remedies-flow";
import { getRemedyImageUrl } from "@/services/imageService";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, ImageOff } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import frTranslationsData from '@/locales/fr/translation.json';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";


// Combined type for display
interface DisplayRemedy extends Remedy {
  id: string;
  isGenerated?: boolean;
  imageUrlToDisplay?: string | null;
  isLoadingImage?: boolean;
  imageLoadError?: boolean;
}

const fr = frTranslationsData;

export function RemedyDisplay() {
  const [symptom, setSymptom] = useState<string>("");
  const [allRemedies, setAllRemedies] = useState<DisplayRemedy[]>([]);
  const [displayedRemedies, setDisplayedRemedies] = useState<DisplayRemedy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [noResultsMessage, setNoResultsMessage] = useState<string>("");

  const extractEnglishKeywords = useCallback((remedy: Remedy): string => {
    const nameLower = remedy.name.toLowerCase();
    const descriptionLower = remedy.description.toLowerCase();

    const nameIngredients = [
        'gingembre', 'lem', 'miel', 'thym', 'menthe', 'nana', 'kinkeliba', 'argile', 'ail', 'oignon',
        'moringa', 'nebeday', 'attaya', 'ditax', 'charbon', 'lin', 'verveine', 'ananas', 'fenouil',
        'neem', 'baobab', 'buy', 'aloe', 'karité', 'plantain', 'coco', 'gnarr', 'girofle', 'curcuma',
        'arachide', 'gerte', 'piment', 'citronnelle', 'camomille', 'corossol', 'lavande', 'bissap', 'goyave',
        'carotte', 'riz', 'cannelle', 'sucre', 'sel'
    ];

    const ingredientMap: { [key: string]: string } = {
        'gingembre': 'ginger', 'lem': 'lemon', 'miel': 'honey', 'thym': 'thyme',
        'menthe': 'mint', 'nana': 'mint', 'kinkeliba': 'kinkeliba leaves', 'argile': 'clay',
        'ail': 'garlic', 'oignon': 'onion', 'sucre': 'sugar', 'sel': 'salt',
        'moringa': 'moringa', 'nebeday': 'moringa leaves', 'attaya': 'senegalese tea',
        'ditax': 'ditax fruit', 'charbon': 'charcoal', 'lin': 'flax seed',
        'verveine': 'verbena', 'ananas': 'pineapple', 'fenouil': 'fennel seed',
        'neem': 'neem leaves', 'baobab': 'baobab fruit', 'buy': 'baobab fruit', 'aloe': 'aloe vera',
        'karité': 'shea butter', 'plantain': 'plantain leaf', 'coco': 'coconut',
        'gnarr': 'coconut', 'girofle': 'clove', 'curcuma': 'turmeric',
        'arachide': 'peanut', 'gerte': 'peanut', 'piment': 'cayenne pepper',
        'citronnelle': 'lemongrass', 'camomille': 'chamomile', 'corossol': 'soursop leaves',
        'lavande': 'lavender', 'bissap': 'hibiscus flower', 'goyave': 'guava leaves',
        'carotte': 'carrot', 'riz': 'rice', 'cannelle': 'cinnamon stick',
    };

    let keywords: string[] = [];

    for (const term of nameIngredients) {
      if (nameLower.includes(term) && ingredientMap[term] && !keywords.includes(ingredientMap[term])) {
        keywords.push(ingredientMap[term]);
        if (keywords.length >= 2) break;
      }
    }

    if (keywords.length < 2) {
      for (const term of nameIngredients) {
        if (descriptionLower.includes(term) && ingredientMap[term] && !keywords.includes(ingredientMap[term])) {
          keywords.push(ingredientMap[term]);
          if (keywords.length >= 2) break;
        }
      }
    }
    
    if (keywords.length === 0) {
        const symptomLower = remedy.symptom.toLowerCase();
        if (symptomLower.includes('toux') || symptomLower.includes('soj')) keywords.push('cough remedy');
        else if (symptomLower.includes('gorge') || symptomLower.includes('baat')) keywords.push('sore throat remedy');
        else if (symptomLower.includes('tête') || symptomLower.includes('bop')) keywords.push('headache relief');
        else if (symptomLower.includes('fièvre') || symptomLower.includes('seuf')) keywords.push('fever remedy');
        else if (symptomLower.includes('digestion')) keywords.push('digestive aid');
        else if (symptomLower.includes('peau') || symptomLower.includes('yaram')) keywords.push('skin remedy');
        else if (symptomLower.includes('stress')) keywords.push('stress relief herb');
        else if (symptomLower.includes('sommeil') || symptomLower.includes('nelaw')) keywords.push('sleep aid herb');
    }

    if (keywords.length === 0) {
        keywords.push('medicinal plant', 'natural remedy');
    } else if (keywords.length === 1) {
        if (!keywords[0].includes('plant') && !keywords[0].includes('herb') && !keywords[0].includes('remedy') && !keywords[0].includes('tea') && !keywords[0].includes('fruit') && !keywords[0].includes('leaf')) {
            keywords.push('plant');
        }
    }
    return keywords.slice(0, 2).join(' ');
  }, []);


  const fetchAndSetImageUrl = useCallback(async (remedyToUpdate: DisplayRemedy) => {
    if (remedyToUpdate.isLoadingImage || (remedyToUpdate.imageUrlToDisplay && !remedyToUpdate.imageLoadError)) return;
    
    setAllRemedies(prev => prev.map(r => r.id === remedyToUpdate.id ? { ...r, isLoadingImage: true, imageLoadError: false } : r));

    const englishKeywords = extractEnglishKeywords(remedyToUpdate);
    console.log(`Fetching image for remedy: ${remedyToUpdate.name}, keywords: "${englishKeywords}"`);
    let fetchedUrl: string | null = null;

    if (englishKeywords && englishKeywords.trim() !== "") {
        fetchedUrl = await getRemedyImageUrl(englishKeywords);
    } else {
        console.warn(`No keywords extracted for remedy: ${remedyToUpdate.name}. Skipping image fetch.`);
    }
    
    console.log(`Fetched URL for ${remedyToUpdate.name}: ${fetchedUrl}`);
    setAllRemedies(prev => prev.map(r => r.id === remedyToUpdate.id ? {
        ...r,
        imageUrlToDisplay: fetchedUrl, // Can be null if nothing was fetched
        isLoadingImage: false,
        imageLoadError: !fetchedUrl 
    } : r));
  }, [extractEnglishKeywords]);

  const loadRemedies = useCallback(async (currentSymptom: string) => {
    setLoading(true);
    setGenerating(false);
    setNoResultsMessage("");
    let fetchedRemedies: Remedy[] = [];
    try {
      fetchedRemedies = await getRemedies(currentSymptom, "franco-wolof");

      if (fetchedRemedies.length > 0) {
        const remediesWithState: DisplayRemedy[] = fetchedRemedies.map((r, index) => ({
          ...r,
          id: `${r.name}-${index}-${Date.now()}`, // More unique ID
          isLoadingImage: false, // Initial state
          imageUrlToDisplay: null, // Will be fetched
          imageLoadError: false,
        }));
        setAllRemedies(remediesWithState);
      } else if (currentSymptom.trim()) {
        setGenerating(true);
        toast({
          title: fr.aiSearch_title || "Recherche IA - Wax ak IA",
          description: `${fr.noRemediesInDb_message_part1 || 'Amoul dara ci cache wala base de données bi pour'} "${currentSymptom}". ${fr.generatingWithAi_message_part2 || 'Je tente de générer avec l\'IA...'}`,
        });
        try {
          const aiResponse = await generateRemedies({ symptom: currentSymptom });
          if (aiResponse.generatedRemedies && aiResponse.generatedRemedies.length > 0) {
            const generated: DisplayRemedy[] = aiResponse.generatedRemedies.map((rGen, index) => ({
              name: rGen.name,
              description: rGen.description,
              symptom: rGen.symptom,
              imageUrl: '', // AI generated remedies don't have a pre-defined image
              id: `gen-${rGen.name}-${index}-${Date.now()}`,
              isGenerated: true,
              isLoadingImage: false,
              imageUrlToDisplay: null,
              imageLoadError: false,
            }));
            setAllRemedies(generated);
             toast({
              title: fr.aiSuccess_title || "Succès IA - Liggey IA baxna",
              description: `${fr.aiGeneratedSuggestions_message_part1 || "L'IA a généré des suggestions pour"} "${currentSymptom}".`,
              variant: "default"
            });
          } else {
            setAllRemedies([]);
            setNoResultsMessage(fr.noRemediesFound_amul || "Aucun remède trouvé pour ce symptôme. Essayez avec d'autres termes.");
            toast({ title: fr.aiFailure_title || "Échec IA - IA mënul dara", description: `${fr.aiFoundNothing_message_part1 || "Même l'IA n'a rien trouvé pour"} "${currentSymptom}".`, variant: "destructive" });
          }
        } catch (aiError: any) {
          console.error("AI generation failed:", aiError.message);
          setAllRemedies([]);
          setNoResultsMessage(fr.noRemediesFound_amul || "Aucun remède trouvé pour ce symptôme. Essayez avec d'autres termes.");
          toast({ title: fr.error_njuumte || "Erreur", description: `${fr.errorDuringAiGeneration_message_part1 || 'Erreur lors de la génération par IA'}: ${aiError.message}`, variant: "destructive" });
        } finally {
           setGenerating(false);
        }
      } else {
         setAllRemedies([]); 
         setNoResultsMessage(fr.enterSymptomToSearch_placeholder || "Entrez un symptôme pour rechercher ou voir les remèdes populaires.");
      }
    } catch (error: any) {
      console.error("Failed to fetch remedies:", error.message);
      setAllRemedies([]);
      setNoResultsMessage(fr.errorFetchingRemedies_message || "Erreur lors de la récupération des remèdes.");
      toast({ title: fr.error_njuumte || "Erreur", description: `${fr.unableToLoadRemedies_message_part1 || 'Impossible de charger les remèdes'}: ${error.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

   useEffect(() => {
    loadRemedies(""); 
  }, [loadRemedies]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (symptom.trim() !== "" || allRemedies.length === 0) { 
         loadRemedies(symptom);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [symptom, loadRemedies, allRemedies.length]);

  useEffect(() => {
    setDisplayedRemedies(allRemedies.slice(0, 4));
    if (!loading && !generating && allRemedies.length === 0 && symptom.trim()) {
        setNoResultsMessage(fr.noRemediesFound_amul || "Aucun remède trouvé pour ce symptôme. Essayez avec d'autres termes.");
    } else if (!loading && !generating && allRemedies.length === 0 && !symptom.trim()) {
        setNoResultsMessage(fr.enterSymptomToSearch_placeholder || "Entrez un symptôme pour rechercher ou voir les remèdes populaires.");
    }
  }, [allRemedies, loading, generating, symptom]);
  
  useEffect(() => {
    displayedRemedies.forEach(remedy => {
        if (!remedy.isLoadingImage && !remedy.imageUrlToDisplay && !remedy.imageLoadError) {
            fetchAndSetImageUrl(remedy);
        }
    });
  }, [displayedRemedies, fetchAndSetImageUrl]);


  const handleImageError = (remedyId: string) => {
    console.error(`Image load error for remedy ID: ${remedyId}`);
    setAllRemedies(prev => prev.map(r => r.id === remedyId ? { ...r, imageLoadError: true, isLoadingImage: false, imageUrlToDisplay: null } : r));
  };

  return (
    <div>
      <div className="mb-4">
        <Input
          type="text"
          placeholder={fr.enterSymptom_bindal || "Entrez un symptôme (ex: toux) - Bindal sa malaaka (misal: soj)"}
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
          className="rounded-md shadow-sm border-border focus:ring-primary text-sm sm:text-base"
        />
      </div>

      {(loading || generating) && (
         <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
                <Card key={`skeleton-${index}`} className="rounded-lg shadow-md overflow-hidden bg-card">
                    <CardContent className="p-3 sm:p-4 flex flex-col flex-grow">
                        <Skeleton className="relative w-full h-24 sm:h-32 mb-2 rounded-md" />
                        <Skeleton className="h-5 w-3/4 mb-1" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-5/6 mt-1" />
                    </CardContent>
                </Card>
            ))}
        </div>
      )}

      {!loading && !generating && displayedRemedies.length === 0 && (
        <p className="col-span-full text-center text-muted-foreground p-4">{noResultsMessage || (fr.noRemediesFound_amul || "Aucun remède trouvé...")}</p>
      )}

       {!loading && !generating && displayedRemedies.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {displayedRemedies.map((remedy, index) => (
            <Dialog key={remedy.id}>
              <DialogTrigger asChild>
                <Card className="rounded-lg shadow-md overflow-hidden bg-card text-card-foreground transition-shadow hover:shadow-xl group flex flex-col cursor-pointer">
                  <CardContent className="p-3 sm:p-4 flex flex-col flex-grow">
                    <div className="relative w-full h-24 sm:h-32 mb-2 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                      {remedy.isLoadingImage ? (
                        <Skeleton className="h-full w-full" />
                      ) : remedy.imageUrlToDisplay && !remedy.imageLoadError ? (
                        <Image
                          key={remedy.imageUrlToDisplay} 
                          src={remedy.imageUrlToDisplay}
                          alt={remedy.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          style={{ objectFit: 'cover' }}
                          data-ai-hint={extractEnglishKeywords(remedy)}
                          className="transition-transform duration-300 ease-in-out group-hover:scale-105"
                          priority={index < 4} 
                          onError={() => handleImageError(remedy.id)}
                        />
                       ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted/70">
                           <ImageOff className="h-10 w-10 text-destructive" data-ai-hint="broken image placeholder" />
                        </div>
                       )}
                     </div>
                    <div className="flex-grow">
                      <h3 className="font-poppins-bold text-sm sm:text-base mb-1 text-primary flex items-center justify-between">
                        <span className="truncate">{remedy.name}</span>
                         {remedy.isGenerated && (
                            <TooltipProvider delayDuration={100}>
                               <Tooltip>
                                   <TooltipTrigger asChild>
                                      <Sparkles className="h-3 w-3 sm:h-4 text-accent flex-shrink-0 ml-1 cursor-help" />
                                   </TooltipTrigger>
                                   <TooltipContent>
                                       <p>{fr.aiGenerated_tooltip || "Généré par l'IA / Li IA Bind"}</p>
                                   </TooltipContent>
                               </Tooltip>
                            </TooltipProvider>
                        )}
                      </h3>
                      <p className="font-open-sans text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3">{remedy.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
               <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto bg-card">
                 <DialogHeader>
                   <DialogTitle className="font-poppins-bold text-xl text-primary flex items-center">
                     {remedy.name}
                     {remedy.isGenerated && (
                         <TooltipProvider delayDuration={100}>
                           <Tooltip>
                               <TooltipTrigger asChild>
                                  <Sparkles className="h-4 w-4 text-accent flex-shrink-0 ml-2 cursor-help" />
                               </TooltipTrigger>
                               <TooltipContent>
                                   <p>{fr.aiGenerated_tooltip || "Généré par l'IA / Li IA Bind"}</p>
                               </TooltipContent>
                           </Tooltip>
                        </TooltipProvider>
                     )}
                   </DialogTitle>
                   <DialogDescription className="font-open-sans text-sm text-muted-foreground pt-2">
                     {fr.remedyForSymptom_label || "Symptôme visé"} : {remedy.symptom}
                   </DialogDescription>
                 </DialogHeader>
                 <div className="py-4 space-y-4">
                    <div className="relative w-full h-48 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                       {remedy.isLoadingImage ? (
                        <Skeleton className="h-full w-full" />
                       ) : remedy.imageUrlToDisplay && !remedy.imageLoadError ? (
                          <Image
                              key={remedy.imageUrlToDisplay + "-dialog"}
                              src={remedy.imageUrlToDisplay}
                              alt={remedy.name}
                              fill
                              sizes="(max-width: 640px) 90vw, 400px"
                              style={{ objectFit: 'cover' }}
                              data-ai-hint={`${extractEnglishKeywords(remedy)} ingredient`}
                              onError={() => handleImageError(remedy.id)}
                          />
                       ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted/70">
                           <ImageOff className="h-12 w-12 text-destructive" data-ai-hint="broken image placeholder"/>
                        </div>
                       )}
                    </div>
                   <p className="font-open-sans text-base text-foreground leading-relaxed">
                     {remedy.description}
                   </p>
                 </div>
                 <DialogFooter>
                   <DialogClose asChild>
                     <Button type="button" variant="secondary">
                        {fr.close_button_label || "Fermer (Teudj)"}
                     </Button>
                   </DialogClose>
                 </DialogFooter>
               </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
}

