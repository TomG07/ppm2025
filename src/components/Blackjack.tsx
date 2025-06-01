import React, { useEffect, useState } from 'react';
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
import '../Common.css';
import './Blackjack.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const Blackjack: React.FC = () => {
    const [playerCards, setPlayerCards] = useState<number[]>([]);
    const [dealerCards, setDealerCards] = useState<number[]>([]);
    const [isGameOver, setIsGameOver] = useState(false);
    const [message, setMessage] = useState('');
    const [stats, setStats] = useState({ wins: 0, losses: 0, ties: 0 });
    const [gameStarted, setGameStarted] = useState(false);
    const [isDealerTurn, setIsDealerTurn] = useState(false);

    const getRandomCard = () => Math.floor(Math.random() * 10) + 2;

    const sumCards = (cards: number[]) => {
        return cards.reduce((sum, card) => sum + card, 0);
    };

    const startGame = () => {
        const newPlayerCards = [getRandomCard(), getRandomCard()];
        const newDealerCards = [getRandomCard(), getRandomCard()];
        setPlayerCards(newPlayerCards);
        setDealerCards(newDealerCards);
        setIsGameOver(false);
        setMessage('');
        setGameStarted(true);
        setIsDealerTurn(false);
    };

    const hit = () => {
        if (isGameOver || !gameStarted) return;
        const newCards = [...playerCards, getRandomCard()];
        setPlayerCards(newCards);
        const total = sumCards(newCards);
        if (total > 21) {
            endGame('Perdeste! Ficaste acima de 21.', 'losses');
        }
    };

    const autoPlayDealer = () => {
        let dealerTotal = sumCards(dealerCards);
        const dealerNewCards = [...dealerCards];
        while (dealerTotal < 17) {
            const newCard = getRandomCard();
            dealerNewCards.push(newCard);
            dealerTotal = sumCards(dealerNewCards);
        }
        setDealerCards(dealerNewCards);
        return dealerTotal;
    };

    const stand = () => {
        if (isGameOver || !gameStarted) return;
        setIsDealerTurn(true);
    };

    useEffect(() => {
        if (isDealerTurn) {
            const timer = setTimeout(() => {
                const dealerTotal = autoPlayDealer();
                const playerTotal = sumCards(playerCards);

                if (dealerTotal > 21 || playerTotal > dealerTotal) {
                    endGame('Ganhaste!', 'wins');
                } else if (playerTotal < dealerTotal) {
                    endGame('Perdeste!', 'losses');
                } else {
                    endGame('Empate!', 'ties');
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isDealerTurn, playerCards]);

    const endGame = (resultMessage: string, resultKey: 'wins' | 'losses' | 'ties') => {
        setIsGameOver(true);
        setMessage(resultMessage);
        setStats(prev => ({ ...prev, [resultKey]: prev[resultKey] + 1 }));
        setIsDealerTurn(false);
    };

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

            <div className="game-container">
                {gameStarted && (
                    <>
                        <div className="game-display">
                            <p>As tuas cartas: {playerCards.join(', ')} ({sumCards(playerCards)})</p>
                        </div>
                        <div className="game-display">
                            <p>Cartas do Dealer: {isGameOver ? `${dealerCards.join(', ')} (${sumCards(dealerCards)})` : `${dealerCards[0]}, (?)`}</p>
                        </div>
                    </>
                )}
                {message && <p className="last-result">{message}</p>}
            </div>

            <div className="action-buttons">
                <button className="action-button" onClick={hit} disabled={!gameStarted || isGameOver}>
                    Pedir Carta
                </button>
                <button className="action-button" onClick={stand} disabled={!gameStarted || isGameOver}>
                    Parar
                </button>
                <button className="reset-button" onClick={startGame}>
                    Novo Jogo
                </button>
            </div>

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