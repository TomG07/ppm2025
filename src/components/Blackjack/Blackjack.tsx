import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import '../../Common.css';
import './Blackjack.css';
import Card from './Card';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

type CardValue = number | string;

const Blackjack: React.FC = () => {
    const [playerCards, setPlayerCards] = useState<CardValue[]>([]);
    const [dealerCards, setDealerCards] = useState<CardValue[]>([]);
    const [isGameOver, setIsGameOver] = useState(false);
    const [message, setMessage] = useState('');
    const [stats, setStats] = useState({ wins: 0, losses: 0, ties: 0 });
    const [gameStarted, setGameStarted] = useState(false);
    const [isDealerTurn, setIsDealerTurn] = useState(false);
    const [hiddenDealerCardIndex, setHiddenDealerCardIndex] = useState<number | null>(null);
    const [messageClass, setMessageClass] = useState('');

    // Audio references
    const dealSound = useRef(new Audio('/sounds/card_deal.wav'));
    const winSound = useRef(new Audio('/sounds/win.wav'));
    const loseSound = useRef(new Audio('/sounds/lose/lose.wav')); // Certifique-se que o caminho está correto
    const tieSound = useRef(new Audio('/sounds/tie.wav'));

    // Ref para controlar o timeout do Blackjack inicial para evitar duplicações
    const blackjackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Function to play sound
    const playSound = useCallback((audioElement: HTMLAudioElement) => {
        audioElement.currentTime = 0; // Reset to play quickly
        audioElement.play().catch(e => console.error("Error playing sound:", e));
    }, []);

    // Generates a random card (value, not suit)
    const getRandomCard = (): CardValue => {
        const value = Math.floor(Math.random() * 13) + 1; // 1 to 13
        if (value === 1) return 'A';
        if (value === 11) return 'J';
        if (value === 12) return 'Q';
        if (value === 13) return 'K';
        return value;
    };

    // Sums card values, handling Aces
    const sumCards = (cards: CardValue[]): number => {
        let sum = 0;
        let numAces = 0;

        for (const card of cards) {
            if (card === 'A') {
                numAces += 1;
                sum += 11;
            } else if (card === 'J' || card === 'Q' || card === 'K') {
                sum += 10;
            } else {
                sum += card as number;
            }
        }

        while (sum > 21 && numAces > 0) {
            sum -= 10;
            numAces -= 1;
        }
        return sum;
    };

    // Function to reset game state
    const resetGame = useCallback(() => {
        setPlayerCards([]);
        setDealerCards([]);
        setIsGameOver(false);
        setMessage('');
        setGameStarted(false);
        setIsDealerTurn(false);
        setHiddenDealerCardIndex(null);
        setMessageClass('');
        // Limpar qualquer timeout pendente ao reiniciar o jogo
        if (blackjackTimeoutRef.current) {
            clearTimeout(blackjackTimeoutRef.current);
            blackjackTimeoutRef.current = null;
        }
    }, []);

    // Function to end the game and update stats (now more strictly controlled by effects)
    const endGame = useCallback((resultMessage: string, resultKey: 'wins' | 'losses' | 'ties') => {
        // ESSENCIAL: Se o jogo JÁ ESTÁ TERMINADO, não faça nada.
        // Isto é a defesa final para evitar múltiplas atualizações de estatísticas.
        setIsGameOver(prevIsGameOver => {
            if (prevIsGameOver) {
                console.warn(`endGame called with "${resultMessage}", but game was already over. Ignoring.`);
                return prevIsGameOver; // Return current true state
            }

            // Se não estava terminado, processa o fim do jogo
            setMessage(resultMessage);
            if (resultKey === 'wins') {
                playSound(winSound.current);
                setMessageClass('message-win');
            } else if (resultKey === 'losses') {
                playSound(loseSound.current);
                setMessageClass('message-lose');
            } else { // ties
                playSound(tieSound.current);
                setMessageClass('message-tie');
            }
            setStats(prev => ({ ...prev, [resultKey]: prev[resultKey] + 1 }));

            console.log("Chamado endGame para:", resultMessage);
            setGameStarted(false); // Game has ended
            setIsDealerTurn(false); // Dealer's turn finished

            // Clear message and class after a delay
            setTimeout(() => {
                setMessage('');
                setMessageClass('');
            }, 3000);

            return true; // Set isGameOver to true
        });
    }, [playSound, winSound, loseSound, tieSound]);

    // Deals initial cards with animation
    const dealInitialCards = useCallback(async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        setPlayerCards([getRandomCard()]);
        playSound(dealSound.current);
        await new Promise(resolve => setTimeout(resolve, 700));

        setDealerCards([getRandomCard()]);
        playSound(dealSound.current);
        await new Promise(resolve => setTimeout(resolve, 700));

        setPlayerCards(prev => {
            const newCards = [...prev, getRandomCard()];
            playSound(dealSound.current);
            return newCards;
        });
        await new Promise(resolve => setTimeout(resolve, 700));

        setDealerCards(prev => {
            const newCards = [...prev, getRandomCard()];
            playSound(dealSound.current);
            return newCards;
        });
        setHiddenDealerCardIndex(1);
        await new Promise(resolve => setTimeout(resolve, 700));

    }, [playSound, dealSound]);

    // Starts a new game
    const startGame = useCallback(async () => {
        resetGame(); // Garante que tudo é limpo antes de começar
        setGameStarted(true);
        // O `useEffect` abaixo tratará da verificação inicial de Blackjack após as cartas serem dadas.
        await dealInitialCards();
    }, [resetGame, dealInitialCards]);

    // Player requests another card
    const hit = useCallback(async () => {
        if (isGameOver || !gameStarted || isDealerTurn) return; // Não permitir ação se o jogo já terminou

        const newCard = getRandomCard();
        setPlayerCards(prev => [...prev, newCard]); // Apenas adiciona a carta. A verificação de bust será feita no useEffect.
        playSound(dealSound.current);
        await new Promise(resolve => setTimeout(resolve, 700));
    }, [isGameOver, gameStarted, isDealerTurn, playSound, dealSound]);

    // Lógica para o turno do dealer
    const autoPlayDealer = useCallback(async () => {
        setHiddenDealerCardIndex(null); // Revela a carta escondida do dealer
        await new Promise(resolve => setTimeout(resolve, 600));

        let currentDealerCards = [...dealerCards];
        let dealerTotal = sumCards(currentDealerCards);

        while (dealerTotal < 17) {
            const newCard = getRandomCard();
            currentDealerCards = [...currentDealerCards, newCard];
            setDealerCards(currentDealerCards);
            playSound(dealSound.current);
            dealerTotal = sumCards(currentDealerCards);
            await new Promise(resolve => setTimeout(resolve, 700));
        }

        // Não chamamos endGame diretamente aqui.
        // A lógica de determinação do vencedor será no useEffect abaixo que observa o estado do jogo.
        // É crucial que setDealerCards seja o último estado a ser atualizado aqui para o useEffect reagir.
    }, [dealerCards, playSound, dealSound]);

    // Player decides to stand
    const stand = useCallback(() => {
        if (isGameOver || !gameStarted || isDealerTurn) return; // Não permitir ação se o jogo já terminou
        setIsDealerTurn(true); // Inicia o turno do dealer
    }, [isGameOver, gameStarted, isDealerTurn]);

    // --- EFEITOS (USEEFFECTS) PARA GERIR A LÓGICA DO JOGO ---

    // EFFECT 1: Lógica do Turno do Dealer
    useEffect(() => {
        if (isDealerTurn && !isGameOver) {
            autoPlayDealer();
        }
    }, [isDealerTurn, isGameOver, autoPlayDealer]);

    // EFFECT 2: Determina o Vencedor no final de uma ronda
    // Este é o EFFECT PRINCIPAL que consolida as condições de fim de jogo.
    useEffect(() => {
        // console.log("Entrou no useEffect"); // Para depuração
        // Só corre se o jogo começou E não terminou ainda.
        if (!gameStarted || isGameOver) {
            // Limpar qualquer timeout pendente se as condições de saída forem satisfeitas
            if (blackjackTimeoutRef.current) {
                clearTimeout(blackjackTimeoutRef.current);
                blackjackTimeoutRef.current = null;
            }
            // console.log("Saiu do useEffect (condição de guarda)");
            return;
        }

        const playerTotal = sumCards(playerCards);
        const dealerTotal = sumCards(dealerCards);

        // Cenário 1: Blackjack Natural (no início do jogo, após cartas dadas)
        if (playerCards.length === 2 && dealerCards.length === 2) {
            // Se já existe um timeout agendado, não agende outro.
            if (blackjackTimeoutRef.current) {
                // console.log("Timeout de Blackjack já agendado. Ignorando nova agenda.");
                return; // Já está agendado, não faça nada.
            }

            blackjackTimeoutRef.current = setTimeout(() => {
                // Este log vai ajudar a ver se o timeout está a disparar.
                // console.log("Callback do setTimeout de Blackjack disparou.");
                // Resetar o ref imediatamente para que não seja reutilizado
                blackjackTimeoutRef.current = null;

                if (isGameOver) {
                    console.log("Game was already over when Blackjack timeout fired. Ignoring.");
                    return;
                }

                if (playerTotal === 21 && dealerTotal !== 21) {
                    setHiddenDealerCardIndex(null);
                    endGame('Blackjack! Ganhaste!', 'wins');
                } else if (playerTotal === 21 && dealerTotal === 21) {
                    setHiddenDealerCardIndex(null);
                    endGame('Empate com Blackjack!', 'ties');
                } else if (dealerTotal === 21) {
                    setHiddenDealerCardIndex(null);
                    endGame('Dealer tem Blackjack! Perdeste!', 'losses');
                }
            }, 3000);

            // O retorno do useEffect para limpeza:
            return () => {
                if (blackjackTimeoutRef.current) {
                    console.log("Limpando timeout de Blackjack na fase de cleanup.");
                    clearTimeout(blackjackTimeoutRef.current);
                    blackjackTimeoutRef.current = null; // Resetar o ref após limpar
                }
            };
        }

        // Cenário 2: Jogador rebenta (Bust)
        if (playerTotal > 21) {
            endGame('Perdeste! Ficaste acima de 21.', 'losses');
            // Limpa o timeout de Blackjack natural se o jogador rebentar antes dele disparar
            if (blackjackTimeoutRef.current) {
                clearTimeout(blackjackTimeoutRef.current);
                blackjackTimeoutRef.current = null;
            }
            // console.log("Saiu do useEffect (jogador rebentou)");
            return;
        }

        // Cenário 3: Fim do Turno do Dealer (dealerTurn está ativo e cartas do dealer pararam de mudar)
        if (isDealerTurn && !isGameOver && dealerCards.length > 0 && dealerTotal >= 17) {
            // Certifica-se de que o timeout de Blackjack natural não está pendente
            if (blackjackTimeoutRef.current) {
                clearTimeout(blackjackTimeoutRef.current);
                blackjackTimeoutRef.current = null;
            }

            const timeoutId = setTimeout(() => {
                // console.log("Callback do setTimeout do dealer disparou.");
                if (isGameOver) {
                    // console.log("Game was already over when dealer timeout fired. Ignoring.");
                    return;
                }

                if (dealerTotal > 21) {
                    endGame('Dealer rebentou! Ganhaste!', 'wins');
                } else if (playerTotal > dealerTotal) {
                    endGame('Ganhaste!', 'wins');
                } else if (playerTotal < dealerTotal) {
                    endGame('Perdeste!', 'losses');
                } else { // playerTotal === dealerTotal
                    endGame('Empate!', 'ties');
                }
            }, 1000);

            // console.log("Saiu do useEffect (fim do turno do dealer)");
            return () => clearTimeout(timeoutId);
        }

        // console.log("Saiu do useEffect (sem condição de fim de jogo)");
    }, [playerCards, dealerCards, gameStarted, isGameOver, isDealerTurn, endGame]);


    // Dados para os gráficos e tabela de estatísticas
    const totalGames = stats.wins + stats.losses + stats.ties;

    const getPercentage = (count: number) => {
        if (totalGames === 0) return '0%';
        return `${((count / totalGames) * 100).toFixed(1)}%`;
    };

    // Data for Bar Chart
    const dataBar = {
        labels: ['Vitórias', 'Derrotas', 'Empates'],
        datasets: [
            {
                label: 'Resultados',
                data: [stats.wins, stats.losses, stats.ties],
                backgroundColor: ['#00FFD1', '#E94560', '#A8DADC'],
                borderColor: '#1A1A2E',
                borderWidth: 2,
            },
        ],
    };

    // Data for Pie Chart
    const dataPie = {
        labels: ['Vitórias', 'Derrotas', 'Empates'],
        datasets: [
            {
                data: [stats.wins, stats.losses, stats.ties],
                backgroundColor: ['#00FFD1', '#E94560', '#A8DADC'],
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
                <h1>Jogo de Blackjack</h1>
                <p className="subtitle">Tenta vencer o dealer sem passar dos 21 pontos!</p>
            </div>

            <div className="game-area-container">
                <div className="game-container">
                    {gameStarted && (
                        <>
                            <div className="game-display">
                                <h3>As tuas cartas ({sumCards(playerCards)}):</h3>
                                <div className="player-hand">
                                    {playerCards.map((card, index) => (
                                        <Card key={index} value={card} />
                                    ))}
                                </div>
                            </div>
                            <div className="game-display">
                                <h3>Cartas do Dealer ({isGameOver || isDealerTurn ? sumCards(dealerCards) : '?'}):</h3>
                                <div className="dealer-hand">
                                    {dealerCards.map((card, index) => (
                                        <Card key={index} value={card} hidden={index === hiddenDealerCardIndex} />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                    {message && <p className={`last-result ${messageClass}`}>{message}</p>}
                </div>

                <div className="action-buttons">
                    {!gameStarted || isGameOver ? (
                        <button className="action-button" onClick={startGame}>
                            Novo Jogo
                        </button>
                    ) : (
                        <>
                            <button className="action-button" onClick={hit} disabled={isGameOver || isDealerTurn}>
                                Pedir Carta
                            </button>
                            <button className="action-button" onClick={stand} disabled={isGameOver || isDealerTurn}>
                                Parar
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="content-container">
                <div className="chart-card">
                    <h2>Gráfico de Barras</h2>
                    <Bar data={dataBar} />
                    <div className="total-spins">Total de jogos: {totalGames}</div>
                </div>

                <div className="chart-card">
                    <h2>Gráfico Circular</h2>
                    <Pie data={dataPie} />
                </div>

                <div className="table-card">
                    <h2>Estatísticas</h2>
                    <table className="result-table">
                        <thead>
                            <tr>
                                <th>Resultado</th>
                                <th>Contagem</th>
                                <th>Percentagem</th> {/* Nova coluna para percentagem */}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Vitórias</td>
                                <td>{stats.wins}</td>
                                <td>{getPercentage(stats.wins)}</td> {/* Exibir percentagem */}
                            </tr>
                            <tr>
                                <td>Derrotas</td>
                                <td>{stats.losses}</td>
                                <td>{getPercentage(stats.losses)}</td> {/* Exibir percentagem */}
                            </tr>
                            <tr>
                                <td>Empates</td>
                                <td>{stats.ties}</td>
                                <td>{getPercentage(stats.ties)}</td> {/* Exibir percentagem */}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Blackjack;