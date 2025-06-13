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
    const dealSound = useRef(new Audio('/sounds/card_deal.wav'));
    const winSound = useRef(new Audio('/sounds/win.wav'));
    const loseSound = useRef(new Audio('/sounds/lose.wav'));
    const tieSound = useRef(new Audio('/sounds/tie.wav'));
    const playSound = useCallback((audioElement: HTMLAudioElement) => {
        audioElement.currentTime = 0;
        audioElement.play().catch(e => console.error("Erro ao tocar som:", e));
    }, []);
    const getRandomCard = (): CardValue => {
        const value = Math.floor(Math.random() * 13) + 1;
        if (value === 1) return 'A';
        if (value === 11) return 'J';
        if (value === 12) return 'Q';
        if (value === 13) return 'K';
        return value;
    };
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
    const resetGame = useCallback(() => {
        setPlayerCards([]);
        setDealerCards([]);
        setIsGameOver(false);
        setMessage('');
        setGameStarted(false);
        setIsDealerTurn(false);
        setHiddenDealerCardIndex(null);
        setMessageClass('');
    }, []);
    const endGame = useCallback((resultMessage: string, resultKey: 'wins' | 'losses' | 'ties') => {
        setIsGameOver(true);
        setMessage(resultMessage);
        if (resultKey === 'wins') {
            playSound(winSound.current);
            setMessageClass('message-win');
        } else if (resultKey === 'losses') {
            playSound(loseSound.current);
            setMessageClass('message-lose');
        } else {
            playSound(tieSound.current);
            setMessageClass('message-tie');
        }
        setStats(prev => ({ ...prev, [resultKey]: prev[resultKey] + 1 }));
        setGameStarted(false);
        setIsDealerTurn(false);
        setTimeout(() => {
            setMessage('');
            setMessageClass('');
        }, 3000);
    }, [playSound, winSound, loseSound, tieSound]);
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
    const startGame = useCallback(async () => {
        resetGame();
        setGameStarted(true);
        await dealInitialCards();
        setTimeout(() => {
            const finalPlayerTotal = sumCards(playerCards);
            const finalDealerTotal = sumCards(dealerCards);
            if (finalPlayerTotal === 21 && finalDealerTotal !== 21) {
                setHiddenDealerCardIndex(null);
                endGame('Blackjack! Ganhaste!', 'wins');
            } else if (finalPlayerTotal === 21 && finalDealerTotal === 21) {
                setHiddenDealerCardIndex(null);
                endGame('Empate com Blackjack!', 'ties');
            } else if (finalDealerTotal === 21) {
                setHiddenDealerCardIndex(null);
                endGame('Dealer tem Blackjack! Perdeste!', 'losses');
            }
        }, 3000);
    }, [dealInitialCards, playerCards, dealerCards, resetGame, endGame]);
    const hit = useCallback(async () => {
        if (isGameOver || !gameStarted || isDealerTurn) return;
        const newCard = getRandomCard();
        setPlayerCards(prev => {
            const updatedCards = [...prev, newCard];
            const currentTotal = sumCards(updatedCards);
            if (currentTotal > 21) {
                endGame('Perdeste! Ficaste acima de 21.', 'losses');
            }
            return updatedCards;
        });
        playSound(dealSound.current);
        await new Promise(resolve => setTimeout(resolve, 700));
    }, [isGameOver, gameStarted, isDealerTurn, playSound, dealSound, endGame]);
    const autoPlayDealer = useCallback(async () => {
        setHiddenDealerCardIndex(null);
        await new Promise(resolve => setTimeout(resolve, 600));
        const currentDealerCards = [...dealerCards];
        let dealerTotal = sumCards(currentDealerCards);
        while (dealerTotal < 17) {
            const newCard = getRandomCard();
            currentDealerCards.push(newCard);
            setDealerCards([...currentDealerCards]);
            playSound(dealSound.current);
            dealerTotal = sumCards(currentDealerCards);
            await new Promise(resolve => setTimeout(resolve, 700));
        }
        const playerTotal = sumCards(playerCards);
        const finalDealerTotal = sumCards(currentDealerCards);
        if (finalDealerTotal > 21) {
            endGame('Dealer rebentou! Ganhaste!', 'wins');
        } else if (playerTotal > finalDealerTotal) {
            endGame('Ganhaste!', 'wins');
        } else if (playerTotal < finalDealerTotal) {
            endGame('Perdeste!', 'losses');
        } else {
            endGame('Empate!', 'ties');
        }
    }, [dealerCards, playerCards, playSound, dealSound, endGame]);
    const stand = useCallback(() => {
        if (isGameOver || !gameStarted || isDealerTurn) return;
        setIsDealerTurn(true);
    }, [isGameOver, gameStarted, isDealerTurn]);
    useEffect(() => {
        if (isDealerTurn && !isGameOver) {
            autoPlayDealer();
        }
    }, [isDealerTurn, isGameOver, autoPlayDealer]);
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
                    { }
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
            </div> { }
            <div className="content-container">
                <div className="chart-card">
                    <h2>Gráfico de Barras</h2>
                    <Bar data={dataBar} />
                    <div className="total-spins">Total de jogos: {stats.wins + stats.losses + stats.ties}</div>
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
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Vitórias</td><td>{stats.wins}</td></tr>
                            <tr><td>Derrotas</td><td>{stats.losses}</td></tr>
                            <tr><td>Empates</td><td>{stats.ties}</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default Blackjack;