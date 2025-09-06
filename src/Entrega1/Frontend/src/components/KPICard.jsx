import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiTrendingUp, 
  FiTrendingDown,
  FiDollarSign,
  FiShoppingCart,
  FiTarget,
  FiUsers,
  FiBarChart
} from 'react-icons/fi';

const KPICard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  trend = [], 
  loading = false,
  index = 0 
}) => {
  const getIcon = () => {
    switch(icon) {
      case 'revenue': return <FiDollarSign size={24} />;
      case 'stores': return <FiShoppingCart size={24} />;
      case 'coupons': return <FiTarget size={24} />;
      case 'users': return <FiUsers size={24} />;
      default: return <FiBarChart size={24} />;
    }
  };

  const formatTrendData = () => {
    if (!trend || trend.length === 0) return '';
    
    const maxValue = Math.max(...trend);
    const minValue = Math.min(...trend);
    const range = maxValue - minValue || 1;
    
    return trend.map((value, index) => {
      const x = (index / (trend.length - 1)) * 100;
      const y = ((maxValue - value) / range) * 100;
      return `${x},${y}`;
    }).join(' ');
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1 + 0.3,
        ease: "backOut"
      }
    }
  };

  const valueVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1 + 0.5
      }
    }
  };

  if (loading) {
    return (
      <div className="kpi-card loading">
        <div className="loading-skeleton">
          <div className="skeleton-icon"></div>
          <div className="skeleton-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-value"></div>
            <div className="skeleton-change"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="kpi-card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        y: -8,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="kpi-header">
        <div className="kpi-info">
          <h3 className="kpi-title">{title}</h3>
          <motion.div 
            className="kpi-value"
            variants={valueVariants}
          >
            {value}
          </motion.div>
          <div className={`kpi-change ${changeType}`}>
            {changeType === 'positive' ? <FiTrendingUp size={16} /> : <FiTrendingDown size={16} />}
            <span>{change}</span>
          </div>
        </div>
        
        <motion.div 
          className="kpi-icon"
          variants={iconVariants}
        >
          {getIcon()}
        </motion.div>
      </div>

      {}
      {trend.length > 0 && (
        <div className="kpi-trend">
          <svg viewBox="0 0 100 30" className="trend-svg">
            <defs>
              <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: changeType === 'positive' ? '#10b981' : '#ef4444', stopOpacity: 0.8 }} />
                <stop offset="100%" style={{ stopColor: changeType === 'positive' ? '#10b981' : '#ef4444', stopOpacity: 0.1 }} />
              </linearGradient>
            </defs>
            
            {formatTrendData() && (
              <>
                <motion.polyline
                  points={formatTrendData()}
                  fill="none"
                  stroke={changeType === 'positive' ? '#10b981' : '#ef4444'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: index * 0.1 + 0.8 }}
                />
                <motion.polygon
                  points={`${formatTrendData()},100,100,100,0`}
                  fill={`url(#gradient-${index})`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: index * 0.1 + 1.2 }}
                />
              </>
            )}
          </svg>
        </div>
      )}
    </motion.div>
  );
};

export default KPICard;