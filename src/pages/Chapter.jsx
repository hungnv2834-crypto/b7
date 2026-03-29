import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Space } from 'antd';
import axios from 'axios';

const { Option } = Select;

const Chapter = () => {
  const [data, setData] = useState([]);
  const [subjects, setSubjects] = useState([]);
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
      const response = await axios.get(`http://103.166.183.82:4040/api/v1/chapter/pageable?page=${page}&limit=${limit}`, {
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
      message.error('Lỗi khi tải danh sách chương');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('http://103.166.183.82:4040/api/v1/subject/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setSubjects(response.data?.data || response.data || []);
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi tải danh sách môn học cho form');
    }
  };

  useEffect(() => {
    fetchData();
    fetchSubjects();
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
    form.setFieldsValue({
      name: record.name,
      chapterNumber: record.chapterNumber,
      subjectId: record.subjectId?._id || record.subjectId?.id || record.subjectId,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://103.166.183.82:4040/api/v1/chapter/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      message.success('Xóa chương thành công');
      fetchData(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi xóa chương');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await axios.put(`http://103.166.183.82:4040/api/v1/chapter/${editingId}`, values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        message.success('Cập nhật chương thành công');
      } else {
        await axios.post('http://103.166.183.82:4040/api/v1/chapter', values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        message.success('Thêm mới chương thành công');
      }
      setIsModalVisible(false);
      fetchData(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi lưu thông tin chương');
    }
  };

  const columns = [
    { title: 'Số chương', dataIndex: 'chapterNumber', key: 'chapterNumber' },
    { title: 'Tên chương', dataIndex: 'name', key: 'name' },
    { 
      title: 'Môn học', 
      dataIndex: 'subjectId', 
      key: 'subject',
      render: (subject) => subject?.name || 'N/A'
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm title="Bạn có chắc chắn muốn xóa chương này?" onConfirm={() => handleDelete(record._id || record.id)}>
            <Button type="link" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Quản lý Chương</h2>
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
        title={editingId ? "Sửa chương" : "Thêm mới chương"} 
        open={isModalVisible} 
        onOk={handleOk} 
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="chapterNumber" label="Số thứ tự chương" rules={[{ required: true, message: 'Vui lòng nhập số thứ tự chương' }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="name" label="Tên chương" rules={[{ required: true, message: 'Vui lòng nhập tên chương' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="subjectId" label="Môn học" rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}>
            <Select placeholder="Chọn môn học">
              {subjects.map(sub => (
                <Option key={sub._id || sub.id} value={sub._id || sub.id}>{sub.name || sub.subjectCode}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Chapter;
