import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space } from 'antd';
import axios from 'axios';

const Subject = () => {
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
      const response = await axios.get(`http://103.166.183.82:4040/api/v1/subject/pageable?page=${page}&limit=${limit}`, {
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
      message.error('Lỗi khi tải danh sách môn học');
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
      await axios.delete(`http://103.166.183.82:4040/api/v1/subject/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      message.success('Xóa môn học thành công');
      fetchData(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi xóa môn học');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await axios.put(`http://103.166.183.82:4040/api/v1/subject/${editingId}`, values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        message.success('Cập nhật môn học thành công');
      } else {
        await axios.post('http://103.166.183.82:4040/api/v1/subject', values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        message.success('Thêm mới môn học thành công');
      }
      setIsModalVisible(false);
      fetchData(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi lưu thông tin môn học');
    }
  };

  const columns = [
    { title: 'Mã Môn', dataIndex: 'subjectCode', key: 'subjectCode' },
    { title: 'Tên Môn', dataIndex: 'name', key: 'name' },
    { title: 'Giới thiệu', dataIndex: 'introduce', key: 'introduce' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm title="Bạn có chắc chắn muốn xóa môn học này?" onConfirm={() => handleDelete(record._id || record.id)}>
            <Button type="link" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Quản lý Môn học</h2>
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
        title={editingId ? "Sửa môn học" : "Thêm mới môn học"} 
        open={isModalVisible} 
        onOk={handleOk} 
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="subjectCode" label="Mã môn học" rules={[{ required: true, message: 'Vui lòng nhập mã môn học' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Tên môn học" rules={[{ required: true, message: 'Vui lòng nhập tên môn học' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="introduce" label="Giới thiệu">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Subject;
