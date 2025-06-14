import { useState, useCallback, useRef, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from "chart.js";
import '../../Common.css';
import "./Dados.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const DICE_IMAGES: { [key: number]: string } = {
    1: '/images/dice-1.png',
    2: '/images/dice-2.png',
    3: '/images/dice-3.png', // Corrected image path for 3, assuming you have it. If not, please adjust.
    4: '/images/dice-4.png',
    5: '/images/dice-5.png',
    6: '/images/dice-6.png',
};

const Dados: React.FC = () => {
    const [resultados, setResultados] = useState<number[]>([]);
    const [lancando, setLancando] = useState(false);
    const [numeroAtual, setNumeroAtual] = useState<number | null>(null);
    const [displayNumero, setDisplayNumero] = useState<number | null>(null);

    // ESTADOS E REFS PARA AUTO PLAY
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const [autoPlayRoundsConfig, setAutoPlayRoundsConfig] = useState<number>(10);
    const [remainingAutoPlayRounds, setRemainingAutoPlayRounds] = useState(0);
    const autoPlayIntervalRef = useRef<number | null>(null);
    const [isFastAutoPlay, setIsFastAutoPlay] = useState(false);

    const rollSound = useRef(new Audio('/sounds/dice_roll.wav'));

    const playSound = useCallback((audioElement: HTMLAudioElement) => {
        if (!isFastAutoPlay) { // Only play sound if not in fast mode
            audioElement.currentTime = 0;
            audioElement.play().catch(e => console.error("Erro ao tocar som:", e));
        }
    }, [isFastAutoPlay]);

    const lancarDado = useCallback(() => {
        if (lancando) return; // Prevent multiple rolls if already rolling

        setLancando(true);
        // Do NOT nullify numeroAtual/displayNumero immediately, let them show the previous result
        playSound(rollSound.current);

        const rollDuration = isFastAutoPlay ? 50 : 1200;
        const animationIntervalDuration = isFastAutoPlay ? 0 : 80;

        let animationInterval: ReturnType<typeof setInterval> | null = null;
        if (!isFastAutoPlay) {
            let rollCount = 0;
            animationInterval = setInterval(() => {
                setDisplayNumero(Math.floor(Math.random() * 6) + 1);
                rollCount++;
                if (rollCount > 10) { // Enough rolls for visual effect
                    clearInterval(animationInterval!);
                }
            }, animationIntervalDuration);
        } else {
            // For fast mode, update display number directly without animation frames
            setDisplayNumero(Math.floor(Math.random() * 6) + 1);
        }

        setTimeout(() => {
            if (animationInterval) {
                clearInterval(animationInterval);
            }

            const resultado = Math.floor(Math.random() * 6) + 1;
            setNumeroAtual(resultado);
            setDisplayNumero(resultado); // Ensure final number is displayed
            setResultados((prev) => [...prev, resultado]);
            setLancando(false);
        }, rollDuration);
    }, [lancando, playSound, rollSound, isFastAutoPlay]);

    // LÓGICA DO AUTO PLAY PARA DADOS
    const iniciarAutoPlay = useCallback(() => {
        if (isAutoPlaying) return;

        if (autoPlayRoundsConfig <= 0) {
            alert("Por favor, selecione um número de rondas maior que 0 para o Auto Play.");
            return;
        }

        setRemainingAutoPlayRounds(autoPlayRoundsConfig);
        setIsAutoPlaying(true);
        // Start the first roll immediately when autoplay starts, if not already rolling
        if (!lancando) {
            lancarDado();
        }
    }, [isAutoPlaying, autoPlayRoundsConfig, lancando, lancarDado]);

    const pararAutoPlay = useCallback(() => {
        setIsAutoPlaying(false);
        if (autoPlayIntervalRef.current) {
            clearTimeout(autoPlayIntervalRef.current);
            autoPlayIntervalRef.current = null;
        }
        setRemainingAutoPlayRounds(0);
    }, []);

    useEffect(() => {
        const intervalSpeed = isFastAutoPlay ? 10 : 1500; // Even faster for fast mode: 10ms

        if (isAutoPlaying) {
            if (remainingAutoPlayRounds > 0 && !lancando) {
                autoPlayIntervalRef.current = setTimeout(() => {
                    lancarDado();
                    setRemainingAutoPlayRounds(prev => prev - 1);
                }, intervalSpeed);
            } else if (remainingAutoPlayRounds === 0) { // If rounds are done
                pararAutoPlay();
            }
        }

        return () => {
            if (autoPlayIntervalRef.current) {
                clearTimeout(autoPlayIntervalRef.current);
                autoPlayIntervalRef.current = null;
            }
        };
    }, [isAutoPlaying, remainingAutoPlayRounds, lancando, lancarDado, pararAutoPlay, isFastAutoPlay]);

    const resetar = useCallback(() => {
        pararAutoPlay();
        setResultados([]);
        setNumeroAtual(null);
        setDisplayNumero(null);
        setLancando(false);
    }, [pararAutoPlay]);

    const contarOcorrencias = useCallback((num: number) => {
        return resultados.filter((r) => r === num).length;
    }, [resultados]);

    const chartDataBar = {
        labels: ["1", "2", "3", "4", "5", "6"],
        datasets: [
            {
                label: "Ocorrências",
                data: [1, 2, 3, 4, 5, 6].map(contarOcorrencias),
                backgroundColor: ['#00FFD1', '#E94560', '#A8DADC', '#FFA500', '#FFD700', '#7FFF00'],
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
                backgroundColor: ['#00FFD1', '#E94560', '#A8DADC', '#FFA500', '#FFD700', '#7FFF00'],
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
                <div className={`dado ${lancando && !isFastAutoPlay ? "lancando" : ""}`}>
                    {displayNumero && (
                        <img
                            src={DICE_IMAGES[displayNumero]}
                            alt={`Dado com ${displayNumero} pontos`}
                            className="dice-image"
                        />
                    )}
                    {!displayNumero && lancando && !isFastAutoPlay && (
                        <div className="rolling-text">A rolar...</div>
                    )}
                    {/* Feedback visual para modo rápido se o dado não estiver visível */}
                     {!displayNumero && lancando && isFastAutoPlay && (
                        <div className="fast-rolling-text">Calculando...</div>
                    )}
                </div>
                {/* Always show the last result message, update content */}
                <div className="last-result">
                    Último resultado: <strong>{numeroAtual !== null ? numeroAtual : 'N/A'}</strong>
                </div>
            </div>

            <div className="action-buttons">
                <button className="action-button" onClick={lancarDado} disabled={lancando || isAutoPlaying}>
                    Lançar Dado
                </button>
                <button className="action-button reset-button" onClick={resetar}>
                    Limpar Dados
                </button>
            </div>

            <div className="autoplay-section">
                <h2>Auto Play</h2>
                <div className="autoplay-controls-wrapper">
                    <div className="autoplay-config">
                        <label htmlFor="autoplay-rounds" className="autoplay-label">Rondas:</label>
                        <input
                            type="range"
                            id="autoplay-rounds"
                            min="1"
                            max="1000"
                            step="1"
                            value={autoPlayRoundsConfig}
                            onChange={(e) => setAutoPlayRoundsConfig(parseInt(e.target.value))}
                            disabled={isAutoPlaying || lancando}
                            className="autoplay-slider"
                        />
                        <span className="autoplay-value">{autoPlayRoundsConfig}</span>
                    </div>

                    <div className="autoplay-speed-toggle">
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={isFastAutoPlay}
                                onChange={() => setIsFastAutoPlay(prev => !prev)}
                                disabled={isAutoPlaying && !isFastAutoPlay}
                            />
                            <span className="slider round"></span>
                        </label>
                        <span className="speed-label">{isFastAutoPlay ? 'Velocidade Rápida' : 'Velocidade Normal'}</span>
                    </div>

                    <div className="autoplay-buttons">
                        {!isAutoPlaying ? (
                            <button
                                className="action-button auto-play-button play-button"
                                onClick={iniciarAutoPlay}
                                disabled={lancando || autoPlayRoundsConfig <= 0}
                                title="Iniciar Auto Play"
                            >
                                <span className="icon">▶️</span> Iniciar Auto Play
                            </button>
                        ) : (
                            <button
                                className="action-button stop-auto-play-button pause-button"
                                onClick={pararAutoPlay}
                                // DO NOT disable if isFastAutoPlay is true
                                disabled={lancando && !isFastAutoPlay}
                                title="Parar Auto Play"
                            >
                                <span className="icon">⏸️</span> Parar Auto Play
                            </button>
                        )}
                    </div>
                </div>
                {isAutoPlaying && (
                    <p className="autoplay-status">
                        Auto Play Ativo! Rondas restantes: <strong>{remainingAutoPlayRounds}</strong>
                    </p>
                )}
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