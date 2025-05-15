import React, { useState, useRef } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import "./Roleta.css"
import { useLocation, useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

const Roleta: React.FC = () => {
    const [spinning, setSpinning] = useState<boolean>(false);
    const [result, setResult] = useState<number | null>(null);
    const [resultsHistory, setResultsHistory] = useState<number[]>([]);
    const [rotation, setRotation] = useState<number>(0);
    const wheelRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const handleGoBack = () => {
        const previousScrollPosition = location.state?.scrollPosition || 0;
        navigate(-1);
        setTimeout(() => {
            window.scrollTo(0, previousScrollPosition);
        }, 0);
    };

    // Cores distintas para cada segmento (8 cores)
    const segmentColors = [
        '#E94560', '#00FFD1', '#0F3460', '#FFA500',
        '#16213E', '#FFD700', '#1A1A2E', '#A8DADC'
    ];

    // Girar a roleta
    const spinWheel = () => {
        if (spinning) return;

        setSpinning(true);
        const segments = segmentColors.length;
        const randomSegment = Math.floor(Math.random() * segments);
        const fullRotations = 5;
        const degrees = 360 * fullRotations + (360 - (randomSegment * (360 / segments)));

        setRotation(prev => prev + degrees);
        setTimeout(() => {
            setResult(randomSegment);
            setResultsHistory(prev => [...prev, randomSegment]);
            setSpinning(false);
        }, 5000);
    };

    // Calcular estatísticas
    const calculateStatistics = () => {
        const stats: Record<number, { count: number, percentage: number }> = {};

        segmentColors.forEach((_, index) => {
            stats[index] = { count: 0, percentage: 0 };
        });

        resultsHistory.forEach(num => {
            stats[num].count++;
        });

        if (resultsHistory.length > 0) {
            Object.keys(stats).forEach(key => {
                const num = parseInt(key);
                stats[num].percentage = Math.round((stats[num].count / resultsHistory.length) * 100);
            });
        }

        return stats;
    };

    const stats = calculateStatistics();

    // Dados para o gráfico (com cores da roleta)
    const chartData = {
        labels: segmentColors.map((_, i) => `Número ${i + 1}`),
        datasets: [
            {
                data: segmentColors.map((_, i) => stats[i]?.count || 0),
                backgroundColor: segmentColors, // cores vivas iguais às da roleta
                borderColor: '#1A1A2E',
                borderWidth: 2,
            },
        ],
    };

    return (
        <div className="page-container">
            <nav className="navigation-bar">
                <button onClick={handleGoBack} className="nav-button">
                    Voltar
                </button>
            </nav>

            <div className="main-header">
                <h1>Jogo da Roleta</h1>
                <p className="subtitle">Gire a roleta e analise as probabilidades!</p>
            </div>

            <div className="roulette-container">
                <div
                    ref={wheelRef}
                    className="roulette-wheel"
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transition: spinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                        background: `conic-gradient(${segmentColors.map((color, i) => `${color} ${i * (360 / segmentColors.length)}deg ${(i + 1) * (360 / segmentColors.length)}deg`).join(', ')})`
                    }}
                >
                    {segmentColors.map((_, i) => {
                        const angle = (i + 0.5) * (360 / segmentColors.length);
                        const radius = 100; // ajustar conforme o tamanho do wheel
                        const x = radius * Math.cos((angle * Math.PI) / 180);
                        const y = radius * Math.sin((angle * Math.PI) / 180);
                        return (
                            <div
                                key={i}
                                style={{
                                    position: 'absolute',
                                    left: `calc(50% + ${x}px)`,
                                    top: `calc(50% - ${y}px)`,
                                    transform: 'translate(-50%, -50%)',
                                    color: '#fff',
                                    textShadow: '0 0 3px #000',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                    pointerEvents: 'none',
                                }}
                            >
                                {i + 1}
                            </div>
                        );
                    })}

                </div>

                <div className="roulette-pointer"></div>

                {result !== null && (
                    <div className="last-result">
                        Último resultado: <strong>{result + 1}</strong>
                    </div>
                )}
            </div>

            <div className="action-buttons">
                <button
                    className="action-button"
                    onClick={spinWheel}
                    disabled={spinning}
                >
                    {spinning ? 'A girar...' : 'Girar Roleta'}
                </button>
                <button
                    className="reset-button"
                    onClick={() => {
                        setResultsHistory([]);
                        setRotation(0);
                        setResult(null);
                    }}
                    disabled={spinning}>
                    Resetar Dados
                </button>

            </div>

            {resultsHistory.length > 0 && (
                <div className="content-container">
                    <div className="chart-card">
                        <h2>Distribuição de Resultados</h2>
                        <Pie data={chartData} />
                        <div className="total-spins">Total de giros: {resultsHistory.length}</div>
                    </div>

                    <div className="table-card">
                        <h2>Tabela de Frequência</h2>
                        <table className="result-table">
                            <thead>
                                <tr>
                                    <th>Número</th>
                                    <th>Contagem</th>
                                    <th>Porcentagem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {segmentColors.map((_, i) => (
                                    <tr key={i}>
                                        <td>{i + 1}</td>
                                        <td>{stats[i].count}</td>
                                        <td>{stats[i].percentage}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Roleta;