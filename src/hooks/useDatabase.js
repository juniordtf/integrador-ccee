import { useEffect, useState } from "react";
import { db } from "../database/db";

/**
 * Custom hook to fetch data from Dexie database with consistent error handling
 * Optimizes repeated database query patterns across views
 */
export const useDatabase = () => {
  const [participants, setParticipants] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [measurementAssets, setMeasurementAssets] = useState([]);
  const [assetParcels, setAssetParcels] = useState([]);
  const [chargeParcels, setChargeParcels] = useState([]);
  const [topology, setTopology] = useState([]);
  const [modeling, setModeling] = useState([]);
  const [genericFaultyRequests, setGenericFaultyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [
          participantesData,
          perfisData,
          ativosMedicaoData,
          parcelasAtivosData,
          parcelasCargaData,
          topologiaData,
          modelagemData,
          genericFaultyData,
        ] = await Promise.all([
          db.participantes.toArray(),
          db.perfis.toArray(),
          db.ativosMedicao.toArray(),
          db.parcelasAtivosMedicao.toArray(),
          db.parcelasDeCarga.toArray(),
          db.topologia.toArray(),
          db.modelagem.toArray(),
          db.genericFaultyRequest.toArray(),
        ]);

        setParticipants(participantesData || []);
        setProfiles(perfisData || []);
        setMeasurementAssets(ativosMedicaoData || []);
        setAssetParcels(parcelasAtivosData || []);
        setChargeParcels(parcelasCargaData || []);
        setTopology(topologiaData || []);
        setModeling(modelagemData || []);
        setGenericFaultyRequests(genericFaultyData || []);
      } catch (error) {
        console.error("Error fetching database data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Extract unique data source keys from all data
  const getDataSourceKeys = () => {
    const keys = [
      ...participants.map((v) => v.key),
      ...profiles.map((v) => v.key),
      ...measurementAssets.map((v) => v.key),
      ...assetParcels.map((v) => v.key),
      ...modeling.map((v) => v.key),
    ];
    return [...new Set(keys)];
  };

  return {
    participants,
    profiles,
    measurementAssets,
    assetParcels,
    chargeParcels,
    topology,
    modeling,
    genericFaultyRequests,
    loading,
    getDataSourceKeys,
  };
};
