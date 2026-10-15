import { Box, Typography } from "@mui/material";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}

const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => (
  <Box
    display="flex"
    flexDirection={{ xs: "column", sm: "row" }}
    alignItems={{ xs: "flex-start", sm: "flex-end" }}
    justifyContent="space-between"
    gap={2}
    mt={2}
  >
    <Box display="flex" flexDirection="column" gap={1.75}>
      <Typography variant="h5" component="h1" fontWeight="bold">
        {title}
      </Typography>
      <Typography variant="subtitle1">{subtitle}</Typography>
    </Box>
    {action}
  </Box>
);

export default PageHeader;
