import { useState, useCallback, useRef } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from "chart.js";
import '../../Common.css';
import "./Dados.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

// Caminhos para as imagens png dos dados
// Assume-se que estes ficheiros estão em public/images/dados/
const DICE_IMAGES: { [key: number]: string } = {
    1: '/images/dice-1.png',
    2: '/images/dice-2.png',
    3: '/images/dice-3.png',
    4: '/images/dice-4.png',
    5: '/images/dice-5.png',
    6: '/images/dice-6.png',
};

const Dados: React.FC = () => { // Usar React.FC para consistência
    const [resultados, setResultados] = useState<number[]>([]);
    const [lancando, setLancando] = useState(false);
    const [numeroAtual, setNumeroAtual] = useState<number | null>(null);
    const [displayNumero, setDisplayNumero] = useState<number | null>(null); // Número a exibir no dado (para animação)

    // Referências para os elementos de áudio (assumindo que estão em public/sounds/)
    const rollSound = useRef(new Audio('/sounds/dice_roll.wav')); // Novo som para rolar

    // Função auxiliar para tocar som
    const playSound = useCallback((audioElement: HTMLAudioElement) => {
        audioElement.currentTime = 0; // Reset para poder tocar rapidamente
        audioElement.play().catch(e => console.error("Erro ao tocar som:", e));
    }, []);

    // Função para lançar o dado com animação e sons
    const lancarDado = useCallback(() => {
        if (lancando) return;

        setLancando(true);
        setNumeroAtual(null); // Oculta o resultado final durante o lançamento
        playSound(rollSound.current); // Toca o som de rolar

        let rollCount = 0;
        const animationInterval = setInterval(() => {
            // Alterna rapidamente entre faces para simular o rolar
            setDisplayNumero(Math.floor(Math.random() * 6) + 1);
            rollCount++;
            if (rollCount > 10) { // Número de vezes para alternar as faces
                clearInterval(animationInterval);
            }
        }, 80); // Velocidade da alternância (80ms)

        setTimeout(() => {
            clearInterval(animationInterval); // Garante que o intervalo para

            const resultado = Math.floor(Math.random() * 6) + 1;
            setNumeroAtual(resultado);
            setDisplayNumero(resultado); // Define o número final a exibir
            setResultados((prev) => [...prev, resultado]);
            setLancando(false);
        }, 1200); // Tempo total da animação (um pouco mais que o girar CSS)
    }, [lancando, playSound, rollSound]);

    // Função para resetar os resultados
    const resetar = useCallback(() => {
        setResultados([]);
        setNumeroAtual(null);
        setDisplayNumero(null);
        setLancando(false);
    }, []);

    // Função auxiliar para contar ocorrências de um número
    const contarOcorrencias = useCallback((num: number) => {
        return resultados.filter((r) => r === num).length;
    }, [resultados]);

    // Dados para o Gráfico de Barras
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

    // Dados para o Gráfico Circular
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
                    {displayNumero && (
                        <img
                            src={DICE_IMAGES[displayNumero]}
                            alt={`Dado com ${displayNumero} pontos`}
                            className="dice-image"
                        />
                    )}
                    {!displayNumero && lancando && (
                        <div className="rolling-text">A rolar...</div> // Feedback durante o lançamento
                    )}
                </div>
                {numeroAtual !== null && !lancando && ( // Mostra o último resultado apenas se houver um e não estiver a rolar
                    <div className="last-result">
                        Último resultado: <strong>{numeroAtual}</strong>
                    </div>
                )}
            </div>

            <div className="action-buttons">
                <button className="action-button" onClick={lancarDado} disabled={lancando}>
                    Lançar Dado
                </button>
                <button className="action-button reset-button" onClick={resetar}>
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
                                    <td>
                                        {resultados.length > 0
                                            ? `${Math.round((contarOcorrencias(face) / resultados.length) * 100)}%`
                                            : '0%'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dados;