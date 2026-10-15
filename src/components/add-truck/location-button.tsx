import MyLocationOutlined from "@mui/icons-material/MyLocationOutlined";
import { Button } from "@mui/material";
import { LatLngLiteral } from "leaflet";
import { useSnackbarStore } from "../../stores/snackbar";

interface LocationButtonProps {
  onLocate: (position: LatLngLiteral) => void;
}

const LocationButton = ({ onLocate }: LocationButtonProps) => {
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  const getUserLocation = () => {
    if (!("geolocation" in navigator)) {
      showSnackbar("Seu navegador não suporta geolocalização.", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => onLocate({ lat: coords.latitude, lng: coords.longitude }),
      () => showSnackbar("Erro ao obter localização do usuário", "error")
    );
  };

  return (
    <Button
      variant="outlined"
      onClick={getUserLocation}
      size="large"
      startIcon={<MyLocationOutlined />}
    >
      Usar minha localização
    </Button>
  );
};

export default LocationButton;
