import React from 'react';
import './Card.css';
import cardBackImage from '/images/card_back.png'; // <--- VERIFICA ESTE CAMINHO

// Importar os ícones do Font Awesome para os naipes
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faDiamond, faCube, faSpa } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'; // Para o tipo do ícone

type CardValue = number | string;

interface CardProps {
    value: CardValue;
    hidden?: boolean;
}

const Card: React.FC<CardProps> = ({ value, hidden = false }) => {
    const getCardDisplayValue = (val: CardValue): string => {
        if (typeof val === 'number') {
            return val.toString();
        }
        return val;
    };

    const displayValue = getCardDisplayValue(value);

    // Lógica para determinar a cor do naipe (vermelho para copas/ouros, preto para paus/espadas)
    // E para atribuir um naipe aleatório para fins de display
    const getRandomSuitAndColor = (): { suitIcon: IconDefinition; color: string } => {
        const suits = [faHeart, faDiamond, faCube, faSpa];
        const randomSuit = suits[Math.floor(Math.random() * suits.length)];

        let color = '#1A1A2E'; // Preto padrão para paus e espadas (cor do tema)
        if (randomSuit === faHeart || randomSuit === faDiamond) {
            color = '#E94560'; // Vermelho para copas e ouros (cor do tema)
        }
        return { suitIcon: randomSuit, color };
    };

    const { suitIcon, color } = getRandomSuitAndColor(); // Gera um naipe e cor para cada carta

    return (
        <div className={`card-container ${hidden ? 'hidden-card' : ''}`}>
            <div className="card-inner">
                <div className="card-face card-back">
                    {/* Imagem do verso da carta */}
                    <img src={cardBackImage} alt="Card Back" />
                </div>
                <div className="card-face card-front" style={{ color: color }}>
                    {/* Topo Esquerdo */}
                    <div className="card-top-left">
                        <span className="card-value">{displayValue}</span>
                        <FontAwesomeIcon icon={suitIcon} className="card-suit-icon small-icon" />
                    </div>

                    {/* Centro (Maior) */}
                    <div className="card-center">
                        <FontAwesomeIcon icon={suitIcon} className="card-suit-icon large-icon" />
                    </div>

                    {/* Fundo Direito */}
                    <div className="card-bottom-right">
                        <FontAwesomeIcon icon={suitIcon} className="card-suit-icon small-icon rotated-icon" />
                        <span className="card-value rotated-text">{displayValue}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Card;