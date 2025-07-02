import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const Dashboard = () => {
  const { token } = useAuth();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensajeError, setMensajeError] = useState(null);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/atenciones/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDatos(res.data);
      } catch (error) {
        setMensajeError(error.response?.data?.mensaje || 'Error al cargar el dashboard');
      } finally {
        setCargando(false);
      }
    };
    obtenerDatos();
  }, [token]);

  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" style={{ color: '#26474E' }} />
      </div>
    );
  }

  if (mensajeError) {
    return <Alert variant="danger" className="text-center">{mensajeError}</Alert>;
  }

  const dataBar = {
    labels: datos.porEspecialidad.map(item => item.especialidad),
    datasets: [
      {
        label: 'Atenciones por Especialidad',
        data: datos.porEspecialidad.map(item => item.total),
        backgroundColor: '#4D7B82'
      }
    ]
  };

  const dataPie = {
    labels: datos.porProcedencia.map(item => item.procedencia),
    datasets: [
      {
        label: 'Atenciones por Procedencia',
        data: datos.porProcedencia.map(item => item.total),
        backgroundColor: ['#26474E', '#4D7B82', '#77A9B1', '#B1D3DB', '#E1EDF2']
      }
    ]
  };

  const dataLine = {
    labels: datos.ultimos30.map(item => item.fecha),
    datasets: [
      {
        label: 'Atenciones en los últimos 30 días',
        data: datos.ultimos30.map(item => item.total),
        borderColor: '#26474E',
        backgroundColor: '#B1D3DB',
        fill: true,
        tension: 0.3
      }
    ]
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center fw-bold mb-4" style={{ color: '#26474E' }}>
        Dashboard - ATP Hospital María
      </h2>

      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm text-center p-3" style={{ backgroundColor: '#4D7B82', color: 'white' }}>
            <h4>Total de Atenciones</h4>
            <h1 className="fw-bold">{datos.totalAtenciones}</h1>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <Card className="shadow-sm p-3">
            <h5 className="text-center" style={{ color: '#26474E' }}>Atenciones por Especialidad</h5>
            <Bar data={dataBar} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </Card>
        </Col>
        <Col md={6} className="mb-3">
          <Card className="shadow-sm p-3">
            <h5 className="text-center" style={{ color: '#26474E' }}>Atenciones por Procedencia</h5>
            <Pie data={dataPie} options={{ responsive: true }} />
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm p-3">
            <h5 className="text-center" style={{ color: '#26474E' }}>Atenciones en los Últimos 30 Días</h5>
            <Line data={dataLine} options={{ responsive: true }} />
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
