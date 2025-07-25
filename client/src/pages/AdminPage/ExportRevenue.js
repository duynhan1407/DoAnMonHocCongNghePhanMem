import React from 'react';
import { Button, message } from 'antd';
import axios from 'axios';

const ExportRevenue = ({ startDate, endDate }) => {
  const handleExport = async () => {
    try {
      const res = await axios.get('/api/booking/stats', {
        params: { startDate, endDate },
      });
      const data = res.data.dailyStats || [];
      let csv = 'Ngày,Số lượt đặt,Doanh thu\n';
      data.forEach(row => {
        csv += `${row.date},${row.bookingCount},${row.revenue}\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'revenue.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      message.success('Xuất file doanh thu thành công!');
    } catch (err) {
      message.error('Lỗi xuất file doanh thu!');
    }
  };
  return (
    <Button type="primary" onClick={handleExport} style={{ marginBottom: 16 }}>
      Xuất file doanh thu (CSV)
    </Button>
  );
};

export default ExportRevenue;
