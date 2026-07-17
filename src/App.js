import React, { useState, useCallback, memo } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { theme } from "./theme";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import DataSyncView from "./views/dataSync/index";
import DataExportView from "./views/dataExport/index";
import HierarchicalView from "./views/hierarchicalView/index";
import SettingsView from "./views/settings/index";
import DriReportsView from "./views/driReports/index";
import ClientsManagementView from "./views/clientsManagement/index";
import NavigationDrawer from "./components/NavigationDrawer";
import routes from "./routes";

const drawerWidth = 240;

const appBarToolbarStyle = { backgroundColor: "#008357" };
const appBarHeaderStyle = { letterSpacing: 3 };

const App = memo(function App(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <BrowserRouter>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
          }}
        >
          <Toolbar sx={appBarToolbarStyle}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={appBarHeaderStyle}>
              Integrador CCEE
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
          aria-label="mailbox folders"
        >
          <Drawer
            container={container}
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
          >
            <NavigationDrawer />
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
            open
          >
            <NavigationDrawer />
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          <Toolbar />

          <Routes>
            <Route exact path="/" element={<DataSyncView />} />
            <Route exact path="/integrador-ccee" element={<DataSyncView />} />
            <Route exact path="/importarDados" element={<DataSyncView />} />
            <Route exact path="/exportarDados" element={<DataExportView />} />
            <Route
              exact
              path="/visualizacaoHierarquica"
              element={<HierarchicalView />}
            />
            <Route exact path="/relatoriosDRI" element={<DriReportsView />} />
            <Route exact path="/gestaoDeClientes" element={<ClientsManagementView />} />
            <Route exact path="/configuracoes" element={<SettingsView />} />
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  );
});

App.displayName = "App";

export default App;
