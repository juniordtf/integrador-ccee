import React, { useEffect, useState, useRef } from "react";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import styles from "./styles.module.css";

export default function ClientsManagementView() {
  return (
    <Container className={styles.container}>
      <Typography variant="h5" mb={5}>
        Gestão de clientes
      </Typography>
    </Container>
  );
}
