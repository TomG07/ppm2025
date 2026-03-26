import React from 'react';
import './Card.css';
import cardBackImage from '/images/card_back.png';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faDiamond, faCube, faSpa } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

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

    const getRandomSuitAndColor = (): { suitIcon: IconDefinition; color: string } => {
        const suits = [faHeart, faDiamond, faCube, faSpa];
        const randomSuit = suits[Math.floor(Math.random() * suits.length)];

        let color = '#1A1A2E';
        if (randomSuit === faHeart || randomSuit === faDiamond) {
            color = '#E94560';
        }
        return { suitIcon: randomSuit, color };
    };

    const { suitIcon, color } = getRandomSuitAndColor();

    return (
        <div className={`card-container ${hidden ? 'hidden-card' : ''}`}>
            <div className="card-inner">
                <div className="card-face card-back">
                    <img src={cardBackImage} alt="Card Back" />
                </div>
                <div className="card-face card-front" style={{ color: color }}>
                    <div className="card-top-left">
                        <span className="card-value">{displayValue}</span>
                        <FontAwesomeIcon icon={suitIcon} className="card-suit-icon small-icon" />
                    </div>

                    <div className="card-center">
                        <FontAwesomeIcon icon={suitIcon} className="card-suit-icon large-icon" />
                    </div>

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
