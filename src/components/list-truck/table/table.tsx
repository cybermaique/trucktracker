import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import truckPlaceholder from "../../../assets/images/truck-placeholder.jpg";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  TRUCK_TABLE_COLUMNS,
} from "../../../constants/table";
import { TruckWithDistance } from "../../../interfaces/truck";
import { colors } from "../../../styles/colors";
import { formatDate } from "../../../utils/date";
import { getTruckCellValue } from "../../../utils/list-truck";
import { CustomActionsComponent } from "./custom-actions-component";

interface TruckTableProps {
  trucks: TruckWithDistance[];
  selectedTruck: TruckWithDistance | null;
  setSelectedTruck: (truck: TruckWithDistance | null) => void;
  setIsDistanceDescending: (isDescending: boolean) => void;
  isDistanceDescending: boolean;
  handleEditOpen: (truck: TruckWithDistance) => void;
  handleDeleteOpen: (truck: TruckWithDistance) => void;
}

type ColumnKey = (typeof TRUCK_TABLE_COLUMNS)[number]["key"];

export const TruckTable = ({
  trucks,
  selectedTruck,
  setSelectedTruck,
  setIsDistanceDescending,
  isDistanceDescending,
  handleEditOpen,
  handleDeleteOpen,
}: TruckTableProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuTruck, setMenuTruck] = useState<TruckWithDistance | null>(null);

  useEffect(() => {
    setPage(0);
  }, [trucks, rowsPerPage]);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    truck: TruckWithDistance
  ) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuTruck(truck);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuTruck(null);
  };

  const handleMenuAction = (action: (truck: TruckWithDistance) => void) => {
    if (menuTruck) action(menuTruck);
    handleMenuClose();
  };

  const handleRowKeyDown = (
    event: React.KeyboardEvent,
    truck: TruckWithDistance
  ) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedTruck(truck);
    }
  };

  const renderCell = (truck: TruckWithDistance, key: ColumnKey) => {
    switch (key) {
      case "image":
        return (
          <img
            src={truck.image || truckPlaceholder}
            alt={`Foto do ${truck.identifier}`}
            width={70}
            height={50}
            loading="lazy"
            style={{ objectFit: "cover", borderRadius: 4 }}
          />
        );
      case "start_date":
        return formatDate(truck.start_date);
      case "actions":
        return (
          <IconButton
            aria-label={`Ações para ${truck.identifier}`}
            aria-haspopup="menu"
            onClick={(event) => handleMenuOpen(event, truck)}
          >
            <MoreVertIcon />
          </IconButton>
        );
      default:
        return getTruckCellValue(truck, key);
    }
  };

  const visibleTrucks = trucks.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderColor: colors.chineseWhite }}
    >
      <Box sx={{ overflowX: "auto" }}>
        <Table data-testid="truck-table" aria-label="Lista de caminhões">
          <TableHead>
            <TableRow>
              {TRUCK_TABLE_COLUMNS.map((column) => (
                <TableCell
                  key={column.key}
                  sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}
                  sortDirection={
                    column.sortable && (isDistanceDescending ? "desc" : "asc")
                  }
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active
                      direction={isDistanceDescending ? "desc" : "asc"}
                      onClick={() =>
                        setIsDistanceDescending(!isDistanceDescending)
                      }
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleTrucks.map((truck) => {
              const isSelected = selectedTruck?.id === truck.id;

              return (
                <TableRow
                  key={truck.id}
                  hover
                  selected={isSelected}
                  tabIndex={0}
                  aria-selected={isSelected}
                  onClick={() => setSelectedTruck(truck)}
                  onKeyDown={(event) => handleRowKeyDown(event, truck)}
                  sx={{ cursor: "pointer" }}
                >
                  {TRUCK_TABLE_COLUMNS.map((column) => (
                    <TableCell key={column.key}>
                      {renderCell(truck, column.key)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleMenuAction(handleEditOpen)}>
          Editar
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction(handleDeleteOpen)}>
          Excluir
        </MenuItem>
      </Menu>

      <Box
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems="center"
        gap={1}
        padding={2}
      >
        <Typography variant="body1" role="status">
          {trucks.length}{" "}
          {trucks.length === 1
            ? "Resultado encontrado"
            : "Resultados encontrados"}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body1" id="rows-per-page-label">
            Exibir
          </Typography>
          <Select
            value={rowsPerPage}
            onChange={(event) => setRowsPerPage(Number(event.target.value))}
            size="small"
            inputProps={{ "aria-labelledby": "rows-per-page-label" }}
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
          <Typography variant="body1">registros por página</Typography>
        </Box>
        <TablePagination
          component="div"
          count={trucks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_event, newPage) => setPage(newPage)}
          ActionsComponent={CustomActionsComponent}
          rowsPerPageOptions={[]}
          labelRowsPerPage=""
          labelDisplayedRows={() => ""}
        />
      </Box>
    </TableContainer>
  );
};
