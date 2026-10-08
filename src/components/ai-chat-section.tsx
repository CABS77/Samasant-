
"use client";
import React from 'react';
import type { RemedyDetailSchema } from "@/ai/flows/initial-health-assessment";
import { useEffect, useState, useRef } from 'react';
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { hasReachedLimit, incrementDailyCount } from "@/lib/requestLimit";
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Volume2, VolumeX, Loader2, Info, Share2, ArrowUpRight, ShieldCheck, Languages } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { confirmAdult, hasConfirmedAdult } from "@/lib/ageConfirmation";

type AssessmentLanguage = 'french' | 'wolof' | 'franco-wolof';


interface ChatOutput {
  assessment: string;
  traditionalRemedies?: RemedyDetailSchema[];
  nextSteps: string;
}

interface BrowserRecognition {
  continuous: boolean; interimResults: boolean; lang: string;
  onstart: (() => void) | null; onend: (() => void) | null;
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start(): void; stop(): void; abort(): void;
}
type VoiceWindow = Window & { SpeechRecognition?: new () => BrowserRecognition; webkitSpeechRecognition?: new () => BrowserRecognition };

export function AIChatSection() {
  const { t, i18n } = useTranslation();
  const [voiceLanguage, setVoiceLanguage] = useState('fr');
  const [voiceConsent, setVoiceConsent] = useState(false);
  const [responseLanguage, setResponseLanguage] = useState<AssessmentLanguage>('french');
  const [chatInput, setChatInput] = useState("");
  const [chatOutput, setChatOutput] = useState<ChatOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<BrowserRecognition | null>(null);
  // Cache last submitted message and responses by language to avoid
  // unnecessary API calls when switching languages without changing the text
  const [lastSubmittedMessage, setLastSubmittedMessage] = useState("");
  const [cachedResponses, setCachedResponses] = useState<Record<string, ChatOutput>>({});
  // Confirmation d'âge (18 ans ou plus) demandée avant le premier pré-diagnostic
  const [adultConfirmed, setAdultConfirmed] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<AssessmentLanguage | null>(null);

  useEffect(() => {
    setAdultConfirmed(hasConfirmedAdult());
    }, []);
  useEffect(() => setVoiceLanguage(i18n.language === 'wo' ? 'wo' : 'fr'), [i18n.language]);

  const handleConfirmAdult = () => {
    confirmAdult();
    setAdultConfirmed(true);
    const language = pendingLanguage;
    setPendingLanguage(null);
    if (language) void handleChatSubmit(language, undefined, true);
  };

  const handleDeclineAdult = () => {
    setPendingLanguage(null);
    toast({
      variant: "destructive",
      title: t("ageGate_declined_title"),
      description: t("ageGate_declined_description"),
    });
  };

  const handleChatSubmit = async (
    language: AssessmentLanguage,
    message?: string,
    justConfirmed = false
  ) => {
    const messageToSubmit = message || chatInput;
    if (!messageToSubmit.trim()) {
      toast({
        variant: "destructive",
        title: t("error_njuumte"),
        description: t("enterSymptoms_bindal_sa_malaaka"),
      });
      return;
    }

    // Service réservé aux adultes : confirmation demandée avant le premier pré-diagnostic
    if (!adultConfirmed && !justConfirmed) {
      setPendingLanguage(language);
      return;
    }

    // If the message hasn't changed and we already have a cached response for
    // the requested language, reuse it to avoid an unnecessary API call
    if (
      messageToSubmit === lastSubmittedMessage &&
      cachedResponses[language]
    ) {
      setChatOutput(cachedResponses[language]);
      setResponseLanguage(language);
      return;
    }

    // Reset cache when the message changes
    if (messageToSubmit !== lastSubmittedMessage) {
      setCachedResponses({});
      setLastSubmittedMessage(messageToSubmit);
    }

    // Vérification côté client (peut être contournée, mais améliore l'UX)
    if (hasReachedLimit(7)) {
      toast({
        variant: "destructive",
        title: t("dailyLimitReached_title"),
        description: t("dailyLimitReached_description"),
      });
      return;
    }

    setLoading(true);
    setChatOutput(null);
    try {
      // Appel à l'API Route sécurisée avec rate limiting serveur
      const apiResponse = await fetch('/api/health-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          message: messageToSubmit,
          language: language,
          ageConfirmed: true,
        }),
      });

      // Gérer le rate limiting côté serveur
      if (apiResponse.status === 429) {
        const errorData = await apiResponse.json();
        toast({
          variant: "destructive",
          title: t("dailyLimitReached_title"),
          description: errorData.message || t("dailyLimitReached_description"),
        });
        return;
      }

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.message || 'API request failed');
      }

      const response = await apiResponse.json();

      // Incrémenter le compteur local seulement si la requête a réussi
      incrementDailyCount();

      const outputWithArrayRemedies = {
        ...response,
        traditionalRemedies: Array.isArray(response.traditionalRemedies)
          ? response.traditionalRemedies
          : [],
      };
      setChatOutput(outputWithArrayRemedies);
      setResponseLanguage(language);
      setCachedResponses((prev) => ({ ...prev, [language]: outputWithArrayRemedies }));
      toast({
        title: t("aiAssessmentComplete_saafara"),
        description: t("checkChatResponseBelow_seetal"),
      });
    } catch (error) {

      toast({
        variant: "destructive",
        title: t("error_njuumte"),
        description: (error instanceof Error ? error.message : undefined) || t("failedToGetAiAssessment_munul"),
      });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;

      const SpeechRecognition = (window as VoiceWindow).SpeechRecognition || (window as VoiceWindow).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = voiceLanguage === 'wo' ? 'wo-SN' : 'fr-FR';

        recognitionRef.current.onstart = () => setIsRecording(true);
        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setChatInput(transcript);
          setIsRecording(false);
        };
        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          let errorMessage = t("failedToRecognizeSpeech_garum");
          if (event.error === 'network') {
              errorMessage = t("speechRecognitionErrorNetwork_description");
          } else if (event.error === 'no-speech') {
              errorMessage = t("speechRecognitionErrorNoSpeech_description");
          } else if (event.error === 'audio-capture') {
              errorMessage = t("speechRecognitionErrorAudioCapture_description");
          } else if (event.error === 'not-allowed') {
              errorMessage = t("microphonePermissionDenied_mayunu");
          }
          toast({ variant: "destructive", title: t("speechRecognitionError_njiitu"), description: errorMessage });
          setIsRecording(false);
        };
        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      } else {
        console.warn("SpeechRecognition API is not supported in this browser.");
      }
    }
    return () => {
      if (synthRef.current && synthRef.current.speaking) synthRef.current.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.abort();
      }
    };
  }, [t, voiceLanguage]);


  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast({ variant: "destructive", title: t("speechRecognitionNotAvailable_wax"), description: t("speechRecognitionNotSupported_navigateur_description") });
      return;
    }
    if (isRecording) {
       try { recognitionRef.current.stop(); } catch { setIsRecording(false); }
    } else {
       if (!voiceConsent) return;
       recognitionRef.current.lang = voiceLanguage === 'wo' ? 'wo-SN' : 'fr-FR';
       try { recognitionRef.current.start(); }
       catch { toast({ variant: 'destructive', title: t('cannotStartRecording_description') }); setIsRecording(false); }
    }
  };


  const speak = (textToSpeak: string) => {
    if (!synthRef.current || !textToSpeak) return;
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const language = responseLanguage === 'wolof' ? 'wo' : 'fr';
    const voice = synthRef.current.getVoices().find(v => v.lang.toLowerCase().startsWith(language));
    if (language === 'wo' && !voice) { toast({ title: t('voice_unsupported') }); return; }
    utterance.lang = language === 'wo' ? 'wo-SN' : 'fr-FR';
    if (voice) utterance.voice = voice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
        console.error("SpeechSynthesis Error:", e);
        setIsSpeaking(false);
        toast({variant: "destructive", title: t("errorReadingResponse_title"), description: t("errorReadingResponse_description")})
    }
    synthRef.current.speak(utterance);
  };


  const getSpeakableText = () => {
    if (!chatOutput) return "";
    const remediesText = chatOutput.traditionalRemedies?.map(r => `${r.name}: ${r.description}`).join('\n') || "";
    return `${t("shareIntro_samaSanteResponse")}\n\n${t("aiAssessment_title_wolof")}:\n${chatOutput.assessment}\n\n${t("suggestedRemedies_title_wolof")}:\n${remediesText}\n\n${t("nextSteps_title_wolof")}:\n${chatOutput.nextSteps}\n\n${t("shareOutro_trySamaSante")}`;
  }

  const handleShareResponse = async () => {
    if (!chatOutput) return;
    const speakableText = getSpeakableText();
    const shareData = {
      title: t("shareResponse_title", { appName: t("appName_sama") }),
      text: speakableText,
      // url: window.location.href // Optionally share the current page URL
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({ title: t("shareSuccess_title") });
      } catch (err) {

        if (!(err instanceof Error && err.name === 'AbortError')) {
            toast({ variant: "destructive", title: t("shareError_title"), description: t("shareError_description") });
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.text);
        toast({ title: t("copySuccess_title") });
      } catch {
        toast({ variant: "destructive", title: t("copyError_title"), description: t("copyError_description") });
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Confirmation d'âge */}
      <AlertDialog
        open={pendingLanguage !== null}
        onOpenChange={(open) => {
          if (!open && pendingLanguage !== null) setPendingLanguage(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("ageGate_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("ageGate_description")}{" "}
              <a href="/cgu" target="_blank" rel="noopener" className="underline underline-offset-2">
                {t("ageGate_terms_link")}
              </a>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeclineAdult}>{t("ageGate_decline")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAdult}>{t("ageGate_confirm")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!chatOutput && !loading && <div className="rounded-2xl bg-secondary/50 px-5 py-6"><p className="text-base font-medium">{t('design_chat_welcome')}</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t('design_chat_welcome_text')}</p></div>}
      <label htmlFor="chat-message" className="block text-sm font-medium">{t('symptom_input_label')}</label>
      {/* Input zone */}
      <div className="chat-composer">
        <Textarea
          id="chat-message"
          maxLength={1000}
          placeholder={t("typeOrSpeakWolof_maangi")}
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          className="resize-none"
          rows={5}
        />
        <div className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-2"><span className="text-xs text-muted-foreground">{t('design_chat_input_hint')}</span><span className="shrink-0 text-xs text-muted-foreground" aria-live="off">{chatInput.length}/1000</span></div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button onClick={() => handleChatSubmit('french')} disabled={loading || isRecording} className="h-auto min-h-12 whitespace-normal">
          {loading ? <Loader2 aria-hidden="true" className="animate-spin" /> : <ArrowUpRight aria-hidden="true" />}
          {loading ? t('loading_yeggeul') : t('answerInFrench_button')}
        </Button>
        <Button onClick={() => handleChatSubmit('wolof')} disabled={loading || isRecording} variant="outline" className="h-auto min-h-12 whitespace-normal">
          {loading ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Languages aria-hidden="true" />}
          {loading ? t('loading_yeggeul') : t('answerInWolof_button')}
        </Button>
      </div>

      <details className="rounded-xl border px-4 py-1">
        <summary className="min-h-11 cursor-pointer py-3 text-xs font-medium">{t('design_voice_options')}</summary>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{t('voice_notice')}</p>
        <div className="flex flex-wrap items-center gap-3 pb-3 text-sm">
          <label htmlFor="voice-language">{t('voice_language')}</label>
          <select id="voice-language" value={voiceLanguage} onChange={event => setVoiceLanguage(event.target.value)} className="min-h-11 rounded-lg border bg-background px-3">
            <option value="fr">Français</option><option value="wo">Wolof</option>
          </select>
          <label className="flex items-start gap-2 text-xs leading-relaxed"><input type="checkbox" checked={voiceConsent} onChange={event => setVoiceConsent(event.target.checked)} />{t('voice_consent')}</label>
        <Button
          onClick={toggleRecording}
          variant="outline"
          size="icon"
          className={`h-11 w-11 shrink-0 ${isRecording ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground animate-pulse border-destructive' : ''}`}
          aria-pressed={isRecording}
          aria-label={isRecording ? t("stopRecording_taxawal") : t("startRecording_door")}
          title={isRecording ? t("stopRecording_taxawal") : t("startRecording_door")}
          disabled={loading || !voiceConsent}
        >
          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        </div>
      </details>
      <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"><ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{t('design_chat_privacy')} <a href="/confidentialite" className="underline underline-offset-2">{t('privacy')}</a></span></p>

      {/* Loading state */}
      {loading && !chatOutput && (
        <div role="status" aria-live="polite" className="py-8 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-primary font-medium">{t("aiThinking_reflechit")}</span>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      )}

      {/* Results */}
      {chatOutput && (
        <div aria-live="polite" className="space-y-4 border-t pt-6">
          <Button variant="outline" onClick={() => {
            setChatInput(''); setChatOutput(null); setCachedResponses({}); setLastSubmittedMessage('');
            synthRef.current?.cancel(); recognitionRef.current?.abort(); setIsSpeaking(false); setIsRecording(false);
          }}>{t('clear_chat')}</Button>
          <p className="text-xs text-muted-foreground">{t('share_notice')}</p>
          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => speak(getSpeakableText())}
              disabled={loading || !chatOutput || isRecording}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {isSpeaking ? <VolumeX className="h-4 w-4 mr-1.5" /> : <Volume2 className="h-4 w-4 mr-1.5" />}
              {isSpeaking ? t("stopReading_taxawal_lecture") : t("listenToResponse_deglu")}
            </Button>
            <Button
              onClick={handleShareResponse}
              disabled={loading || !chatOutput || isRecording}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Share2 className="h-4 w-4 mr-1.5" />
              {t("shareResponse_partager")}
            </Button>
          </div>

          {/* Assessment */}
          <div className="bg-muted/30 rounded-xl p-4 border border-border/50 space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-primary mb-2">{t("aiAssessment_title_wolof")}</h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{chatOutput.assessment}</p>
            </div>

            {chatOutput.traditionalRemedies && chatOutput.traditionalRemedies.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-primary mb-2">{t("suggestedRemedies_title_wolof")}</h3>
                <ul className="space-y-2">
                  {chatOutput.traditionalRemedies.map((remedy, index) => (
                    <li key={index} className="p-3 bg-card rounded-lg border border-border/30">
                      <h4 className="font-medium text-sm flex items-center gap-1.5 text-accent">
                        <Info className="h-3.5 w-3.5 shrink-0" />
                        {remedy.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 pl-5 leading-relaxed">{remedy.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-sm text-primary mb-2">{t("nextSteps_title_wolof")}</h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{chatOutput.nextSteps}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
