
"use client";
import React from 'react';
import type { RemedyDetailSchema } from "@/ai/flows/initial-health-assessment";
import { useEffect, useState, useRef } from 'react';
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { hasReachedLimit, incrementDailyCount } from "@/lib/requestLimit";
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Volume2, VolumeX, Loader2, Info, Share2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface AIChatSectionProps {}

interface ChatOutput {
  assessment: string;
  traditionalRemedies?: RemedyDetailSchema[];
  nextSteps: string;
}

export function AIChatSection({}: AIChatSectionProps) {
  const { t } = useTranslation();
  const [chatInput, setChatInput] = useState("");
  const [chatOutput, setChatOutput] = useState<ChatOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);
  // Cache last submitted message and responses by language to avoid
  // unnecessary API calls when switching languages without changing the text
  const [lastSubmittedMessage, setLastSubmittedMessage] = useState("");
  const [cachedResponses, setCachedResponses] = useState<Record<string, ChatOutput>>({});




  const handleChatSubmit = async (
    language: 'french' | 'wolof' | 'franco-wolof',
    message?: string
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

    // If the message hasn't changed and we already have a cached response for
    // the requested language, reuse it to avoid an unnecessary API call
    if (
      messageToSubmit === lastSubmittedMessage &&
      cachedResponses[language]
    ) {
      setChatOutput(cachedResponses[language]);
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
      const deviceId = localStorage.getItem('deviceId') || 
                      `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('deviceId', deviceId);

      const apiResponse = await fetch('/api/health-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSubmit,
          language: language,
          deviceId: deviceId,
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
      setCachedResponses((prev) => ({ ...prev, [language]: outputWithArrayRemedies }));
      toast({
        title: t("aiAssessmentComplete_saafara"),
        description: t("checkChatResponseBelow_seetal"),
      });
    } catch (error: any) {
      console.error("Error during health assessment:", error);
      toast({
        variant: "destructive",
        title: t("error_njuumte"),
        description: error.message || t("failedToGetAiAssessment_munul"),
      });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'fr-FR';

        recognitionRef.current.onstart = () => setIsRecording(true);
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setChatInput(transcript);
          setIsRecording(false);
        };
        recognitionRef.current.onerror = (event: any) => {
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
          if (isRecording) setIsRecording(false);
        };
      } else {
        console.warn("SpeechRecognition API is not supported in this browser.");
      }
    }
    return () => {
      if (synthRef.current && synthRef.current.speaking) synthRef.current.cancel();
      if (recognitionRef.current && recognitionRef.current.readyState !== 'inactive') {
        // recognitionRef.current.stop(); // Consider if this is needed
      }
    };
  }, [t, isRecording]);


  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast({ variant: "destructive", title: t("speechRecognitionNotAvailable_wax"), description: t("speechRecognitionNotSupported_navigateur_description") });
      return;
    }
    if (isRecording) {
       try { recognitionRef.current.stop(); } catch (e) { console.warn("Error stopping speech recognition:", e); setIsRecording(false); }
    } else {
       navigator.mediaDevices.getUserMedia({ audio: true })
       .then(() => {
           recognitionRef.current.lang = 'fr-FR'; // ou la langue détectée/choisie
           try { recognitionRef.current.start(); } catch (e) { console.error("Error starting speech recognition:", e); toast({ variant: "destructive", title: t("error_njuumte"), description: t("cannotStartRecording_description")}); setIsRecording(false); }
       })
       .catch(err => {
           console.error("Microphone access denied:", err);
           toast({ variant: "destructive", title: t("microphonePermissionDenied_mayunu"), description: t("allowMicrophoneAccess_joxaal") });
           setIsRecording(false);
       });
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
    utterance.lang = 'fr-FR'; // Adapter dynamiquement si possible
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
    const remediesText = chatOutput.traditionalRemedies?.map(r => `${t(r.name)}: ${t(r.description)}`).join('\n') || "";
    return `${t("shareIntro_samaSanteResponse")}\n\n${t("aiAssessment_title_wolof")}:\n${t(chatOutput.assessment)}\n\n${t("suggestedRemedies_title_wolof")}:\n${remediesText}\n\n${t("nextSteps_title_wolof")}:\n${t(chatOutput.nextSteps)}\n\n${t("shareOutro_trySamaSante")}`;
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
      } catch (err: any) {
        console.error('Error sharing:', err);
        if (err.name !== 'AbortError') {
            toast({ variant: "destructive", title: t("shareError_title"), description: t("shareError_description") });
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.text);
        toast({ title: t("copySuccess_title") });
      } catch (err) {
        console.error('Failed to copy:', err);
        toast({ variant: "destructive", title: t("copyError_title"), description: t("copyError_description") });
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Input zone */}
      <div className="flex gap-2">
        <Textarea
          placeholder={t("typeOrSpeakWolof_maangi")}
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          className="flex-grow min-h-[90px] resize-none"
          rows={3}
        />
        <Button
          onClick={toggleRecording}
          variant="outline"
          size="icon"
          className={`h-11 w-11 shrink-0 self-end ${isRecording ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground animate-pulse border-destructive' : ''}`}
          title={isRecording ? t("stopRecording_taxawal") : t("startRecording_door")}
          disabled={loading}
        >
          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
      </div>

      {/* Language buttons */}
      <div className="flex gap-2">
        <Button
          onClick={() => handleChatSubmit('french')}
          disabled={loading || isRecording}
          className="flex-1"
        >
          {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
          {loading ? t("loading_yeggeul") : t("answerInFrench_button")}
        </Button>
        <Button
          onClick={() => handleChatSubmit('wolof')}
          disabled={loading || isRecording}
          variant="outline"
          className="flex-1"
        >
          {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
          {loading ? t("loading_yeggeul") : t("answerInWolof_button")}
        </Button>
      </div>

      {/* Loading state */}
      {loading && !chatOutput && (
        <div className="py-8 space-y-4">
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
        <div className="space-y-4">
          {/* Action buttons */}
          <div className="flex gap-2">
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
