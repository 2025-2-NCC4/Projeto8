import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

const AGE_GROUPS = [
  { min: 16, max: 25, label: '16-25' },
  { min: 26, max: 35, label: '26-35' },
  { min: 36, max: 45, label: '36-45' },
  { min: 46, max: 55, label: '46-55' },
  { min: 56, max: 65, label: '56-65' },
  { min: 66, max: 100, label: '65+' }
];

const GENDER_COLORS = {
  'Masculino': '#8b5cf6',
  'Feminino': '#06b6d4', 
  'Outro': '#10b981'
};

const DemographicPyramid = React.memo(({ data }) => {
  const pyramidData = useMemo(() => {
    if (!data || data.length === 0) {
      return AGE_GROUPS.map(group => ({
        ageGroup: group.label,
        masculino: Math.floor(Math.random() * 100) + 20,
        feminino: Math.floor(Math.random() * 100) + 20,
        outro: Math.floor(Math.random() * 20) + 5,
        total: 0
      }));
    }

    const demographics = {};
    
    AGE_GROUPS.forEach(group => {
      demographics[group.label] = {
        ageGroup: group.label,
        masculino: 0,
        feminino: 0,
        outro: 0,
        total: 0
      };
    });

    data.forEach(item => {
      const age = parseInt(item.idade) || parseInt(item.age) || 30;
      const gender = item.sexo || item.gender || 'Outro';
      
      const ageGroup = AGE_GROUPS.find(group => age >= group.min && age <= group.max);
      if (ageGroup) {
        const groupLabel = ageGroup.label;
        const genderKey = gender.toLowerCase();
        
        if (genderKey.includes('masc')) {
          demographics[groupLabel].masculino += 1;
        } else if (genderKey.includes('fem')) {
          demographics[groupLabel].feminino += 1;
        } else {
          demographics[groupLabel].outro += 1;
        }
        demographics[groupLabel].total += 1;
      }
    });

    return Object.values(demographics).map(group => ({
      ...group,
      total: group.masculino + group.feminino + group.outro
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title">Faixa Etária: {label}</p>
          {payload.map((entry, index) => {
            const value = Math.abs(entry.value);
            const percentage = ((value / entry.payload.total) * 100).toFixed(1);
            return (
              <p key={index} className="tooltip-detail" style={{ color: entry.color }}>
                {entry.name}: {value} ({percentage}%)
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const CustomLabel = (props) => {
    const { x, y, width, height, value } = props;
    const absValue = Math.abs(value);
    if (absValue === 0) return null;
    
    return (
      <text
        x={value < 0 ? x - 5 : x + width + 5}
        y={y + height / 2}
        textAnchor={value < 0 ? 'end' : 'start'}
        dominantBaseline="middle"
        fontSize={12}
        fill="#666"
      >
        {absValue}
      </text>
    );
  };

  if (!pyramidData || pyramidData.length === 0) {
    return (
      <div className="chart-empty">
        <p>Sem dados demográficos disponíveis</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={pyramidData}
        layout="horizontal"
        margin={{ top: 20, right: 60, bottom: 20, left: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="ageGroup"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="masculino"
          stackId="gender"
          fill={GENDER_COLORS.Masculino}
          name="Masculino"
        />
        <Bar
          dataKey="feminino"
          stackId="gender"
          fill={GENDER_COLORS.Feminino}
          name="Feminino"
        />
        <Bar
          dataKey="outro"
          stackId="gender"
          fill={GENDER_COLORS.Outro}
          name="Outro"
        />
      </BarChart>
    </ResponsiveContainer>
  );
});

export default DemographicPyramid;