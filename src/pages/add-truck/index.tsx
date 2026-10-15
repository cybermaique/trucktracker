import { zodResolver } from "@hookform/resolvers/zod";
import PhotoCameraOutlined from "@mui/icons-material/PhotoCameraOutlined";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { LatLngLiteral } from "leaflet";
import { useCallback, useEffect, useState } from "react";
import { DefaultValues, useForm } from "react-hook-form";
import useSWRMutation from "swr/mutation";
import truckPlaceholder from "../../assets/images/truck-placeholder.jpg";
import TruckFormField from "../../components/add-truck/form-field";
import LocationButton from "../../components/add-truck/location-button";
import TruckSelectionMap from "../../components/add-truck/truck-selection-map";
import PageHeader from "../../components/page-header";
import { API_ROUTES } from "../../constants/api";
import { PAPER_STYLES } from "../../constants/styles";
import useUserLocation from "../../hooks/use-user-location";
import { NewTruck } from "../../interfaces/truck";
import { addTruck } from "../../services/post-truck";
import { useLoadingStore } from "../../stores/loading";
import { useSnackbarStore } from "../../stores/snackbar";
import { convertFileToBase64 } from "../../utils/add-truck";
import truckSchema, { TruckFormValues } from "../../validation/truck-schema";

const MAX_IMAGE_SIZE_MB = 2;
const ACCEPTED_IMAGE_TYPES = ".jpg,.jpeg,.png,.webp";

const EMPTY_FORM: DefaultValues<TruckFormValues> = {
  identifier: "",
  license_plate: "",
  tracker_serial_number: "",
};

const AddTruck = () => {
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const setLoading = useLoadingStore((state) => state.setLoading);
  const [image, setImage] = useState<string | null>(null);
  const [position, setPosition] = useState<LatLngLiteral | null>(null);
  const { location: userLocation } = useUserLocation();

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TruckFormValues>({
    resolver: zodResolver(truckSchema),
    defaultValues: EMPTY_FORM,
  });

  const { trigger, isMutating } = useSWRMutation(API_ROUTES.truck, addTruck);

  const updatePosition = useCallback(
    (latLng: LatLngLiteral, shouldValidate = true) => {
      setPosition(latLng);
      setValue("latitude", latLng.lat, { shouldValidate });
      setValue("longitude", latLng.lng, { shouldValidate });
    },
    [setValue]
  );

  useEffect(() => {
    if (userLocation) {
      updatePosition(
        { lat: userLocation.latitude, lng: userLocation.longitude },
        false
      );
    }
  }, [userLocation, updatePosition]);

  const onSubmit = async (data: TruckFormValues) => {
    const newTruck: NewTruck = {
      image: image ?? "",
      identifier: data.identifier,
      license_plate: data.license_plate,
      tracker_serial_number: data.tracker_serial_number,
      coordinates: { latitude: data.latitude, longitude: data.longitude },
      start_date: new Date().toISOString(),
    };

    try {
      setLoading(true);
      await trigger(newTruck);
      showSnackbar("Caminhão cadastrado com sucesso!", "success");
      // Keeps the selected location: trucks are often registered in batches
      // at the same yard.
      reset({
        ...EMPTY_FORM,
        latitude: data.latitude,
        longitude: data.longitude,
      });
      setImage(null);
    } catch {
      showSnackbar("Erro ao cadastrar caminhão.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      showSnackbar(
        `A imagem deve ter no máximo ${MAX_IMAGE_SIZE_MB}MB.`,
        "error"
      );
      return;
    }

    try {
      setImage(await convertFileToBase64(file));
    } catch {
      showSnackbar("Erro ao processar a imagem.", "error");
    }
  };

  const locationError = errors.latitude?.message ?? errors.longitude?.message;

  return (
    <Container maxWidth={false}>
      <Box display="flex" flexDirection="column" gap={2} mt={2}>
        <PageHeader
          title="Cadastrar Caminhão"
          subtitle="Cadastre um novo caminhão e sua localização."
        />
        <Paper elevation={0} sx={PAPER_STYLES}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Box
              display="flex"
              flexDirection={{ xs: "column", md: "row" }}
              gap={4}
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap={1.5}
              >
                <img
                  src={image ?? truckPlaceholder}
                  alt="Pré-visualização da imagem do caminhão"
                  width={220}
                  height={150}
                  style={{
                    borderRadius: 8,
                    objectFit: "cover",
                    border: "1px solid #ccc",
                  }}
                />
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<PhotoCameraOutlined />}
                >
                  {image ? "Trocar imagem" : "Selecionar imagem"}
                  <input
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES}
                    hidden
                    onChange={handleImageChange}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary">
                  JPG, PNG ou WEBP · até {MAX_IMAGE_SIZE_MB}MB
                </Typography>
              </Box>

              <Box display="flex" flexDirection="column" gap={2} flex={1}>
                <TruckFormField
                  name="identifier"
                  label="Identificador"
                  control={control}
                  maxLength={40}
                  required
                />
                <TruckFormField
                  name="license_plate"
                  label="Placa"
                  control={control}
                  isLicensePlate
                  required
                />
                <TruckFormField
                  name="tracker_serial_number"
                  label="Número de Série do Rastreador"
                  control={control}
                  maxLength={20}
                  required
                />
              </Box>
            </Box>

            <Typography variant="subtitle1" mt={4} mb={1}>
              Selecione a localização no mapa *
            </Typography>
            <TruckSelectionMap position={position} onSelect={updatePosition} />
            <Typography
              variant="caption"
              color={locationError ? "error" : "text.secondary"}
              role={locationError ? "alert" : undefined}
            >
              {locationError ??
                (position
                  ? `Latitude: ${position.lat.toFixed(5)} | Longitude: ${position.lng.toFixed(5)}`
                  : "Nenhuma localização selecionada")}
            </Typography>
            <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              justifyContent="flex-end"
              gap={2}
              mt={2}
            >
              <LocationButton onLocate={updatePosition} />
              <Button
                type="submit"
                variant="contained"
                disabled={isMutating}
                size="large"
              >
                {isMutating ? "Salvando..." : "Salvar Caminhão"}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default AddTruck;
