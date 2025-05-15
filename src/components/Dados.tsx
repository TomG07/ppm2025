// import React, { useState, useMemo, useEffect } from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
// import { useReactTable, getCoreRowModel, ColumnDef } from '@tanstack/react-table';
// import { useNavigate, useLocation } from 'react-router-dom';
// import './Dados.css';

// interface Result {
//     name: string;
//     count: number;
// }

// interface TableData {
//     face: string;
//     count: number;
//     percentage: string;
// }

// const Dados: React.FC = () => {
//     const [diceResults, setDiceResults] = useState<Result[]>([
//         { name: '1', count: 0 },
//         { name: '2', count: 0 },
//         { name: '3', count: 0 },
//         { name: '4', count: 0 },
//         { name: '5', count: 0 },
//         { name: '6', count: 0 },
//     ]);
//     const [totalRolls, setTotalRolls] = useState(0);
//     const [chartWidth, setChartWidth] = useState(400);

//     const navigate = useNavigate();
//     const location = useLocation();

//     useEffect(() => {
//         const updateChartWidth = () => {
//             const containerWidth = window.innerWidth > 450 ? 400 : window.innerWidth - 60;
//             setChartWidth(containerWidth);
//         };

//         updateChartWidth();
//         window.addEventListener('resize', updateChartWidth);
//         return () => window.removeEventListener('resize', updateChartWidth);
//     }, []);

//     const rollDice = () => {
//         const result = Math.floor(Math.random() * 6) + 1;
//         setDiceResults(prev =>
//             prev.map(item =>
//                 item.name === result.toString() ? { ...item, count: item.count + 1 } : item
//             )
//         );
//         setTotalRolls(prev => prev + 1);
//     };

//     const resetResults = () => {
//         setDiceResults(diceResults.map(item => ({ ...item, count: 0 })));
//         setTotalRolls(0);
//     };

//     const handleGoBack = () => {
//         const previousScrollPosition = location.state?.scrollPosition || 0;
//         navigate(-1);
//         setTimeout(() => {
//             window.scrollTo(0, previousScrollPosition);
//         }, 0);
//     };

//     useEffect(() => {
//         const handleScroll = () => {
//             const scrollPosition = window.scrollY;
//             window.history.replaceState(
//                 { ...location.state, scrollPosition },
//                 ''
//             );
//         };

//         window.addEventListener('scroll', handleScroll);
//         return () => window.removeEventListener('scroll', handleScroll);
//     }, [location.state]);

//     const tableData = useMemo(
//         () =>
//             diceResults.map(result => ({
//                 face: result.name,
//                 count: result.count,
//                 percentage: totalRolls > 0 ? ((result.count / totalRolls) * 100).toFixed(1) : '0',
//             })),
//         [diceResults, totalRolls]
//     );

//     const columns = useMemo<ColumnDef<TableData>[]>(
//         () => [
//             {
//                 header: 'Face',
//                 accessorKey: 'face',
//             },
//             {
//                 header: 'Ocorrências',
//                 accessorKey: 'count',
//             },
//             {
//                 header: 'Percentagem',
//                 accessorKey: 'percentage',
//                 cell: info => `${info.getValue()}%`,
//             },
//         ],
//         []
//     );

//     const table = useReactTable({
//         data: tableData,
//         columns,
//         getCoreRowModel: getCoreRowModel(),
//     });

//     return (
//         <div className="page-container">
//             <nav className="navigation-bar">
//                 <button onClick={handleGoBack} className="nav-button">
//                     Voltar
//                 </button>
//             </nav>

//             <header className="main-header">
//                 <h1>Jogo de Dados</h1>
//                 <p className="subtitle">Lance o dado e veja os resultados!</p>
//             </header>

//             <div className="action-buttons">
//                 <button onClick={rollDice} className="action-button">
//                     Lançar Dado
//                 </button>
//                 <button onClick={resetResults} className="action-button">
//                     Resetar
//                 </button>
//             </div>

//             <div className="content-container">
//                 <div className="chart-card">
//                     <h2>Resultados do Dado</h2>
//                     <BarChart
//                         width={chartWidth}
//                         height={300}
//                         data={diceResults}
//                         margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
//                     >
//                         <CartesianGrid strokeDasharray="3 3" stroke="#A8DADC" />
//                         <XAxis dataKey="name" stroke="#E5E5E5" />
//                         <YAxis stroke="#E5E5E5" />
//                         <Tooltip />
//                         <Legend formatter={() => 'Face'} />
//                         <Bar dataKey="count" fill="#00FFD1" />
//                     </BarChart>
//                 </div>

//                 <div className="table-card">
//                     <h2>Percentagens por Face</h2>
//                     <table className="result-table">
//                         <thead>
//                             {table.getHeaderGroups().map(headerGroup => (
//                                 <tr key={headerGroup.id}>
//                                     {headerGroup.headers.map(header => (
//                                         <th key={header.id}>
//                                             {header.isPlaceholder
//                                                 ? null
//                                                 : typeof header.column.columnDef.header === 'function'
//                                                 ? header.column.columnDef.header(header.getContext())
//                                                 : header.column.columnDef.header}
//                                         </th>
//                                     ))}
//                                 </tr>
//                             ))}
//                         </thead>
//                         <tbody>
//                             {table.getRowModel().rows.map(row => (
//                                 <tr key={row.id}>
//                                     {row.getVisibleCells().map(cell => (
//                                         <td key={cell.id}>
//                                             {cell.getValue() as string}
//                                         </td>
//                                     ))}
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                     <p className="total-rolls">Total de lançamentos: {totalRolls}</p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Dados;

import { useState } from "react";
import "./Dados.css";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Dados() {
    const [resultados, setResultados] = useState<number[]>([]);
    const [lancando, setLancando] = useState(false);
    const [numeroAtual, setNumeroAtual] = useState<number | null>(null);

    const lancarDado = () => {
        setLancando(true);
        setTimeout(() => {
            const resultado = Math.floor(Math.random() * 6) + 1;
            setNumeroAtual(resultado);
            setResultados((prev) => [...prev, resultado]);
            setLancando(false);
        }, 1000); // tempo da animação
    };

    const resetar = () => {
        setResultados([]);
        setNumeroAtual(null);
    };

    const contarOcorrencias = (num: number) => resultados.filter((r) => r === num).length;

    const chartData = {
        labels: ["1", "2", "3", "4", "5", "6"],
        datasets: [
            {
                label: "Ocorrências",
                data: [1, 2, 3, 4, 5, 6].map(contarOcorrencias),
                backgroundColor: "#00FFD1",
                borderColor: "#E94560",
                borderWidth: 1,
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

            <h1 className="main-header">Lançamento de Dado</h1>
            <div className="dado-container">
                <div className={`dado ${lancando ? "lancando" : ""}`}>
                    {numeroAtual && <span className="numero">{numeroAtual}</span>}
                </div>
                <div className="action-buttons">
                    <button className="action-button" onClick={lancarDado} disabled={lancando}>
                        Lançar Dado
                    </button>
                    <button className="action-button resetar" onClick={resetar}>
                        Resetar
                    </button>
                </div>
            </div>
            <div className="content-container">
                <div className="chart-card">
                    <h2>Gráfico</h2>
                    <Bar data={chartData} />
                </div>
                <div className="table-card">
                    <h2>Estatísticas</h2>
                    <table className="result-table">
                        <thead>
                            <tr>
                                <th>Face</th>
                                <th>Ocorrências</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6].map((face) => (
                                <tr key={face}>
                                    <td>{face}</td>
                                    <td>{contarOcorrencias(face)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="total-spins">Total de lançamentos: {resultados.length}</p>
                </div>
            </div>
        </div>
    );
}
