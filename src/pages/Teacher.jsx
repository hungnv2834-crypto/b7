import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space } from 'antd';
import axios from 'axios';

const Teacher = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchData = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://103.166.183.82:4040/api/v1/teacher/pageable?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      const resData = response.data;
      setData(resData.data || []);
      setPagination({
        ...pagination,
        current: page,
        total: resData.total || 0,
      });
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi tải danh sách giảng viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTableChange = (pagination) => {
    fetchData(pagination.current, pagination.pageSize);
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingId(record._id || record.id);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://103.166.183.82:4040/api/v1/teacher/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      message.success('Xóa thành công');
      fetchData(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi xóa');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await axios.put(`http://103.166.183.82:4040/api/v1/teacher/${editingId}`, values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        message.success('Cập nhật thành công');
      } else {
        await axios.post('http://103.166.183.82:4040/api/v1/teacher', values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        message.success('Thêm mới thành công');
      }
      setIsModalVisible(false);
      fetchData(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi lưu thông tin');
    }
  };

  const columns = [
    { title: 'Mã CB', dataIndex: 'identityCode', key: 'identityCode' },
    { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Khoa', dataIndex: 'department', key: 'department' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={() => handleDelete(record._id || record.id)}>
            <Button type="link" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Quản lý Giảng viên</h2>
        <Button type="primary" onClick={handleAdd}>Thêm mới</Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey={(record) => record._id || record.id || Math.random()} 
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />
      
      <Modal 
        title={editingId ? "Sửa giảng viên" : "Thêm mới giảng viên"} 
        open={isModalVisible} 
        onOk={handleOk} 
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="identityCode" label="Mã cán bộ" rules={[{ required: true, message: 'Vui lòng nhập mã cán bộ' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="department" label="Khoa" rules={[{ required: true, message: 'Vui lòng nhập khoa' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Teacher;
