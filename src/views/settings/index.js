import React, { useEffect, useState } from "react";
import { format, parse } from "date-fns";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { FilePicker } from "react-file-picker";
import Snackbar from "@mui/material/Snackbar";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Alert from "@mui/material/Alert";
import { authService } from "../../services/authService.ts";
import styles from "./styles.module.css";

export default function SettingsView(): React$Element<*> {
  const [certificate, setCertificate] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profileCode, setProfileCode] = useState("");
  const [openSuccesDialog, setSuccesDialogOpen] = useState(false);
  const [authData, setAuthData] = useState([]);
  const timeStamp = format(new Date(), "dd/MM/yyyy");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("authData"));
    if (data) {
      setAuthData(data);
    }
  }, []);

  const handleSuccessDialogClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSuccesDialogOpen(false);
  };

  const importCertificate = (FileObject) => {
    try {
      console.log(FileObject);

      console.log(__dirname + FileObject.webkitRelativePath);

      setCertificate(FileObject);
    } catch (err) {
      alert("Erro");
      console.log("Erro: " + err);
    }
  };

  const displayError = (err) => {
    console.log(err);
    return (
      <Alert severity="error">This is an error alert — check it out!</Alert>
    );
  };

  const saveCertificate = async () => {
    const data = {
      certificate,
      certificateName: certificate.name,
      passphrase,
      AuthUsername: username,
      AuthPassword: password,
      AuthCodigoPerfilAgente: profileCode,
      lastModif: timeStamp,
    };
    setAuthData(data);
    localStorage.setItem("authData", JSON.stringify(data));

    const formData = new FormData();
    const fileData = {
      name: certificate.name,
      type: certificate.type,
      uri: certificate.webkitRelativePath,
    };
    formData.append("file", fileData);

    await authService.uploadCertificate(formData);

    setSuccesDialogOpen(true);
  };

  const removeCertificate = (e) => {
    setAuthData([]);
    localStorage.removeItem("authData");
    //setSuccesDialogOpen(true);
  };

  const card = (
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

  return (
    <div>
      <Typography paragraph>Configurações</Typography>

      {authData.certificate !== undefined ? (
        <Box sx={{ maxWidth: 375, marginTop: 2 }}>
          <Card variant="outlined">{card}</Card>
        </Box>
      ) : (
        <div>
          <Box sx={styles.certificateSection}>
            <FilePicker
              extensions={["pfx"]}
              onChange={importCertificate}
              onError={displayError}
              directory=""
              webkitdirectory=""
              type="file"
            >
              <Button variant="outlined">Importar certificado</Button>
            </FilePicker>

            <TextField
              sx={{ width: "50%", marginTop: 1 }}
              id="outlined-password-input"
              label="Passphrase"
              type="password"
              autoComplete="current-password"
              onChange={(event) => setPassphrase(event.target.value)}
            />
          </Box>
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
          Certificado e dados de autenticação salvos com sucesso!
        </Alert>
      </Snackbar>
    </div>
  );
}
