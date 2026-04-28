"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { prioritizeEmergencyAndAlert } from "@/ai/flows/emergency-alert-prioritization";
import { toast } from "@/hooks/use-toast";
import { Loader2, MapPin, Phone, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export function EmergencyAlert() {
  const [symptoms, setSymptoms] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [alertResult, setAlertResult] = useState<{
    isEmergency: boolean;
    reason: string;
    clinicsAlerted: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Géolocalisation non supportée'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
    });
  };

  const handleSubmit = async () => {
    if (!symptoms.trim() || !phoneNumber.trim()) return;

    setLoading(true);
    setAlertResult(null);

    try {
      toast({ title: "📍 Localisation en cours..." });
      const position = await getCurrentPosition();
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      setLatitude(lat);
      setLongitude(lng);

      const response = await prioritizeEmergencyAndAlert({
        symptoms,
        phoneNumber,
        latitude: lat,
        longitude: lng,
      });

      setAlertResult(response);
      toast({
        title: response.isEmergency ? "🚨 Urgence détectée" : "✅ Pas d'urgence détectée",
        description: response.isEmergency
          ? `${response.clinicsAlerted.length} clinique(s) alertée(s)`
          : "Continuez à surveiller vos symptômes.",
      });
    } catch (error: any) {
      console.error("Emergency alert error:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de traiter l'alerte.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Symptômes */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <AlertCircle className="h-3.5 w-3.5" />
          Symptômes
        </label>
        <Textarea
          placeholder="Décrivez les symptômes (fièvre, maux de tête, frissons...)"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          className="min-h-[70px] resize-none text-sm"
        />
      </div>

      {/* Téléphone */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Phone className="h-3.5 w-3.5" />
          Numéro de téléphone
        </label>
        <Input
          type="tel"
          placeholder="+221 7X XXX XX XX"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="text-sm"
        />
      </div>

      {/* Coordonnées (si disponibles) */}
      {latitude !== null && longitude !== null && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span>Position : {latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
        </div>
      )}

      {/* Bouton */}
      <Button
        onClick={handleSubmit}
        disabled={loading || !symptoms.trim() || !phoneNumber.trim()}
        variant="destructive"
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            Analyse en cours...
          </>
        ) : (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            Vérifier l&apos;urgence
          </>
        )}
      </Button>

      {/* Résultat */}
      {alertResult && (
        <div className={`rounded-xl p-4 border space-y-3 ${
          alertResult.isEmergency
            ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30'
            : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30'
        }`}>
          {/* Status */}
          <div className="flex items-center gap-2">
            {alertResult.isEmergency ? (
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            )}
            <span className={`font-semibold text-sm ${
              alertResult.isEmergency
                ? 'text-red-700 dark:text-red-300'
                : 'text-emerald-700 dark:text-emerald-300'
            }`}>
              {alertResult.isEmergency ? '🚨 Urgence détectée' : '✅ Pas d\'urgence'}
            </span>
          </div>

          {/* Raison */}
          <p className="text-xs leading-relaxed">{alertResult.reason}</p>

          {/* Cliniques alertées */}
          {alertResult.clinicsAlerted.length > 0 && (
            <div className="pt-2 border-t border-current/10">
              <p className="text-xs font-medium mb-1">Cliniques alertées :</p>
              <ul className="space-y-1">
                {alertResult.clinicsAlerted.map((clinic, i) => (
                  <li key={i} className="text-xs flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {clinic}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Avertissement */}
      <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
        En cas d&apos;urgence vitale, appelez le 1515 (SAMU Sénégal) ou rendez-vous aux urgences les plus proches.
      </p>
    </div>
  );
}
