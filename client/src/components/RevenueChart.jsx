import React from 'react';
import { Line } from '@ant-design/charts';

const RevenueChart = ({ data }) => {
  const config = {
    data,
    xField: 'date',
    yField: 'revenue',
    point: { size: 5, shape: 'diamond' },
    label: { style: { fill: '#aaa' } },
    xAxis: { title: { text: 'Ngày' } },
    yAxis: { title: { text: 'Doanh thu (VNĐ)' } },
    smooth: true,
    color: '#3f8600',
  };
  return <Line {...config} style={{ height: 320 }} />;
};

export default RevenueChart;
