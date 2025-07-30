// Biểu đồ doanh thu sử dụng recharts. Nếu gặp lỗi, hãy kiểm tra các package phụ thuộc như recharts, react-scripts, webpack, v.v.
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RevenueChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={380}>
    <LineChart data={data} margin={{ top: 32, right: 40, left: 24, bottom: 32 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis 
        dataKey="date" 
        tick={{ fontSize: 14 }} 
        angle={-20} 
        textAnchor="end"
        interval={0}
        minTickGap={20}
      />
      <YAxis
        label={{ value: 'Doanh thu (VNĐ)', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 14 } }}
        tickFormatter={value => value.toLocaleString('vi-VN')}
        allowDecimals={false}
        domain={['dataMin - dataMin*0.1', 'dataMax + dataMax*0.1']}
        padding={{ top: 30, bottom: 30 }}
        tick={{ fontSize: 14 }}
      />
      <Tooltip
        contentStyle={{ fontSize: 15, borderRadius: 8, boxShadow: '0 2px 8px #ccc', minWidth: 220 }}
        formatter={(value, name, props) => {
          if (name === 'Doanh thu') return [`${value.toLocaleString('vi-VN')} VNĐ`, 'Doanh thu'];
          if (name === 'Số lượt đặt hàng') return [`${value} lượt`, 'Số lượt đặt hàng'];
          return [value, name];
        }}
        labelFormatter={(label) => <span style={{ fontWeight: 600 }}>{`Ngày: ${label}`}</span>}
        separator={': '}
      />
      <Legend verticalAlign="top" height={40} iconType="circle" wrapperStyle={{ fontSize: 15 }} />
      <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#3f8600" strokeWidth={3} dot />
      {/* Line ẩn để tooltip luôn hiển thị số lượt đặt hàng */}
      <Line type="monotone" dataKey="orderCount" name="Số lượt đặt hàng" stroke="#ffffff00" activeDot={false} dot={false} legendType="none" />
    </LineChart>
  </ResponsiveContainer>
);

export default RevenueChart;
