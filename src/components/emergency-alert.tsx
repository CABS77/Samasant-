"use client";

import {useState} from 'react';
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {prioritizeEmergencyAndAlert} from "@/ai/flows/emergency-alert-prioritization";
import {toast} from "@/hooks/use-toast";
import fr from '@/locales/fr/translation.json';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react'; // Import Loader2

export function EmergencyAlert() {
  const [symptoms, setSymptoms] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [alertResult, setAlertResult] = useState<{isEmergency: boolean; reason: string; clinicsAlerted: string[]} | null>(null);
  const [loading, setLoading] = useState(false);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);

  // Function to get geolocation promisified
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error(fr.geolocationNotSupported_sa_navigateur));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
    });
  };


  const handleAlertSubmit = async () => {
    setLoading(true);
    setAlertResult(null); // Clear previous results
    setGeolocationError(null); // Clear previous error
    setLatitude(null); // Clear previous coordinates
    setLongitude(null);

    try {
       // 1. Get Geolocation first
       toast({
         title: "Localisation en cours...",
         description: "Nous recherchons votre position actuelle.",
       });
       const position = await getCurrentPosition();
       const currentLat = position.coords.latitude;
       const currentLng = position.coords.longitude;
       setLatitude(currentLat);
       setLongitude(currentLng);

       toast({
         title: fr.geolocationSuccessTitle_xamnan,
         description: fr.geolocationSuccessDescription_say,
       });

      // 2. If geolocation successful, proceed with AI check
      const response = await prioritizeEmergencyAndAlert({
        symptoms: symptoms,
        phoneNumber: phoneNumber,
        latitude: currentLat,
        longitude: currentLng,
      });
      setAlertResult(response);
      toast({
        title: fr.alertProcessed_jag,
        description: fr.checkAlertResultBelow_resulta,
      });

    } catch (error: any) {
      console.error("Error during emergency alert process:", error);
       // Handle geolocation errors specifically
      if (error instanceof GeolocationPositionError) {
           let message = fr.geolocationErrorDefault_mënumaa;
           switch (error.code) {
             case error.PERMISSION_DENIED:
               message = fr.geolocationErrorPermissionDenied_mayuñu_la;
               break;
             case error.POSITION_UNAVAILABLE:
               message = fr.geolocationErrorPositionUnavailable_sa;
               break;
             case error.TIMEOUT:
               message = fr.geolocationErrorTimeout_demande;
               break;
           }
           setGeolocationError(message);
           toast({
             variant: "destructive",
             title: fr.geolocationErrorTitle_njuumte_xam,
             description: message,
           });
      } else if (error.message === fr.geolocationNotSupported_sa_navigateur) {
          setGeolocationError(error.message);
          toast({
            variant: "destructive",
            title: fr.geolocationErrorTitle_njuumte_xam,
            description: error.message,
          });
      }
       else {
           // Handle AI or other errors
           toast({
             variant: "destructive",
             title: fr.error_njuumte,
             description: error.message || fr.failedToProcessEmergencyAlert_mënuma,
           });
       }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4"> {/* Added space between elements */}

      {geolocationError && (
        <Alert variant="destructive" className="rounded-md shadow-sm">
          <AlertTitle>{fr.geolocationErrorTitle_njuumte_xam}</AlertTitle>
          <AlertDescription>{geolocationError}</AlertDescription>
        </Alert>
      )}
      <div> {/* Wrap each input in a div for better spacing control if needed */}
        <Input
          type="text"
          placeholder={fr.symptoms_malaaka}
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          className="rounded-md shadow-sm border-border focus:ring-primary text-sm sm:text-base" // Responsive text size
        />
      </div>
      <div>
        <Input
          type="tel"
          placeholder={fr.phoneNumber_nomero}
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="rounded-md shadow-sm border-border focus:ring-primary text-sm sm:text-base" // Responsive text size
        />
      </div>
       {/* Display Latitude and Longitude but disable editing - ONLY AFTER successful fetch */}
       {latitude !== null && longitude !== null && (
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                type="number"
                placeholder={fr.latitude_diggu}
                value={latitude.toFixed(6)} // Display fixed precision
                className="rounded-md shadow-sm border-border bg-muted text-muted-foreground cursor-not-allowed text-sm sm:text-base" // Style as disabled
                disabled={true}
                aria-label={fr.latitude_diggu}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder={fr.longitude_wetu}
                value={longitude.toFixed(6)} // Display fixed precision
                className="rounded-md shadow-sm border-border bg-muted text-muted-foreground cursor-not-allowed text-sm sm:text-base" // Style as disabled
                disabled={true}
                aria-label={fr.longitude_wetu}
              />
            </div>
         </div>
       )}


      <Button
        onClick={handleAlertSubmit}
        disabled={loading || !symptoms || !phoneNumber} // Disable if loading or inputs empty
        className="w-full rounded-md shadow-md bg-primary text-primary-foreground hover:bg-primary/90 py-2 sm:py-3 text-sm sm:text-base" // Responsive padding and text size
      >
         {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
        {loading ? fr.loading_yeggeul : fr.checkAlert_kontorool}
      </Button>

      {/* Result Display */}
      {alertResult && (
        <div className="mt-4 p-3 bg-secondary rounded-md shadow space-y-1 text-sm sm:text-base"> {/* Added space-y */}
          <p className="text-secondary-foreground">
             <span className="font-semibold">{fr.isEmergency_lu}:</span> {alertResult.isEmergency ? fr.yes_waaw : fr.no_deedeet}
          </p>
          <p className="text-secondary-foreground">
             <span className="font-semibold">{fr.reason_li}:</span> {alertResult.reason}
          </p>
          <p className="text-secondary-foreground">
            <span className="font-semibold">{fr.clinicsAlerted_daaray_xam}:</span> {alertResult.clinicsAlerted.join(", ") || fr.none_benn}
          </p>
        </div>
      )}
    </div>
  );
}
