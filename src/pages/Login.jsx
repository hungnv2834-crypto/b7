import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('http://103.166.183.82:4040/api/v1/user/login', {
        email: values.email,
        password: values.password,
      });

      // Based on common API patterns, we try to extract the token
      const token = response.data?.data?.token || response.data?.token || response.data?.data?.access_token || response.data?.access_token;
      
      if (token) {
        localStorage.setItem('access_token', token);
        message.success('Đăng nhập thành công!');
        navigate('/dashboard');
      } else if (response.data?.data && typeof response.data.data === 'string') {
        // Sometimes backend just returns token as string in data
        localStorage.setItem('access_token', response.data.data);
        message.success('Đăng nhập thành công!');
        navigate('/dashboard');
      } else {
        message.error('Không tìm thấy token trong phản hồi từ server.');
        console.log('Phản hồi API:', response.data);
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      message.error(error.response?.data?.message || error.response?.data?.error || 'Đăng nhập thất bại. Kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card title="Hệ thống Quản trị - Đăng nhập" style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không đúng định dạng!' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập email của bạn" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" size="large" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }} size="large" loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
