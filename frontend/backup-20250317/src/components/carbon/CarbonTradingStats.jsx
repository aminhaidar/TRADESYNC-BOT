import React, { useEffect, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import './CarbonTradingStats.scss';

const CarbonTradingStats = () => {
  const { socket } = useSocket();
  const [tradingStats, setTradingStats] = useState({
    winRate: '78% (21/27)',
    avgGain: '+14.2%',
    avgLoss: '-8.6%'
  });
  const [topPerformers, setTopPerformers] = useState([
    { id: 'ripster', name: 'SN', handle: '@ripster47', winRate: '80%', color: 'green' },
    { id: 'ironhawk', name: 'IH', handle: '@IronHawk', winRate: '75%', color: 'blue' }
  ]);

  useEffect(() => {
    if (!socket) return;

    socket.on('tradingStats', (data) => {
      setTradingStats(data);
    });

    socket.on('topPerformers', (data) => {
      setTopPerformers(data);
    });

    // Request data
    socket.emit('getTradingStats');
    socket.emit('getTopPerformers');

    return () => {
      socket.off('tradingStats');
      socket.off('topPerformers');
    };
  }, [socket]);

  return (
    <>
      <div className="card trading-stats-card">
        <div className="card-header">
          <h2 className="card-title">Trading Stats</h2>
        </div>

        <div className="stats-list">
          <div className="stat-item bg-element">
            <div className="stat-label">Win Rate</div>
            <div className="stat-value">{tradingStats.winRate}</div>
          </div>
          
          <div className="stat-item bg-element">
            <div className="stat-label">Average Gain</div>
            <div className="stat-value positive">{tradingStats.avgGain}</div>
          </div>
          
          <div className="stat-item bg-element">
            <div className="stat-label">Average Loss</div>
            <div className="stat-value negative">{tradingStats.avgLoss}</div>
          </div>
        </div>
      </div>
      
      <div className="card top-performers-card">
        <div className="card-header">
          <h2 className="card-title">Top Performers</h2>
        </div>
        
        <div className="performers-list">
          {topPerformers.map(performer => (
            <div key={performer.id} className="performer-item">
              <div className={`performer-avatar ${performer.color}`}>
                <span>{performer.name}</span>
              </div>
              <div className="performer-info">
                <span className="handle">{performer.handle}</span>
                <span className="win-rate">{performer.winRate} win rate</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CarbonTradingStats;
