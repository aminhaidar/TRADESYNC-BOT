#!/bin/bash

# Define output file
OUTPUT_FILE="tradesync_files.txt"
echo "Gathering TradeSync-Bot files and outputs..." > $OUTPUT_FILE
echo "----------------------------------------" >> $OUTPUT_FILE

# Backend files
echo "### Backend/app.py" >> $OUTPUT_FILE
cat backend/app.py >> $OUTPUT_FILE 2>/dev/null || echo "File not found: app.py" >> $OUTPUT_FILE
echo -e "\n----------------------------------------" >> $OUTPUT_FILE

echo "### Backend/trade_executor.py" >> $OUTPUT_FILE
cat backend/trade_executor.py >> $OUTPUT_FILE 2>/dev/null || echo "File not found: trade_executor.py" >> $OUTPUT_FILE
echo -e "\n----------------------------------------" >> $OUTPUT_FILE

echo "### Backend/alpaca_service.py" >> $OUTPUT_FILE
cat backend/alpaca_service.py >> $OUTPUT_FILE 2>/dev/null || echo "File not found: alpaca_service.py" >> $OUTPUT_FILE
echo -e "\n----------------------------------------" >> $OUTPUT_FILE

echo "### Backend/database.py" >> $OUTPUT_FILE
cat backend/database.py >> $OUTPUT_FILE 2>/dev/null || echo "File not found: database.py" >> $OUTPUT_FILE
echo -e "\n----------------------------------------" >> $OUTPUT_FILE

echo "### Backend/trade_routes.py" >> $OUTPUT_FILE
cat backend/trade_routes.py >> $OUTPUT_FILE 2>/dev/null || echo "File not found: trade_routes.py" >> $OUTPUT_FILE
echo -e "\n----------------------------------------" >> $OUTPUT_FILE

# Frontend files
echo "### Frontend/src/components/Insights.js" >> $OUTPUT_FILE
cat frontend/src/components/Insights.js >> $OUTPUT_FILE 2>/dev/null || echo "File not found: Insights.js" >> $OUTPUT_FILE
echo -e "\n----------------------------------------" >> $OUTPUT_FILE

echo "### Frontend/src/context/SocketContext.js" >> $OUTPUT_FILE
cat frontend/src/context/SocketContext.js >> $OUTPUT_FILE 2>/dev/null || echo "File not found: SocketContext.js" >> $OUTPUT_FILE
echo -e "\n----------------------------------------" >> $OUTPUT_FILE

echo "### Frontend/src/hooks/useTradeData.js" >> $OUTPUT_FILE
cat frontend/src/hooks/useTradeData.js >> $OUTPUT_FILE 2>/dev/null || echo "File not found: useTradeData.js" >> $OUTPUT_FILE
echo -e "\n----------------------------------------" >> $OUTPUT_FILE

echo "### Frontend/src/components/Chart.js" >> $OUTPUT_FILE
cat frontend/src/components/Chart.js >> $OUTPUT_FILE 2>/dev/null || echo "File not found: Chart.js" >> $OUTPUT_FILE
echo -e "\n----------------------------------------" >> $OUTPUT_FILE

echo "### Frontend/src/App.js" >> $OUTPUT_FILE
cat frontend/src/App.js >> $OUTPUT_FILE 2>/dev/null || echo "File not found: App.js" >> $OUTPUT_FILE
echo -e "\n----------------------------------------" >> $OUTPUT_FILE

# Database query
echo "### trades.db Query: SELECT * FROM trades;" >> $OUTPUT_FILE
sqlite3 backend/trades.db "SELECT * FROM trades;" >> $OUTPUT_FILE 2>/dev/null || echo "Error querying trades.db" >> $OUTPUT_FILE
echo -e "\n----------------------------------------" >> $OUTPUT_FILE

echo "Done gathering files."
