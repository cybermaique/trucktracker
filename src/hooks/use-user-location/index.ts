import { useEffect, useState } from "react";
import { DEFAULT_LOCATION, DEFAULT_LOCATION_LABEL } from "../../constants/map";
import {
  UserLocation,
  UserLocationStatus,
} from "../../interfaces/user-location";
import { useSnackbarStore } from "../../stores/snackbar";

interface UserLocationState {
  location: UserLocation | null;
  status: UserLocationStatus;
}

/**
 * Resolves the user's position through the Geolocation API. When permission
 * is denied (or the API is unavailable) it falls back to a default location,
 * so distance-based features keep working instead of rendering nothing.
 */
const useUserLocation = (): UserLocationState => {
  const [state, setState] = useState<UserLocationState>({
    location: null,
    status: "pending",
  });
  const showSnackbar = useSnackbarStore((store) => store.showSnackbar);

  useEffect(() => {
    const applyFallback = () => {
      setState({ location: DEFAULT_LOCATION, status: "fallback" });
      showSnackbar(
        `Não foi possível obter sua localização. As distâncias são calculadas a partir de ${DEFAULT_LOCATION_LABEL}.`,
        "warning"
      );
    };

    if (!("geolocation" in navigator)) {
      applyFallback();
      return;
    }

    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setState({
        location: { latitude: coords.latitude, longitude: coords.longitude },
        status: "granted",
      });
    }, applyFallback);
  }, [showSnackbar]);

  return state;
};

export default useUserLocation;
