import React, { memo } from "react";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import SettingsIcon from "@mui/icons-material/Settings";
import FileDownload from "@mui/icons-material/FileDownload";
import FileUpload from "@mui/icons-material/FileUpload";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import WalletIcon from "@mui/icons-material/Wallet";
import DescriptionIcon from "@mui/icons-material/Description";
import { NavLink } from "react-router-dom";

const navLinkStyle = { textDecoration: "none", color: "black" };
const toolbarStyle = { backgroundColor: "#00C080" };

const NavigationItem = memo(({ to, icon: Icon, label }) => (
  <NavLink to={to} style={navLinkStyle}>
    <ListItem button>
      <ListItemIcon>
        <Icon />
      </ListItemIcon>
      <ListItemText primary={label} />
    </ListItem>
  </NavLink>
));

NavigationItem.displayName = "NavigationItem";

const NavigationDrawer = memo(() => (
  <div>
    <Toolbar sx={toolbarStyle} />
    <Divider />
    <List>
      <NavigationItem
        to="/importarDados"
        icon={FileDownload}
        label="Importar Dados"
      />
      <NavigationItem
        to="/exportarDados"
        icon={FileUpload}
        label="Exportar Dados"
      />
      <Divider />
      <NavigationItem
        to="/visualizacaoHierarquica"
        icon={AccountTreeIcon}
        label="Visualização Hierárquica"
      />
      <Divider />
      <NavigationItem
        to="/relatoriosDRI"
        icon={DescriptionIcon}
        label="Relatórios DRI"
      />
      <Divider />
      <NavigationItem
        to="/gestaoDeClientes"
        icon={WalletIcon}
        label="Gestão de Clientes"
      />
      <Divider />
      <NavigationItem
        to="/configuracoes"
        icon={SettingsIcon}
        label="Configurações"
      />
    </List>
  </div>
));

NavigationDrawer.displayName = "NavigationDrawer";

export default NavigationDrawer;
