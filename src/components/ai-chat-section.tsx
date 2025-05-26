
"use client";
import type { InitialHealthAssessmentOutput, RemedyDetailSchema } from "@/ai/flows/initial-health-assessment";
import { useEffect, useState, useRef } from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {initialHealthAssessment} from "@/ai/flows/initial-health-assessment";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Volume2, VolumeX, Loader2, Info, Share2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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


  const handleChatSubmit = async (language: 'french' | 'wolof' | 'franco-wolof', message?: string) => {
    const messageToSubmit = message || chatInput;
    if (!messageToSubmit.trim()) {
      toast({
        variant: "destructive",
        title: t("error_njuumte"),
        description: t("enterSymptoms_bindal_sa_malaaka"),
      });
      return;
    }

    setLoading(true);
    setChatOutput(null);
    try {
      const response = await initialHealthAssessment({
        message: messageToSubmit,
        language: language,
      });
      const outputWithArrayRemedies = {
        ...response,
        traditionalRemedies: Array.isArray(response.traditionalRemedies) ? response.traditionalRemedies : [],
      };
      setChatOutput(outputWithArrayRemedies);
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

      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
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
    <Card className="shadow-xl rounded-xl mb-6 bg-card text-card-foreground">
       <CardHeader>
        <CardTitle className="font-poppins-bold text-xl sm:text-2xl text-primary">{t("aiChat_waxtaan_title")}</CardTitle>
      </CardHeader>
      <CardContent>
         <div className="flex items-center space-x-2 mb-4">
          <Textarea
            placeholder={t("typeOrSpeakWolof_maangi")}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="rounded-lg shadow-sm flex-grow border-border focus:ring-primary text-sm sm:text-base p-3"
            rows={3}
          />
           <Button
            onClick={toggleRecording}
            variant="outline"
            size="icon"
            className={`rounded-lg shadow-md border-border hover:bg-accent hover:text-accent-foreground h-12 w-12 flex-shrink-0 ${isRecording ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground animate-pulse' : ''}`}
            title={isRecording ? t("stopRecording_taxawal") : t("startRecording_door")}
            disabled={loading}
          >
            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
          <Button
            onClick={() => handleChatSubmit('french')}
            disabled={loading || isRecording}
            className="flex-1 rounded-lg shadow-md bg-primary text-primary-foreground hover:bg-primary/90 py-2 sm:py-3 text-sm sm:text-base font-semibold"
          >
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            {loading ? t("loading_yeggeul") : t("answerInFrench_button")}
          </Button>
          <Button
            onClick={() => handleChatSubmit('wolof')}
            disabled={loading || isRecording}
            className="flex-1 rounded-lg shadow-md bg-primary text-primary-foreground hover:bg-primary/90 py-2 sm:py-3 text-sm sm:text-base font-semibold"
          >
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            {loading ? t("loading_yeggeul") : t("answerInWolof_button")}
          </Button>
        </div>

        {chatOutput && (
           <div className="mt-6 space-y-4 sm:space-y-6">
             <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Button
                  onClick={() => speak(getSpeakableText())}
                  disabled={loading || !chatOutput || isRecording}
                  variant="outline"
                  className="flex-1 rounded-lg shadow-md border-border hover:bg-accent hover:text-accent-foreground text-sm sm:text-base py-2 sm:py-3"
                >
                  {isSpeaking ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />}
                  {isSpeaking ? t("stopReading_taxawal_lecture") : t("listenToResponse_deglu")}
                </Button>
                <Button
                  onClick={handleShareResponse}
                  disabled={loading || !chatOutput || isRecording}
                  variant="outline"
                  className="flex-1 rounded-lg shadow-md border-border hover:bg-accent hover:text-accent-foreground text-sm sm:text-base py-2 sm:py-3"
                >
                  <Share2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {t("shareResponse_partager")}
                </Button>
              </div>

             <div className="p-4 sm:p-6 bg-secondary/50 dark:bg-secondary/30 rounded-xl shadow-inner space-y-4 sm:space-y-6 border border-border/50">
              <div>
                <h3 className="font-poppins-bold text-lg sm:text-xl text-primary mb-2 sm:mb-3 border-b pb-2 border-border/70">{t("aiAssessment_title_wolof")}</h3>
                <p className="text-foreground/90 dark:text-foreground/80 whitespace-pre-wrap font-open-sans text-sm sm:text-base leading-relaxed">{chatOutput.assessment}</p>
              </div>

              {chatOutput.traditionalRemedies && chatOutput.traditionalRemedies.length > 0 && (
                <div>
                  <h3 className="font-poppins-bold text-lg sm:text-xl text-primary mb-2 sm:mb-3 border-b pb-2 border-border/70">{t("suggestedRemedies_title_wolof")}</h3>
                  <ul className="space-y-3 list-none pl-0">
                    {chatOutput.traditionalRemedies.map((remedy, index) => (
                      <li key={index} className="p-3 sm:p-4 bg-card dark:bg-card/80 rounded-lg shadow-sm border border-border/30">
                         <h4 className="font-poppins-bold text-base sm:text-md text-accent mb-1 flex items-center">
                           <Info className="h-4 w-4 mr-2 text-accent/80 flex-shrink-0" />
                           {remedy.name}
                         </h4>
                        <p className="text-muted-foreground font-open-sans text-xs sm:text-sm leading-normal pl-6">{remedy.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="font-poppins-bold text-lg sm:text-xl text-primary mb-2 sm:mb-3 border-b pb-2 border-border/70">{t("nextSteps_title_wolof")}</h3>
                <p className="text-foreground/90 dark:text-foreground/80 whitespace-pre-wrap font-open-sans text-sm sm:text-base leading-relaxed">{chatOutput.nextSteps}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
