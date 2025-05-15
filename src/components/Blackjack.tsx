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

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    }, [autoPlayDealer, isDealerTurn, playerCards]);

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
                backgroundColor: ['#00ffd1', '#e94560', '#3a86ff']
            }
        ]
    };

    const dataPie = {
        labels: ['Vitórias', 'Derrotas', 'Empates'],
        datasets: [
            {
                data: [stats.wins, stats.losses, stats.ties],
                backgroundColor: ['#00ffd1', '#e94560', '#3a86ff']
            }
        ]
    };

    return (
        <div className="blackjack-container">
            <p className="blackjack-subtitle">Tenta vencer o dealer sem passar dos 21 pontos</p>

            {gameStarted && (
                <>
                    <div className="blackjack-display">
                        <p>As tuas cartas: {playerCards.join(', ')} ({sumCards(playerCards)})</p>
                    </div>

                    <div className="blackjack-display">
                        <p>Cartas do Dealer: {isGameOver ? `${dealerCards.join(', ')} (${sumCards(dealerCards)})` : `${dealerCards[0]}, (?)`}</p>
                    </div>
                </>
            )}

            {message && <p className="blackjack-subtitle">{message}</p>}

            <div className="blackjack-buttons">
                <button className="blackjack-button" onClick={hit} disabled={!gameStarted || isGameOver}>Pedir Carta</button>
                <button className="blackjack-button" onClick={stand} disabled={!gameStarted || isGameOver}>Parar</button>
                <button className="blackjack-reset-button" onClick={startGame}>Novo Jogo</button>
            </div>

            <div className="blackjack-info-section">
                <div className="blackjack-card">
                    <h2 className="blackjack-title">Estatísticas</h2>
                    <table className="blackjack-table">
                        <thead>
                            <tr>
                                <th>Total Jogos</th>
                                <th>Vitórias</th>
                                <th>Derrotas</th>
                                <th>Empates</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{stats.wins + stats.losses + stats.ties}</td>
                                <td>{stats.wins}</td>
                                <td>{stats.losses}</td>
                                <td>{stats.ties}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="blackjack-chart">
                    <h2 className="blackjack-title">Gráfico de Barras</h2>
                    <Bar data={dataBar} />
                </div>

                <div className="blackjack-chart">
                    <h2 className="blackjack-title">Gráfico de Pizza</h2>
                    <Pie data={dataPie} />
                </div>
            </div>
        </div>
    );
};

export default Blackjack;
