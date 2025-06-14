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
    // [REMOVIDO] const [playerBalance, setPlayerBalance] = useState(1000);
    // [REMOVIDO] const [currentBet, setCurrentBet] = useState(INITIAL_BET);
    const [messageClass, setMessageClass] = useState('');

    // Referências para os elementos de áudio
    // Certifica-te de que estes ficheiros estão em public/sounds/
    const dealSound = useRef(new Audio('/sounds/card_deal.wav'));
    const winSound = useRef(new Audio('/sounds/win.wav'));
    const loseSound = useRef(new Audio('/sounds/lose.wav'));
    const tieSound = useRef(new Audio('/sounds/tie.wav'));

    // Função para tocar som
     const playSound = useCallback((audioElement: HTMLAudioElement) => {
        audioElement.currentTime = 0; // Reset para poder tocar rapidamente
        audioElement.play().catch(e => console.error("Erro ao tocar som:", e));
    }, []);

    // Gera uma carta aleatória (valor, não naipe)
    const getRandomCard = (): CardValue => {
        const value = Math.floor(Math.random() * 13) + 1; // 1 a 13
        if (value === 1) return 'A';
        if (value === 11) return 'J';
        if (value === 12) return 'Q';
        if (value === 13) return 'K';
        return value;
    };

    // Soma os valores das cartas, lidando com Ases
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

    // Função para resetar o estado do jogo (chamada antes de um novo jogo)
    const resetGame = useCallback(() => {
        setPlayerCards([]);
        setDealerCards([]);
        setIsGameOver(false);
        setMessage('');
        setGameStarted(false);
        setIsDealerTurn(false);
        setHiddenDealerCardIndex(null);
        setMessageClass(''); // Limpa a classe de estilo da mensagem
    }, []); // Não depende de props ou estado

    // Função para finalizar o jogo e atualizar saldo/estatísticas
    // Mover para antes de outras funções que a chamam (startGame, hit, autoPlayDealer)
    const endGame = useCallback((resultMessage: string, resultKey: 'wins' | 'losses' | 'ties') => {
        setIsGameOver(true);
        setMessage(resultMessage);

        // [REMOVIDO] let newBalance = playerBalance;
        if (resultKey === 'wins') {
            // [REMOVIDO] newBalance += currentBet * 2;
            playSound(winSound.current); // Passa o elemento de áudio, não o ref
            setMessageClass('message-win');
        } else if (resultKey === 'losses') {
            playSound(loseSound.current); // Passa o elemento de áudio, não o ref
            setMessageClass('message-lose');
        } else { // ties
            // [REMOVIDO] newBalance += currentBet;
            playSound(tieSound.current); // Passa o elemento de áudio, não o ref
            setMessageClass('message-tie');
        }
        // [REMOVIDO] setPlayerBalance(newBalance);
        setStats(prev => ({ ...prev, [resultKey]: prev[resultKey] + 1 }));
        setGameStarted(false); // O jogo terminou
        setIsDealerTurn(false); // Turno do dealer finalizado

        // Limpa a mensagem e a classe de feedback após um tempo
        setTimeout(() => {
            setMessage('');
            setMessageClass('');
        }, 3000); // A mensagem desaparece após 3 segundos
    }, [playSound, winSound, loseSound, tieSound]); // Dependências ajustadas

    // Distribui as cartas iniciais com animação
    const dealInitialCards = useCallback(async () => {
        // Sequência de distribuição de cartas com atrasos e sons
        await new Promise(resolve => setTimeout(resolve, 300)); // Pequeno atraso inicial
        setPlayerCards([getRandomCard()]); // 1ª carta jogador
        playSound(dealSound.current);
        await new Promise(resolve => setTimeout(resolve, 700));

        setDealerCards([getRandomCard()]); // 1ª carta dealer
        playSound(dealSound.current);
        await new Promise(resolve => setTimeout(resolve, 700));

        setPlayerCards(prev => { // 2ª carta jogador
            const newCards = [...prev, getRandomCard()];
            playSound(dealSound.current);
            return newCards;
        });
        await new Promise(resolve => setTimeout(resolve, 700));

        setDealerCards(prev => { // 2ª carta dealer (escondida)
            const newCards = [...prev, getRandomCard()];
            playSound(dealSound.current);
            return newCards;
        });
        setHiddenDealerCardIndex(1); // Esconde a segunda carta do dealer
        await new Promise(resolve => setTimeout(resolve, 700));

    }, [playSound, dealSound]); // dealSound.current é uma referência estável, mas incluir playSound é bom

    // Inicia um novo jogo
    const startGame = useCallback(async () => {
        resetGame(); // Reinicia todos os estados do jogo
        // [REMOVIDO] if (playerBalance < currentBet) {
        // [REMOVIDO]     setMessage('Saldo insuficiente para a aposta. Ajusta a aposta ou adiciona fundos.');
        // [REMOVIDO]     setMessageClass('message-error');
        // [REMOVIDO]     return;
        // [REMOVIDO] }
        // [REMOVIDO] setPlayerBalance(prev => prev - currentBet); // Deduz a aposta do saldo (removido)
        setGameStarted(true);

        // Dispara a distribuição das cartas com animação
        await dealInitialCards();

        // Após a distribuição das cartas e suas animações, verifica Blackjack natural
        // Usa setTimeout para garantir que o estado das cartas é atualizado antes da verificação
        setTimeout(() => {
            // Re-calcular os totais para garantir que os valores mais recentes do estado são usados
            const finalPlayerTotal = sumCards(playerCards);
            const finalDealerTotal = sumCards(dealerCards);

            if (finalPlayerTotal === 21 && finalDealerTotal !== 21) {
                setHiddenDealerCardIndex(null); // Revela a carta do dealer
                endGame('Blackjack! Ganhaste!', 'wins');
            } else if (finalPlayerTotal === 21 && finalDealerTotal === 21) {
                setHiddenDealerCardIndex(null); // Revela a carta do dealer
                endGame('Empate com Blackjack!', 'ties');
            } else if (finalDealerTotal === 21) {
                setHiddenDealerCardIndex(null); // Revela a carta do dealer
                endGame('Dealer tem Blackjack! Perdeste!', 'losses');
            }
        }, 3000); // Dá tempo para todas as 4 cartas serem distribuídas e o estado ser atualizado
    }, [dealInitialCards, playerCards, dealerCards, resetGame, endGame]); // Dependências ajustadas

    // Jogador pede mais uma carta
    const hit = useCallback(async () => {
        if (isGameOver || !gameStarted || isDealerTurn) return; // Não permite hit se o jogo acabou, não começou ou é a vez do dealer

        const newCard = getRandomCard();
        // Usar o callback do setState para garantir que o estado `prev` é o mais recente
        setPlayerCards(prev => {
            const updatedCards = [...prev, newCard];
            // Verifica se rebentou imediatamente após adicionar a carta
            const currentTotal = sumCards(updatedCards);
            if (currentTotal > 21) {
                endGame('Perdeste! Ficaste acima de 21.', 'losses');
            }
            return updatedCards;
        });
        playSound(dealSound.current); // Toca o som de carta
        await new Promise(resolve => setTimeout(resolve, 700)); // Pequeno atraso para a carta aparecer animada
    }, [isGameOver, gameStarted, isDealerTurn, playSound, dealSound, endGame]); // Dependências ajustadas

    // Lógica para o turno do dealer
    const autoPlayDealer = useCallback(async () => {
        setHiddenDealerCardIndex(null); // Revela a carta escondida do dealer
        await new Promise(resolve => setTimeout(resolve, 600)); // Atraso para a animação de virar a carta

        const currentDealerCards = [...dealerCards]; // Copia o estado atual do dealer
        let dealerTotal = sumCards(currentDealerCards);

        // O dealer saca cartas enquanto o total for menor que 17
        while (dealerTotal < 17) {
            const newCard = getRandomCard();
            currentDealerCards.push(newCard);
            setDealerCards([...currentDealerCards]); // Atualiza o estado
            playSound(dealSound.current); // Toca o som de carta
            dealerTotal = sumCards(currentDealerCards); // Recalcula o total do dealer
            await new Promise(resolve => setTimeout(resolve, 700)); // Atraso entre saques
        }

        // Determina o vencedor após o turno do dealer
        const playerTotal = sumCards(playerCards);
        const finalDealerTotal = sumCards(currentDealerCards); // Usa o total final do dealer

        if (finalDealerTotal > 21) {
            endGame('Dealer rebentou! Ganhaste!', 'wins');
        } else if (playerTotal > finalDealerTotal) {
            endGame('Ganhaste!', 'wins');
        } else if (playerTotal < finalDealerTotal) {
            endGame('Perdeste!', 'losses');
        } else {
            endGame('Empate!', 'ties');
        }
    }, [dealerCards, playerCards, playSound, dealSound, endGame]); // Dependências ajustadas

    // Jogador decide parar
    const stand = useCallback(() => {
        if (isGameOver || !gameStarted || isDealerTurn) return; // Não permite stand se o jogo acabou, não começou ou já é a vez do dealer
        setIsDealerTurn(true); // Inicia o turno do dealer
    }, [isGameOver, gameStarted, isDealerTurn]); // Dependências

    // useEffect para disparar o turno do dealer quando isDealerTurn se torna true
    useEffect(() => {
        if (isDealerTurn && !isGameOver) {
            autoPlayDealer();
        }
    }, [isDealerTurn, isGameOver, autoPlayDealer]); // autoPlayDealer como dependência

    // Dados para o Gráfico de Barras
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

    // Dados para o Gráfico Circular
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

            <div className="game-area-container"> {/* Container principal da área de jogo */}
                {/* [REMOVIDO] Informação do Saldo e Aposta */}
                {/* <div className="player-info">
                    <p>Saldo: €{playerBalance}</p>
                    <p>Aposta: €{currentBet}</p>
                </div> */}

                {/* [REMOVIDO] Controles de Aposta */}
                {/* <div className="bet-controls">
                    {!gameStarted && !isGameOver && (
                        <>
                            <button className="bet-button" onClick={() => adjustBet(-5)} disabled={currentBet <= MIN_BET}>-5</button>
                            <button className="bet-button" onClick={() => adjustBet(-1)} disabled={currentBet <= MIN_BET}>-1</button>
                            <button className="bet-button" onClick={() => adjustBet(1)} disabled={currentBet >= MAX_BET}>+1</button>
                            <button className="bet-button" onClick={() => adjustBet(5)} disabled={currentBet >= MAX_BET}>+5</button>
                        </>
                    )}
                </div> */}

                <div className="game-container">
                    {gameStarted && ( // Só mostra as cartas se o jogo tiver começado
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
                    {/* Mensagem de resultado com classes dinâmicas para estilo */}
                    {message && <p className={`last-result ${messageClass}`}>{message}</p>}
                </div>

                <div className="action-buttons">
                    {!gameStarted || isGameOver ? ( // Mostra "Novo Jogo" se o jogo não começou ou terminou
                        // [REMOVIDO] disabled={playerBalance < currentBet}
                        <button className="action-button" onClick={startGame}>
                            Novo Jogo
                        </button>
                    ) : ( // Mostra "Pedir Carta" e "Parar" se o jogo estiver a decorrer
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
            </div> {/* Fim do game-area-container */}

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