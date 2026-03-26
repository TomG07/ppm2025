import { useState, useRef, useCallback, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from "chart.js";
import '../../Common.css';
import "./Roleta.css";

import rouletteSpinSound from '/sounds/spin.wav';

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const segmentosRoleta = [
    { nome: 'Laranja', cor: '#FFA500' },
    { nome: 'Dourado', cor: '#FFD700' },
    { nome: 'Verde Lima', cor: '#7FFF00' },
    { nome: 'Ciano', cor: '#00FFD1' },
    { nome: 'Vermelho', cor: '#E94560' },
    { nome: 'Azul Claro', cor: '#A8DADC' },
];

export default function Roleta() {
    const [resultadoCor, setResultadoCor] = useState<string | null>(null);
    const [historicoCores, setHistoricoCores] = useState<string[]>([]);
    const [anguloRotacao, setAnguloRotacao] = useState(0);
    const [girando, setGirando] = useState(false);
    const [animandoPonteiro, setAnimandoPonteiro] = useState(false);

    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const [autoPlayRoundsConfig, setAutoPlayRoundsConfig] = useState<number>(5);
    const [remainingAutoPlayRounds, setRemainingAutoPlayRounds] = useState(0);
    const autoPlayIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isFastAutoPlay, setIsFastAutoPlay] = useState(false);

    const spinAudio = useRef(new Audio(rouletteSpinSound));

    const playSound = useCallback((audioElement: HTMLAudioElement) => {
        if (!isFastAutoPlay) {
            audioElement.currentTime = 0;
            audioElement.play().catch(e => console.error("Erro ao tocar som de giro:", e));
        }
    }, [isFastAutoPlay]);

    const girarRoleta = useCallback(() => {
        if (girando) return;

        setGirando(true);
        setAnimandoPonteiro(false);

        playSound(spinAudio.current);

        const indiceSorteado = Math.floor(Math.random() * segmentosRoleta.length);
        const corSorteada = segmentosRoleta[indiceSorteado];

        const anguloPorSegmento = 360 / segmentosRoleta.length;
        const anguloDoCentroDoSegmentoSorteado = indiceSorteado * anguloPorSegmento;
        const anguloParaAlinharComPonteiro = (360 - anguloDoCentroDoSegmentoSorteado) % 360;

        const voltasCompletasAnimacao = 5;

        let novoAnguloRotacao = anguloRotacao + (voltasCompletasAnimacao * 360) + anguloParaAlinharComPonteiro + (360 - (anguloRotacao % 360));
        if (novoAnguloRotacao <= anguloRotacao) {
            novoAnguloRotacao += 360;
        }

        const duracaoAnimacao = isFastAutoPlay ? 50 : 2500;
        const ponteiroAnimacaoDuracao = isFastAutoPlay ? 0 : 400;

        if (!isFastAutoPlay) {
            setAnguloRotacao(novoAnguloRotacao);
        } else {
            setAnguloRotacao(anguloParaAlinharComPonteiro);
        }

        setTimeout(() => {
            setResultadoCor(corSorteada.nome);
            setHistoricoCores((prev) => [...prev, corSorteada.nome]);
            setGirando(false);

            if (!isFastAutoPlay) {
                spinAudio.current.pause();
                spinAudio.current.currentTime = 0;
            }

            if (!isFastAutoPlay) {
                setAnimandoPonteiro(true);
                setTimeout(() => {
                    setAnimandoPonteiro(false);
                }, ponteiroAnimacaoDuracao);
            }
        }, duracaoAnimacao);
    }, [girando, anguloRotacao, playSound, spinAudio, isFastAutoPlay]);

    const iniciarAutoPlay = useCallback(() => {
        if (isAutoPlaying) return;

        if (autoPlayRoundsConfig <= 0) {
            alert("Por favor, selecione um número de giros maior que 0 para o Auto Play.");
            return;
        }

        setRemainingAutoPlayRounds(autoPlayRoundsConfig);
        setIsAutoPlaying(true);
        if (!girando) {
            girarRoleta();
        }
    }, [isAutoPlaying, autoPlayRoundsConfig, girando, girarRoleta]);

    const pararAutoPlay = useCallback(() => {
        setIsAutoPlaying(false);
        if (autoPlayIntervalRef.current) {
            clearTimeout(autoPlayIntervalRef.current);
            autoPlayIntervalRef.current = null;
        }
        setRemainingAutoPlayRounds(0);
    }, []);

    useEffect(() => {
        const intervalSpeed = isFastAutoPlay ? 10 : 3000;

        if (isAutoPlaying) {
            if (remainingAutoPlayRounds > 0 && !girando) {
                autoPlayIntervalRef.current = setTimeout(() => {
                    girarRoleta();
                    setRemainingAutoPlayRounds(prev => prev - 1);
                }, intervalSpeed);
            } else if (remainingAutoPlayRounds === 0) {
                pararAutoPlay();
            }
        }

        return () => {
            if (autoPlayIntervalRef.current) {
                clearTimeout(autoPlayIntervalRef.current);
                autoPlayIntervalRef.current = null;
            }
        };
    }, [isAutoPlaying, remainingAutoPlayRounds, girando, girarRoleta, pararAutoPlay, isFastAutoPlay]);

    const resetarRoleta = useCallback(() => {
        pararAutoPlay();
        setResultadoCor(null);
        setHistoricoCores([]);
        setGirando(false);
        setAnguloRotacao(0);
        setAnimandoPonteiro(false);
        spinAudio.current.pause();
        spinAudio.current.currentTime = 0;
    }, [pararAutoPlay, spinAudio]);

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
                <div
                    className="roleta-container"
                    style={{ transition: isFastAutoPlay ? 'none' : 'transform 2.5s ease-out' }}
                >
                    <div
                        className="roleta"
                        style={{ transform: `rotate(${anguloRotacao}deg)`, transition: girando && !isFastAutoPlay ? 'transform 2.5s ease-out' : 'none' }}
                    >
                        <Pie data={pieChartDataRoleta} options={pieChartOptionsRoleta} />
                    </div>
                    {!isFastAutoPlay && <div className={`ponteiro ${animandoPonteiro ? 'animating' : ''}`}></div>}
                </div>

                <div className="last-result">
                    Cor sorteada: <strong style={{ color: resultadoCor ? segmentosRoleta.find(s => s.nome === resultadoCor)?.cor || '#FFF' : '#FFF' }}>
                        {resultadoCor !== null ? resultadoCor : 'N/A'}
                    </strong>
                </div>
            </div>

            <div className="action-buttons">
                <button className="action-button" onClick={girarRoleta} disabled={girando || isAutoPlaying}>
                    Girar Roleta
                </button>
                <button className="reset-button" onClick={resetarRoleta}>
                    Limpar Dados
                </button>
            </div>

            <div className="autoplay-section">
                <h2>Auto Play</h2>
                <div className="autoplay-controls-wrapper">
                    <div className="autoplay-config">
                        <label htmlFor="autoplay-rounds" className="autoplay-label">Giros:</label>
                        <input
                            type="range"
                            id="autoplay-rounds"
                            min="1"
                            max="1000"
                            step="1"
                            value={autoPlayRoundsConfig}
                            onChange={(e) => setAutoPlayRoundsConfig(parseInt(e.target.value))}
                            disabled={isAutoPlaying || girando}
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
                                disabled={girando || autoPlayRoundsConfig <= 0}
                                title="Iniciar Auto Play"
                            >
                                <span className="icon">▶️</span> Iniciar Auto Play
                            </button>
                        ) : (
                            <button
                                className="action-button stop-auto-play-button pause-button"
                                onClick={pararAutoPlay}
                                disabled={girando && !isFastAutoPlay}
                                title="Parar Auto Play"
                            >
                                <span className="icon">⏸️</span> Parar Auto Play
                            </button>
                        )}
                    </div>
                </div>
                {isAutoPlaying && (
                    <p className="autoplay-status">
                        Auto Play Ativo! Giros restantes: <strong>{remainingAutoPlayRounds}</strong>
                    </p>
                )}
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
