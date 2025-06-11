import { motion } from 'framer-motion';
import './Entrada.css';

const Entrada = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="page-container"
        >
            {/* Cabeçalho */}
            <motion.header
                className="main-header"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
            >
                <h1>Prémio Pedro de Matos 2025</h1>
                <p className="subtitle">Projeto de Probabilidades Matemáticas</p>
            </motion.header>

            {/* Conteúdo Principal */}
            <div className="content-grid">
                <div className="left-column">
                    {/* Card do Projeto */}
                    <motion.div
                        className="content-card"
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 100 }}
                    >
                        <h2><span className="icon">📐</span> Sobre o Projeto</h2>
                        <p>
                            Desenvolvemos uma série de jogos interativos para ensino de probabilidades,
                            combinando teoria matemática com aplicações práticas. Este projeto tem como objetivo tornar
                            conceitos complexos mais acessíveis através da prática.
                        </p>
                    </motion.div>

                    {/* Card do Prêmio */}
                    <motion.div
                        className="content-card"
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
                    >
                        <h2><span className="icon">🏆</span> O Prémio</h2>
                        <p>
                            Criado em 2008 para incentivar inovações na educação matemática, o Prémio Pedro de Matos
                            homenageia os projetos inovadores e melhor conseguidos no país de acordo com o tema anual. O tema de 2025 é
                            "Matemática (In)Discreta".
                        </p>
                    </motion.div>
                </div>

                {/* Card da Equipe */}
                <motion.div
                    className="content-card"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 100, delay: 0.1 }}
                >
                    <h2><span className="icon">👥</span> O Grupo</h2>
                    <p>
                        Formado por 3 estudantes do 11º Ano, todos apaixonados por matemática e tecnologia.
                        Juntos, em conjunto com a nossa professora, temos orgulho de ter conquistado o 2º lugar na edição anterior deste prémio.
                    </p>
                    <div className="team-photo">
                        <img src="/images/grupo.jpeg" alt="Grupo do Projeto" />
                    </div>
                </motion.div>
            </div>

            {/* Navegação para Jogos */}
            <motion.nav
                className="games-nav"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <motion.a
                    href="/dado"
                    className="game-link"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Jogo 1: Lançamento de Dados
                </motion.a>
                <motion.a
                    href="/roleta"
                    className="game-link"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Jogo 2: Roleta
                </motion.a>
                <motion.a
                    href="/blackjack"
                    className="game-link"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Jogo 3: BlackJack
                </motion.a>
            </motion.nav>
        </motion.div>
    );
};

export default Entrada;