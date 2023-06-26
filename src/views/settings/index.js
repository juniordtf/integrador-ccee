import React, { useEffect, useState } from "react";
import { format, parse } from "date-fns";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Alert from "@mui/material/Alert";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { green, red } from "@mui/material/colors";
import styles from "./styles.module.css";

export default function SettingsView(): React$Element<*> {
  const [companyCertificateHolder, setCompanyCertificateHolder] = useState("");
  const [certificate, setCertificate] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profileCode, setProfileCode] = useState("");
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [openSuccesDialog, setSuccesDialogOpen] = useState(false);
  const [authData, setAuthData] = useState([]);
  const [serverData, setServerData] = useState([]);
  const timeStamp = format(new Date(), "dd/MM/yyyy");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("authData"));
    if (data) {
      setAuthData(data);
    }

    const serverData = JSON.parse(localStorage.getItem("serverData"));
    if (serverData) {
      setServerData(serverData);
    }
  }, []);

  const handleSuccessDialogClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSuccesDialogOpen(false);
  };

  const handleCompanyCertificateHolderChange = (event) => {
    setCompanyCertificateHolder(event.target.value);
  };

  const saveCertificate = async () => {
    const data = {
      certificateName: companyCertificateHolder,
      passphrase,
      AuthUsername: username,
      AuthPassword: password,
      AuthCodigoPerfilAgente: profileCode,
      lastModif: timeStamp,
    };
    setAuthData(data);
    localStorage.setItem("authData", JSON.stringify(data));
    setSuccessMessage(
      "Certificado e dados de autenticação salvos com sucesso!"
    );
    setSuccesDialogOpen(true);
  };

  const removeCertificate = (e) => {
    setAuthData([]);
    localStorage.removeItem("authData");
  };

  const saveServer = (e) => {
    const data = { serverAddress: ip + ":" + port, lastModif: timeStamp };
    setServerData(data);
    localStorage.setItem("serverData", JSON.stringify(data));
    setSuccessMessage("Dados do servidor salvos com sucesso!");
    setSuccesDialogOpen(true);
  };

  const removeServerAddress = (e) => {
    setServerData([]);
    localStorage.removeItem("serverData");
  };

  const certificateCard = (
    <React.Fragment>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          Certificado
        </Typography>
        <Typography variant="h5" component="div">
          {authData.certificateName}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          Modificado em {authData.lastModif}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={removeCertificate}>
          Remover
        </Button>
      </CardActions>
    </React.Fragment>
  );

  const serverCard = (
    <React.Fragment>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          Endereço do servidor
        </Typography>
        <Typography variant="h5" component="div">
          {serverData.serverAddress}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          Modificado em {serverData.lastModif}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={removeServerAddress}>
          Remover
        </Button>
      </CardActions>
    </React.Fragment>
  );

  return (
    <div>
      <Typography variant="h5" mb={2}>Configurações</Typography>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography sx={{ width: "33%", flexShrink: 0 }}>
            Certificado
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {authData.certificateName !== undefined ? (
              <CheckCircleIcon sx={{ color: green[500] }} />
            ) : (
              <ErrorIcon sx={{ color: red[500] }} />
            )}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {authData.certificateName !== undefined ? (
            <Box sx={{ maxWidth: 375, marginTop: 2 }}>
              <Card variant="outlined">{certificateCard}</Card>
            </Box>
          ) : (
            <div>
              <Box sx={styles.certificateSection}>
                <FormControl>
                  <FormLabel id="demo-radio-buttons-group-label">
                    Empresa
                  </FormLabel>
                  <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue="CEMIG GT"
                    name="radio-buttons-group"
                    value={companyCertificateHolder}
                    onChange={handleCompanyCertificateHolderChange}
                  >
                    <FormControlLabel
                      value="CEMIG GT"
                      control={<Radio />}
                      label="CEMIG GT"
                    />
                    <FormControlLabel
                      value="CEMIG D"
                      control={<Radio />}
                      label="CEMIG D"
                    />
                    <FormControlLabel
                      value="CEMIG H"
                      control={<Radio />}
                      label="CEMIG H"
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
              <TextField
                sx={{ width: "50%", marginTop: 1 }}
                id="outlined-password-input"
                label="Passphrase"
                type="password"
                autoComplete="current-password"
                onChange={(event) => setPassphrase(event.target.value)}
              />
              <Stack sx={{ width: "50%", marginTop: 3 }} spacing={1}>
                <TextField
                  id="outlined-basic"
                  label="Username"
                  variant="outlined"
                  onChange={(event) => setUsername(event.target.value)}
                />
                <TextField
                  id="outlined-password-input"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  onChange={(event) => setPassword(event.target.value)}
                />
                <TextField
                  id="outlined-basic"
                  label="Código de perfil"
                  variant="outlined"
                  onChange={(event) => setProfileCode(event.target.value)}
                />
              </Stack>

              <Button
                variant="outlined"
                onClick={saveCertificate}
                sx={{ marginTop: 2 }}
              >
                Salvar
              </Button>
            </div>
          )}
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography sx={{ width: "33%", flexShrink: 0 }}>Servidor</Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {serverData.serverAddress !== undefined ? (
              <CheckCircleIcon sx={{ color: green[500] }} />
            ) : (
              <ErrorIcon sx={{ color: red[500] }} />
            )}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {serverData.serverAddress !== undefined ? (
            <Box sx={{ maxWidth: 375, marginTop: 2 }}>
              <Card variant="outlined">{serverCard}</Card>
            </Box>
          ) : (
            <div>
              <Stack sx={{ width: "50%", marginTop: 3 }} spacing={1}>
                <TextField
                  id="outlined-ip"
                  label="IP"
                  variant="outlined"
                  onChange={(event) => setIp(event.target.value)}
                />
                <TextField
                  id="outlined-port"
                  label="Port"
                  variant="outlined"
                  onChange={(event) => setPort(event.target.value)}
                />
              </Stack>
              <Button
                variant="outlined"
                onClick={saveServer}
                sx={{ marginTop: 2 }}
              >
                Salvar
              </Button>
            </div>
          )}
        </AccordionDetails>
      </Accordion>

      <Snackbar
        open={openSuccesDialog}
        autoHideDuration={6000}
        onClose={handleSuccessDialogClose}
      >
        <Alert
          onClose={handleSuccessDialogClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
