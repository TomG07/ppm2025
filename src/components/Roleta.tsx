import { useState, useRef } from "react"; // Removido useEffect pois não é necessário para esta alteração
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from "chart.js";
import '../Common.css';
import "./Roleta.css";

// Importar o ficheiro de áudio de 2.5 segundos
import rouletteSpinSound from '/sounds/spin.wav';

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

export default function Roleta() {
    const [resultadoCor, setResultadoCor] = useState<string | null>(null);
    const [historicoCores, setHistoricoCores] = useState<string[]>([]);
    const [anguloRotacao, setAnguloRotacao] = useState(0);
    const [girando, setGirando] = useState(false);

    // Criar instâncias de áudio
    const spinAudio = useRef(new Audio(rouletteSpinSound));

    const segmentosRoleta = [
        { nome: 'Laranja', cor: '#FFA500' },
        { nome: 'Dourado', cor: '#FFD700' },
        { nome: 'Azul Escuro', cor: '#0F3460' },
        { nome: 'Ciano', cor: '#00FFD1' },
        { nome: 'Vermelho', cor: '#E94560' },
        { nome: 'Azul Claro', cor: '#A8DADC' },
    ];

    const girarRoleta = () => {
        if (girando) return;

        setGirando(true);
        setResultadoCor(null);

        // Tocar o som de giro
        spinAudio.current.currentTime = 0;
        spinAudio.current.play().catch(e => console.error("Erro ao tocar som de giro:", e));

        if (navigator.vibrate) {
            navigator.vibrate(200);
        }

        const indiceSorteado = Math.floor(Math.random() * segmentosRoleta.length);
        const corSorteada = segmentosRoleta[indiceSorteado];

        const anguloPorSegmento = 360 / segmentosRoleta.length;
        const anguloDoCentroDoSegmentoSorteado = indiceSorteado * anguloPorSegmento;
        const anguloParaAlinharComPonteiro = (360 - anguloDoCentroDoSegmentoSorteado) % 360;

        const voltasCompletasAnimacao = 5;

        let novoAnguloRotacao = Math.ceil(anguloRotacao / 360) * 360 + (voltasCompletasAnimacao * 360) + anguloParaAlinharComPonteiro;

        while (novoAnguloRotacao <= anguloRotacao) {
            novoAnguloRotacao += 360;
        }

        setAnguloRotacao(novoAnguloRotacao);

        // Ajustar a duração da animação para 2.5 segundos (2500 milissegundos)
        const duracaoAnimacao = 2500; // <--- ALTERADO PARA 2.5 SEGUNDOS

        setTimeout(() => {
            setResultadoCor(corSorteada.nome);
            setHistoricoCores((prev) => [...prev, corSorteada.nome]);
            setGirando(false);

            // Parar o som de giro. Não tocar som de paragem se não for necessário.
            spinAudio.current.pause();
            spinAudio.current.currentTime = 0;

            // Remover a vibração ao parar se não for mais desejada
            if (navigator.vibrate) {
                navigator.vibrate(500);
            }

        }, duracaoAnimacao);
    };

    const resetarRoleta = () => {
        setResultadoCor(null);
        setHistoricoCores([]);
        setGirando(false);
        setAnguloRotacao(0);
        spinAudio.current.pause();
        spinAudio.current.currentTime = 0;
    };

    const contarOcorrenciasCor = (corNome: string) => historicoCores.filter((c) => c === corNome).length;

    const pieChartDataRoleta = {
        labels: segmentosRoleta.map(s => s.nome),
        datasets: [
            {
                data: Array(segmentosRoleta.length).fill(1),
                backgroundColor: segmentosRoleta.map(s => s.cor),
                borderColor: '#1A1A2E',
                borderWidth: 2,
                rotation: -30
            },
        ]
    };

    const pieChartOptionsRoleta = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            tooltip: {
                enabled: false,
            },
            legend: {
                display: false,
            },
        },
    };

    const chartDataBar = {
        labels: segmentosRoleta.map(s => s.nome),
        datasets: [
            {
                label: "Ocorrências",
                data: segmentosRoleta.map(s => contarOcorrenciasCor(s.nome)),
                backgroundColor: segmentosRoleta.map(s => s.cor),
                borderColor: '#1A1A2E',
                borderWidth: 2,
            },
        ],
    };

    const chartDataPie = {
        labels: segmentosRoleta.map(s => s.nome),
        datasets: [
            {
                data: segmentosRoleta.map(s => contarOcorrenciasCor(s.nome)),
                backgroundColor: segmentosRoleta.map(s => s.cor),
                borderColor: '#1A1A2E',
                borderWidth: 2,
            },
        ],
    };

    return (
        <div className="page-container">
            <nav className="navigation-bar">
                <button onClick={() => window.history.back()} className="nav-button">
                    Voltar
                </button>
            </nav>

            <div className="main-header">
                <h1>Roleta da Sorte</h1>
                <p className="subtitle">Gire a roleta e descubra qual cor será sorteada!</p>
            </div>

            <div className="game-container-roleta">
                <div className="roleta-container">
                    <div
                        className="roleta"
                        // A transição CSS também precisa ser ajustada para 2.5s
                        style={{ transform: `rotate(${anguloRotacao}deg)`, transition: girando ? 'transform 2.5s ease-out' : 'none' }}
                    >
                        <Pie data={pieChartDataRoleta} options={pieChartOptionsRoleta} />
                    </div>
                    <div className="ponteiro"></div>
                </div>

                {resultadoCor && (
                    <div className="last-result">
                        Cor sorteada: <strong style={{ color: segmentosRoleta.find(s => s.nome === resultadoCor)?.cor || '#FFF' }}>{resultadoCor}</strong>
                    </div>
                )}
            </div>

            <div className="action-buttons">
                <button className="action-button" onClick={girarRoleta} disabled={girando}>
                    Girar Roleta
                </button>
                <button className="reset-button" onClick={resetarRoleta}>
                    Resetar Roleta
                </button>
            </div>

            <div className="content-container">
                <div className="chart-card">
                    <h2>Gráfico de Barras</h2>
                    <Bar data={chartDataBar} />
                    <div className="total-spins">Total de giros: {historicoCores.length}</div>
                </div>

                <div className="chart-card">
                    <h2>Gráfico Circular</h2>
                    <Pie data={chartDataPie} />
                </div>

                <div className="table-card">
                    <h2>Estatísticas</h2>
                    <table className="result-table">
                        <thead>
                            <tr>
                                <th>Cor</th>
                                <th>Contagem</th>
                                <th>Porcentagem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {segmentosRoleta.map((segmento) => (
                                <tr key={segmento.nome}>
                                    <td style={{ color: segmento.cor }}>{segmento.nome}</td>
                                    <td>{contarOcorrenciasCor(segmento.nome)}</td>
                                    <td>
                                        {historicoCores.length > 0
                                            ? Math.round((contarOcorrenciasCor(segmento.nome) / historicoCores.length) * 100)
                                            : 0}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}