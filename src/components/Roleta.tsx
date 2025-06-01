import React, { useState, useRef, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from 'chart.js';
import '../Common.css';
import './Roleta.css';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Roleta: React.FC = () => {
    const [spinning, setSpinning] = useState<boolean>(false);
    const [result, setResult] = useState<number | null>(null);
    const [resultsHistory, setResultsHistory] = useState<number[]>([]);
    const [rotation, setRotation] = useState<number>(0);
    const [autoMode, setAutoMode] = useState<boolean>(false);
    const wheelRef = useRef<HTMLDivElement>(null);

    const segmentColor = '#E8ECEF'; // Very light gray, clean and modern
    const segments = 8; // Maintain 8 segments
    const segmentColors = Array(segments).fill(segmentColor); // Single color for all segments

    const spinWheel = () => {
        if (spinning) return;

        setSpinning(true);
        const segmentAngle = 360 / segments;

        // Reset to 0 degrees instantly
        setRotation(0);

        setTimeout(() => {
            const randomSegment = Math.floor(Math.random() * segments);
            const offset = segmentAngle / 2;
            const spinDegrees = 5 * 360 + randomSegment * segmentAngle + offset;

            setRotation(spinDegrees);

            setTimeout(() => {
                setResult(randomSegment);
                setResultsHistory((prev) => [...prev, randomSegment]);
                setSpinning(false);
            }, 5000);
        }, 100);
    };

    // Auto-spin every 10 seconds if autoMode is enabled
    useEffect(() => {
        if (!autoMode) return;

        const interval = setInterval(() => {
            spinWheel();
        }, 10000);

        return () => clearInterval(interval);
    }, [autoMode]);

    const calculateStatistics = () => {
        const stats: Record<number, { count: number; percentage: number }> = {};
        segmentColors.forEach((_, index) => {
            stats[index] = { count: 0, percentage: 0 };
        });
        resultsHistory.forEach((num) => {
            stats[num].count++;
        });
        if (resultsHistory.length > 0) {
            Object.keys(stats).forEach((key) => {
                const num = parseInt(key);
                stats[num].percentage = Math.round((stats[num].count / resultsHistory.length) * 100);
            });
        }
        return stats;
    };

    const stats = calculateStatistics();

    const chartDataBar = {
        labels: segmentColors.map((_, i) => `Número ${i + 1}`),
        datasets: [
            {
                label: 'Ocorrências',
                data: segmentColors.map((_, i) => stats[i]?.count || 0),
                backgroundColor: segmentColors,
                borderColor: '#1A1A2E',
                borderWidth: 2,
            },
        ],
    };

    const chartDataPie = {
        labels: segmentColors.map((_, i) => `Número ${i + 1}`),
        datasets: [
            {
                data: segmentColors.map((_, i) => stats[i]?.count || 0),
                backgroundColor: segmentColors,
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
                <h1>Jogo da Roleta</h1>
                <p className="subtitle">Gire a roleta e analisa as probabilidades!</p>
            </div>

            <div className="game-container">
                <div className="roulette-wrapper">
                    <div
                        ref={wheelRef}
                        className="roulette-wheel"
                        style={{
                            transform: `rotate(${rotation}deg)`,
                            transition: spinning
                                ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
                                : 'transform 0.1s linear',
                            background: segmentColor,
                        }}
                    >
                        {segmentColors.map((_, i) => {
                            const segmentAngle = 360 / segments;
                            const baseAngle = (360 - (i * segmentAngle + segmentAngle / 2)) % 360;
                            const radius = 100;
                            const x = radius * Math.cos((baseAngle * Math.PI) / 180);
                            const y = radius * Math.sin((baseAngle * Math.PI) / 180);
                            const numberRotation = -baseAngle;
                            return (
                                <div
                                    key={i}
                                    className="roulette-number"
                                    style={{
                                        position: 'absolute',
                                        left: `calc(50% + ${x}px)`,
                                        top: `calc(50% - ${y}px)`,
                                        transform: `translate(-50%, -50%) rotate(${numberRotation}deg)`,
                                        color: '#333',
                                        textShadow: '0 0 2px #fff',
                                        fontSize: '1.2rem',
                                        fontWeight: 'bold',
                                        pointerEvents: 'none',
                                        transformOrigin: 'center',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {i + 1}
                                </div>
                            );
                        })}
                    </div>
                    <div className="roulette-pointer"></div>
                </div>
                {result !== null && (
                    <div className="last-result">
                        Último resultado: <strong>{result + 1}</strong>
                    </div>
                )}
            </div>

            <div className="action-buttons">
                <button className="action-button" onClick={spinWheel} disabled={spinning}>
                    {spinning ? 'A girar...' : 'Girar Roleta'}
                </button>
                <button
                    className="reset-button"
                    onClick={() => {
                        setResultsHistory([]);
                        setRotation(0);
                        setResult(null);
                    }}
                    disabled={spinning}
                >
                    Limpar
                </button>
            </div>

            {resultsHistory.length > 0 && (
                <div className="content-container">
                    <div className="chart-card">
                        <h2>Gráfico de Barras</h2>
                        <Bar data={chartDataBar} />
                        <div className="total-spins">Total de giros: {resultsHistory.length}</div>
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