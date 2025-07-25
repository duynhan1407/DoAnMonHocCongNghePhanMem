import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';

const TableComponent = ({
  columns = [],
  data = [],
  selectionType = 'checkbox',
  onRowSelectionChange,
  pageSize = 10,
  rowDisableCondition = (record) => false, // Customizable disabling logic
}) => {
  // Configure rowSelection
  const rowSelection = {
    type: selectionType,
    onChange: (selectedRowKeys, selectedRows) => {
      if (onRowSelectionChange) {
        onRowSelectionChange(selectedRowKeys, selectedRows);
      }
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    getCheckboxProps: (record) => ({
      disabled: rowDisableCondition(record), // Use customizable condition
      name: record.name,
    }),
  };

  return (
    <Table
      rowSelection={rowSelection}
      columns={columns}
      dataSource={data}
      pagination={{ pageSize }} // Dynamic pagination
      locale={{
        emptyText: 'No data available', // Empty state message
      }}
    />
  );
};

// Prop Types for Validation
TableComponent.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  selectionType: PropTypes.oneOf(['checkbox', 'radio']),
  onRowSelectionChange: PropTypes.func,
  pageSize: PropTypes.number,
  rowDisableCondition: PropTypes.func, // Custom logic for disabling rows
};

export default TableComponent;
