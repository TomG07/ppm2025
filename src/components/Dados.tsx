import { useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from "chart.js";
import '../Common.css';
import "./Dados.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

export default function Dados() {
    const [resultados, setResultados] = useState<number[]>([]);
    const [lancando, setLancando] = useState(false);
    const [numeroAtual, setNumeroAtual] = useState<number | null>(null);

    const lancarDado = () => {
        setLancando(true);
        setTimeout(() => {
            const resultado = Math.floor(Math.random() * 6) + 1;
            setNumeroAtual(resultado);
            setResultados((prev) => [...prev, resultado]);
            setLancando(false);
        }, 1000);
    };

    const resetar = () => {
        setResultados([]);
        setNumeroAtual(null);
    };

    const contarOcorrencias = (num: number) => resultados.filter((r) => r === num).length;

    const chartDataBar = {
        labels: ["1", "2", "3", "4", "5", "6"],
        datasets: [
            {
                label: "Ocorrências",
                data: [1, 2, 3, 4, 5, 6].map(contarOcorrencias),
                backgroundColor: ['#00FFD1', '#E94560', '#A8DADC', '#FFA500', '#FFD700', '#0F3460'],
                borderColor: '#1A1A2E',
                borderWidth: 2,
            },
        ],
    };

    const chartDataPie = {
        labels: ["1", "2", "3", "4", "5", "6"],
        datasets: [
            {
                data: [1, 2, 3, 4, 5, 6].map(contarOcorrencias),
                backgroundColor: ['#00FFD1', '#E94560', '#A8DADC', '#FFA500', '#FFD700', '#0F3460'],
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
                <h1>Lançamento de Dado</h1>
                <p className="subtitle">Lança o dado e analisa as probabilidades!</p>
            </div>

            <div className="game-container">
                <div className={`dado ${lancando ? "lancando" : ""}`}>
                    {numeroAtual && <span className="numero">{numeroAtual}</span>}
                </div>
                {numeroAtual && (
                    <div className="last-result">
                        Último resultado: <strong>{numeroAtual}</strong>
                    </div>
                )}
            </div>

            <div className="action-buttons">
                <button className="action-button" onClick={lancarDado} disabled={lancando}>
                    Lançar Dado
                </button>
                <button className="reset-button" onClick={resetar}>
                    Resetar
                </button>
            </div>

            <div className="content-container">
                <div className="chart-card">
                    <h2>Gráfico de Barras</h2>
                    <Bar data={chartDataBar} />
                    <div className="total-spins">Total de lançamentos: {resultados.length}</div>
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
                                <th>Face</th>
                                <th>Contagem</th>
                                <th>Porcentagem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6].map((face) => (
                                <tr key={face}>
                                    <td>{face}</td>
                                    <td>{contarOcorrencias(face)}</td>
                                    <td>{resultados.length > 0 ? Math.round((contarOcorrencias(face) / resultados.length) * 100) : 0}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}