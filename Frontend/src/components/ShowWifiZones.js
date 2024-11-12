import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);
let idCounter = 1;

const ShowWifiZones = () => {
  const url = process.env.REACT_APP_API_URL;
  const [wifiZones, setWifiZones] = useState([]);
  const [wifiZoneData, setWifiZoneData] = useState({
    id: "",
    name: "",
    latitude: "",
    longitude: "",
    punto_zwf: "",
    propietario: "",
    contrato: "",
    sector: "",
  });
  const [operation, setOperation] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    getWifiZones();
  }, []);

  const getWifiZones = async () => {
    try {
      const response = await axios.get(`${url}/wifi-zones`);
      setWifiZones(response.data);
      const maxId = Math.max(...response.data.map((zone) => zone.id), 0);
      idCounter = maxId + 1;
    } catch (error) {
      showAlert("Error al obtener las zonas wifi", "error");
    }
  };

  const showAlert = (message, icon) => {
    MySwal.fire({
      title: message,
      icon: icon,
      timer: 3000,
      showConfirmButton: false,
    });
  };

  const openModal = (op, wifiZone = {}) => {
    setOperation(op);
    setTitle(op === 1 ? "Agregar Zona Wifi" : "Editar Zona Wifi");
    setWifiZoneData(
      op === 2
        ? { ...wifiZone }
        : {
            id: "",
            name: "",
            latitude: "",
            longitude: "",
            punto_zwf: "",
            propietario: "",
            contrato: "",
            sector: "",
          }
    );
    setTimeout(() => {
      document.getElementById("name").focus();
    }, 500);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setWifiZoneData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const validar = () => {
    const {
      id,
      name,
      latitude,
      longitude,
      punto_zwf,
      propietario,
      contrato,
      sector,
    } = wifiZoneData;

    if (operation === 2 && (String(id).trim() === "" || isNaN(parseInt(id)))) {
      showAlert("El campo ID debe ser un número entero válido", "error");
      return false;
    }
    if (!name.trim()) {
      showAlert("El campo nombre es obligatorio", "error");
      return false;
    }
    if (!latitude.trim() || isNaN(parseFloat(latitude))) {
      showAlert("El campo latitud debe ser un número válido", "error");
      return false;
    }
    if (!longitude.trim() || isNaN(parseFloat(longitude))) {
      showAlert("El campo longitud debe ser un número válido", "error");
      return false;
    }
    if (!punto_zwf.trim()) {
      showAlert("El campo punto zwf es obligatorio", "error");
      return false;
    }
    if (!propietario.trim()) {
      showAlert("El campo propietario es obligatorio", "error");
      return false;
    }
    if (!contrato.trim()) {
      showAlert("El campo contrato es obligatorio", "error");
      return false;
    }
    if (!sector.trim()) {
      showAlert("El campo sector es obligatorio", "error");
      return false;
    }

    const parametros = {
      ...wifiZoneData,
      id: parseInt(id),
    };
    const metodo = operation === 1 ? "POST" : "PUT";
    saveWifiZone(parametros, metodo);
  };

  const saveWifiZone = async (parametros, metodo) => {
    if (metodo === "POST") {
      parametros.id = idCounter++;
    } else {
      parametros.id = parseInt(parametros.id);
    }

    try {
      const endpointUrl =
        metodo === "PUT"
          ? `${url}/wifi-zones/${parametros.id}`
          : `${url}/wifi-zones`;

      const response = await axios({
        method: metodo,
        url: endpointUrl,
        data: parametros,
      });

      const tipo = response.data.tipo || "success";
      const mensaje = response.data.mensaje || "Operación exitosa";

      showAlert(mensaje, tipo);

      if (tipo === "success") {
        document.getElementById("btnCerrar").click();
        getWifiZones();
      }
    } catch (error) {
      console.error("Error en la solicitud:", error.response || error);
      showAlert("Error al guardar la zona wifi", "error");
    }
  };

  const deleteWifiZone = async (id, name) => {
    MySwal.fire({
      title: "¿Está seguro de eliminar la zona wifi?",
      icon: "question",
      text: `La zona wifi ${name} será eliminada`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${url}/wifi-zones/${id}`);
          showAlert("Zona wifi eliminada correctamente", "success");
          getWifiZones();
        } catch (error) {
          console.error("Error al eliminar:", error.response || error);
          showAlert("Error al eliminar la zona wifi", "error");
        }
      } else {
        showAlert("Operación cancelada", "info");
      }
    });
  };

  return (
    <div className="App">
      <div className="container-fluid">
        <div className="row-cols-md-1 mt-3">
          <div className="col-md-4 offset-md-4">
            <div className="d-grid mx-auto">
              <button
                onClick={() => openModal(1)}
                className="btn btn-dark"
                data-bs-toggle="modal"
                data-bs-target="#modalWifiZones"
              >
                <i className="fa-solid fa-circle-plus"></i> Agregar Zona Wifi
              </button>
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12 col-lg-8 offset-0 offset-lg-2">
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Latitud</th>
                    <th>Longitud</th>
                    <th>Punto ZWF</th>
                    <th>Propietario</th>
                    <th>Contrato</th>
                    <th>Sector</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody className="table-group-divider">
                  {wifiZones.map((wifiZone, index) => (
                    <tr key={wifiZone.id}>
                      <td>{index + 1}</td>
                      <td>{wifiZone.name}</td>
                      <td>{wifiZone.latitude}</td>
                      <td>{wifiZone.longitude}</td>
                      <td>{wifiZone.punto_zwf}</td>
                      <td>{wifiZone.propietario}</td>
                      <td>{wifiZone.contrato}</td>
                      <td>{wifiZone.sector}</td>
                      <td>
                        <button
                          onClick={() => openModal(2, wifiZone)}
                          className="btn btn-warning"
                          data-bs-toggle="modal"
                          data-bs-target="#modalWifiZones"
                        >
                          <i className="fa-solid fa-edit"></i>
                        </button>
                        &nbsp;
                        <button
                          onClick={() =>
                            deleteWifiZone(wifiZone.id, wifiZone.name)
                          }
                          className="btn btn-danger"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div id="modalWifiZones" className="modal fade" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <label className="h5">{title}</label>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {operation === 2 && (
                <div className="input-group mb-3">
                  <span className="input-group-text">
                    <i className="fa-solid fa-key"></i>
                  </span>
                  <input
                    type="text"
                    id="id"
                    className="form-control"
                    value={wifiZoneData.id}
                    onChange={handleInputChange}
                    placeholder="ID"
                    readOnly
                  />
                </div>
              )}
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa-solid fa-location-pin"></i>
                </span>
                <input
                  type="text"
                  id="name"
                  className="form-control"
                  value={wifiZoneData.name}
                  onChange={handleInputChange}
                  placeholder="Nombre"
                />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa-solid fa-location-dot"></i>
                </span>
                <input
                  type="text"
                  id="latitude"
                  className="form-control"
                  value={wifiZoneData.latitude}
                  onChange={handleInputChange}
                  placeholder="Latitud"
                />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa-solid fa-location-dot"></i>
                </span>
                <input
                  type="text"
                  id="longitude"
                  className="form-control"
                  value={wifiZoneData.longitude}
                  onChange={handleInputChange}
                  placeholder="Longitud"
                />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa-solid fa-wifi"></i>
                </span>
                <input
                  type="text"
                  id="punto_zwf"
                  className="form-control"
                  value={wifiZoneData.punto_zwf}
                  onChange={handleInputChange}
                  placeholder="Punto ZWF"
                />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa-solid fa-user"></i>
                </span>
                <input
                  type="text"
                  id="propietario"
                  className="form-control"
                  value={wifiZoneData.propietario}
                  onChange={handleInputChange}
                  placeholder="Propietario"
                />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa-solid fa-file-contract"></i>
                </span>
                <input
                  type="text"
                  id="contrato"
                  className="form-control"
                  value={wifiZoneData.contrato}
                  onChange={handleInputChange}
                  placeholder="Contrato"
                />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa-solid fa-map"></i>
                </span>
                <input
                  type="text"
                  id="sector"
                  className="form-control"
                  value={wifiZoneData.sector}
                  onChange={handleInputChange}
                  placeholder="Sector"
                />
              </div>
              <div className="d-grid col-6 mx-auto">
                <button onClick={validar} className="btn btn-success">
                  Guardar
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                id="btnCerrar"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowWifiZones;
