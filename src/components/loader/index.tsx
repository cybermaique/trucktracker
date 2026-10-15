import { Backdrop, Box, CircularProgress } from "@mui/material";
import { useLoadingStore } from "../../stores/loading";
import { colors } from "../../styles/colors";

/** Global blocking loader, used while a mutation is in flight. */
export const Loader = () => {
  const isLoading = useLoadingStore((state) => state.isLoading);

  return (
    <Backdrop
      sx={{
        color: colors.royalAzure,
        zIndex: (theme) => theme.zIndex.modal + 1,
      }}
      open={isLoading}
      data-testid="backdrop"
    >
      <CircularProgress
        color="inherit"
        aria-label="Carregando"
        data-testid="circular-progress"
      />
    </Backdrop>
  );
};

/** Inline loader shown while a lazily loaded page chunk is downloaded. */
export const PageLoader = () => (
  <Box display="flex" justifyContent="center" p={6}>
    <CircularProgress aria-label="Carregando página" />
  </Box>
);
