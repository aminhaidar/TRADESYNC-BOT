// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Button, 
    Tile, 
    DataTable, 
    TableContainer, 
    Table, 
    TableHead, 
    TableRow, 
    TableHeader, 
    TableBody, 
    TableCell, 
    TableToolbar, 
    TableToolbarContent, 
    TableToolbarSearch, 
    Theme 
} from "@carbon/react";

const App = () => {
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(false);  // Loading state
    const [error, setError] = useState(null);       // Error state

    // Fetch trades from API
    const fetchTrades = async () => {
        setLoading(true);  // Show loading state
        setError(null);    // Clear previous errors
        try {
            const response = await axios.get('/api/trades');
            setTrades(response.data);
        } catch (error) {
            console.error("Error fetching trades:", error);
            setError("Failed to load trades. Please try again.");
        } finally {
            setLoading(false);  // Hide loading state
        }
    };

    // Initial fetch when component mounts
    useEffect(() => {
        fetchTrades();
    }, []);

    return (
        <Theme theme="g100">
            <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
                <h1 style={{ textAlign: 'center' }}>TradeSync Bot Dashboard</h1>
                <Tile style={{ padding: '20px', marginTop: '20px', backgroundColor: '#2a2a2a' }}>
                    <Button 
                        onClick={fetchTrades} 
                        disabled={loading}  // Disable button while loading
                        style={{ marginBottom: '20px' }}
                    >
                        {loading ? "Refreshing..." : "Refresh Trades"}
                    </Button>
                    
                    {error && (
                        <div style={{ color: 'red', marginBottom: '10px' }}>
                            {error}
                        </div>
                    )}
                    
                    <h3>Recent Trades</h3>
                    <DataTable 
                        rows={trades.map((trade, index) => ({
                            id: index.toString(),  // Unique ID for each row
                            ...trade
                        }))} 
                        headers={[
                            { key: 'symbol', header: 'Symbol' },
                            { key: 'action', header: 'Action' },
                            { key: 'quantity', header: 'Quantity' },
                            { key: 'timestamp', header: 'Timestamp' },
                        ]}
                    >
                        {({ rows, headers, getHeaderProps, getRowProps }) => (
                            <TableContainer>
                                <TableToolbar>
                                    <TableToolbarContent>
                                        <TableToolbarSearch persistent={true} />
                                    </TableToolbarContent>
                                </TableToolbar>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            {headers.map(header => {
                                                const headerProps = getHeaderProps({ header });
                                                const { key, ...restHeaderProps } = headerProps; // Extract key
                                                return (
                                                    <TableHeader
                                                        key={header.key}  // Use header.key explicitly
                                                        {...restHeaderProps}  // Spread remaining props
                                                    >
                                                        {header.header}
                                                    </TableHeader>
                                                );
                                            })}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.map(row => {
                                            const rowProps = getRowProps({ row });
                                            const { key, ...restRowProps } = rowProps; // Extract key if present
                                            return (
                                                <TableRow
                                                    key={row.id}  // Use row.id explicitly
                                                    {...restRowProps}  // Spread remaining props
                                                >
                                                    {row.cells.map(cell => (
                                                        <TableCell key={cell.id}>{cell.value}</TableCell>
                                                    ))}
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </DataTable>
                </Tile>
            </div>
        </Theme>
    );
};

export default App;