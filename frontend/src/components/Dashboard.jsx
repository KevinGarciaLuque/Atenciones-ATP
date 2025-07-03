import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaFileExcel } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const Dashboard = ({ sidebarExpanded = true }) => {
  const { token } = useAuth();
  const [datos, setDatos] = useState(null);
  const [usuariosData, setUsuariosData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensajeError, setMensajeError] = useState(null);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const [res1, res2] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/atenciones/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${import.meta.env.VITE_API_URL}/usuarios/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setDatos(res1.data);
        setUsuariosData(res2.data);
      } catch (error) {
        setMensajeError(error.response?.data?.mensaje || 'Error al cargar el dashboard');
      } finally {
        setCargando(false);
      }
    };
    obtenerDatos();
  }, [token]);

  const exportarExcel = () => {
    const wsData = [
      ['Métrica', 'Cantidad'],
      ['Total de Atenciones', datos.totalAtenciones],
      ['Total Oficiales ATP', usuariosData.totalOficiales],
      ['Atenciones de Oficiales', usuariosData.atencionesOficiales],
      ['Total Voluntarios', usuariosData.totalVoluntarios],
      ['Atenciones de Voluntarios', usuariosData.atencionesVoluntarios],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dashboard');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'dashboard_atp.xlsx');
  };

  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" style={{ color: '#88C9A1' }} />
      </div>
    );
  }

  if (mensajeError) {
    return <Alert variant="danger" className="text-center">{mensajeError}</Alert>;
  }

  const dataBar = {
    labels: datos.porEspecialidad.map(item => item.especialidad),
    datasets: [{
      label: 'Atenciones por Especialidad',
      data: datos.porEspecialidad.map(item => item.total),
      backgroundColor: '#88C9A1'
    }]
  };

  const dataPie = {
    labels: datos.porProcedencia.map(item => item.procedencia),
    datasets: [{
      label: 'Atenciones por Procedencia',
      data: datos.porProcedencia.map(item => item.total),
      backgroundColor: ['#88C9A1', '#FFB38E', '#B1D3DB', '#E8C4A2', '#77A9B1']
    }]
  };

  const dataLine = {
    labels: datos.ultimos30.map(item => item.fecha),
    datasets: [{
      label: 'Atenciones en los últimos 30 días',
      data: datos.ultimos30.map(item => item.total),
      borderColor: '#88C9A1',
      backgroundColor: '#B1D3DB',
      fill: true,
      tension: 0.3
    }]
  };

  return (
    <Container
      fluid
      className="mt-4"
      style={{
        paddingLeft: sidebarExpanded ? '0px' : '0px',
        transition: 'padding-left 0.3s ease',
        maxWidth: '100%',
      }}
    >
      <h2 className="text-center fw-bold mb-4" style={{ color: '#26474E' }}>
        Dashboard - ATP Hospital María
      </h2>

      <Row className="mb-3 text-center gx-3 gy-3">
        <Col xs={12} sm={6} md={3}>
          <Card className="shadow-sm p-3" style={{ backgroundColor: '#B1D3DB' }}>
            <h6 className="fw-bold">Total Atenciones</h6>
            <h2>{datos.totalAtenciones}</h2>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Card className="shadow-sm p-3" style={{ backgroundColor: '#E8C4A2' }}>
            <h6 className="fw-bold">Oficiales ATP</h6>
            <h2>{usuariosData.totalOficiales}</h2>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Card className="shadow-sm p-3" style={{ backgroundColor: '#88C9A1' }}>
            <h6 className="fw-bold">Atenciones Oficiales</h6>
            <h2>{usuariosData.atencionesOficiales}</h2>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Card className="shadow-sm p-3" style={{ backgroundColor: '#FFB38E' }}>
            <h6 className="fw-bold">Voluntarios</h6>
            <h2>{usuariosData.totalVoluntarios}</h2>
          </Card>
        </Col>
      </Row>

      <div className="text-end mb-3 pe-3 d-flex justify-content-end justify-content-sm-end justify-content-md-end">
        <Button variant="success" onClick={exportarExcel}>
          <FaFileExcel className="mb-1" /> Exportar Excel
        </Button>
      </div>

      <Row className="gx-3 gy-3">
        <Col xs={12} md={6}>
          <Card className="shadow-sm p-3" style={{ backgroundColor: '#E1EDF2', height: '100%' }}>
            <h6 className="text-center mb-2" style={{ color: '#26474E' }}>Atenciones por Especialidad</h6>
            <div style={{ height: '300px' }}>
              <Bar data={dataBar} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="shadow-sm p-3" style={{ backgroundColor: '#E1EDF2', height: '100%' }}>
            <h6 className="text-center mb-2" style={{ color: '#26474E' }}>Atenciones por Procedencia</h6>
            <div style={{ height: '300px' }}>
              <Pie data={dataPie} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row className="gx-3 gy-3 mt-3">
        <Col xs={12}>
          <Card className="shadow-sm p-3" style={{ backgroundColor: '#E1EDF2', height: '100%' }}>
            <h6 className="text-center mb-2" style={{ color: '#26474E' }}>Atenciones en los Últimos 30 Días</h6>
            <div style={{ height: '300px' }}>
              <Line data={dataLine} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
