import React, { memo } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

// Memoized modal style to avoid recreation on every render
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 300,
  bgcolor: "background.paper",
  border: "1px solid gray",
  borderRadius: "10px",
  boxShadow: 24,
  p: 4,
  textAlign: "center",
};

const LoadingModal = memo(({ open, onClose }) => (
  <Modal
    open={open}
    onClose={onClose}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description"
  >
    <Box sx={modalStyle}>{/* Content goes here */}</Box>
  </Modal>
));

LoadingModal.displayName = "LoadingModal";

export default LoadingModal;
