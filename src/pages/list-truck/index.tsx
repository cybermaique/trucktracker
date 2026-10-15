import PictureAsPdfOutlined from "@mui/icons-material/PictureAsPdfOutlined";
import { Box, Button, Container, Paper } from "@mui/material";
import { useState } from "react";
import { TruckFilters } from "../../components/list-truck/filters";
import DeleteTruckDialog from "../../components/list-truck/modals/delete-truck";
import EditTruckDialog from "../../components/list-truck/modals/edit-truck";
import { TruckTable } from "../../components/list-truck/table/table";
import { TruckViewMap } from "../../components/list-truck/truck-view-map";
import NoResults from "../../components/no-results";
import PageHeader from "../../components/page-header";
import { TruckListSkeleton } from "../../components/skeleton";
import { PAPER_STYLES } from "../../constants/styles";
import { useActionsTable } from "../../containers/use-actions-table";
import { useListTruck } from "../../containers/use-list-truck";
import { useTruckFilters } from "../../containers/use-truck-filters";
import { useSnackbarStore } from "../../stores/snackbar";
import { downloadTruckReport } from "../../utils/truck-report";

const ListTruck = () => {
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const [isExporting, setIsExporting] = useState(false);

  const {
    selectedTruck,
    setSelectedTruck,
    openEditDialog,
    openDeleteDialog,
    editErrors,
    handleEditOpen,
    handleEditClose,
    handleDeleteOpen,
    handleDeleteClose,
    handleSaveEdit,
    handleConfirmDelete,
    handleChangeField,
    handleChangeDate,
  } = useActionsTable();

  const {
    filters,
    setFilters,
    appliedFilters,
    handleSearch,
    handleKeyDown,
    handleClear,
  } = useTruckFilters();

  const {
    trucks,
    isLoading,
    hasData,
    isDistanceDescending,
    setIsDistanceDescending,
  } = useListTruck(appliedFilters);

  const hasActiveFilters = Object.values(appliedFilters).some(Boolean);
  const showFilters = hasData || hasActiveFilters;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await downloadTruckReport(trucks);
    } catch {
      showSnackbar("Erro ao gerar o relatório.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Container maxWidth={false} aria-busy={isLoading}>
      <Box display="flex" flexDirection="column" gap={2} mt={2}>
        <PageHeader
          title="Listagem de Caminhões"
          subtitle="Confira a localização e detalhes dos caminhões disponíveis."
          action={
            <Button
              variant="outlined"
              startIcon={<PictureAsPdfOutlined />}
              onClick={handleExport}
              disabled={!hasData || isExporting}
            >
              {isExporting ? "Gerando..." : "Exportar PDF"}
            </Button>
          }
        />
        <Paper elevation={0} sx={PAPER_STYLES}>
          {showFilters && (
            <TruckFilters
              filters={filters}
              setFilters={setFilters}
              onSearch={handleSearch}
              onKeyDown={handleKeyDown}
              onClear={handleClear}
            />
          )}
          {isLoading && <TruckListSkeleton />}
          {!isLoading && !hasData && <NoResults />}
          {hasData && (
            <>
              <TruckViewMap trucks={trucks} selectedTruck={selectedTruck} />
              <TruckTable
                trucks={trucks}
                selectedTruck={selectedTruck}
                setSelectedTruck={setSelectedTruck}
                setIsDistanceDescending={setIsDistanceDescending}
                isDistanceDescending={isDistanceDescending}
                handleEditOpen={handleEditOpen}
                handleDeleteOpen={handleDeleteOpen}
              />
            </>
          )}
        </Paper>
      </Box>
      <EditTruckDialog
        open={openEditDialog}
        selectedTruck={selectedTruck}
        errors={editErrors}
        handleEditClose={handleEditClose}
        handleSaveEdit={handleSaveEdit}
        handleChangeField={handleChangeField}
        handleChangeDate={handleChangeDate}
      />
      <DeleteTruckDialog
        open={openDeleteDialog}
        selectedTruck={selectedTruck}
        handleDeleteClose={handleDeleteClose}
        handleConfirmDelete={handleConfirmDelete}
      />
    </Container>
  );
};

export default ListTruck;
