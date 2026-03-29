import React, { useEffect, useState } from 'react';
import { Layout, Menu, Button, message, Dropdown, Modal, Form, Input, Space, Descriptions } from 'antd';
import { UserOutlined, LogoutOutlined, DashboardOutlined, TeamOutlined, BookOutlined, FileTextOutlined, DownOutlined, LockOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import axios from 'axios';

const { Header, Content, Sider } = Layout;

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [passwordForm] = Form.useForm();
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        message.warning('Vui lòng đăng nhập để truy cập!');
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('http://103.166.183.82:4040/api/v1/user/info/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const userData = response.data?.data || response.data;
        setUserInfo(userData);
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401 || error.response?.status === 403) {
           message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else {
           message.error('Không thể lấy thông tin người dùng.');
        }
        localStorage.removeItem('access_token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.get('http://103.166.183.82:4040/api/v1/user/logout', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('access_token');
      navigate('/login');
      message.success('Đăng xuất thành công');
    }
  };

  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error('Mật khẩu xác nhận không khớp');
        return;
      }
      
      await axios.post('http://103.166.183.82:4040/api/v1/user/change-password', {
        currentPassword: values.oldPassword,
        newPassword: values.newPassword
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      
      message.success('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
      setIsPasswordVisible(false);
      passwordForm.resetFields();
      handleLogout();
    } catch (error) {
      console.error(error);
      if (error.errorFields) return; // Form validation error
      message.error(error.response?.data?.message || 'Lỗi khi đổi mật khẩu');
    }
  };

  const getSelectedKey = () => {
    if (location.pathname.includes('/student')) return 'student';
    if (location.pathname.includes('/teacher')) return 'teacher';
    if (location.pathname.includes('/subject')) return 'subject';
    if (location.pathname.includes('/chapter')) return 'chapter';
    return 'overview';
  };

  const userMenuItems = [
    {
      key: 'info',
      icon: <InfoCircleOutlined />,
      label: 'Thông tin cá nhân',
      onClick: () => setIsInfoVisible(true)
    },
    {
      key: 'password',
      icon: <LockOutlined />,
      label: 'Đổi mật khẩu',
      onClick: () => {
          passwordForm.resetFields();
          setIsPasswordVisible(true);
      }
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Đăng xuất',
      onClick: handleLogout
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ height: '32px', margin: '16px', color: 'white', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
          Admin Dashboard
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[getSelectedKey()]}>
          <Menu.Item key="overview" icon={<DashboardOutlined />}>
            <Link to="/dashboard">Tổng quan</Link>
          </Menu.Item>
          <Menu.Item key="student" icon={<TeamOutlined />}>
            <Link to="/dashboard/student">Sinh viên</Link>
          </Menu.Item>
          <Menu.Item key="teacher" icon={<TeamOutlined />}>
            <Link to="/dashboard/teacher">Giảng viên</Link>
          </Menu.Item>
          <Menu.Item key="subject" icon={<BookOutlined />}>
            <Link to="/dashboard/subject">Môn học</Link>
          </Menu.Item>
          <Menu.Item key="chapter" icon={<FileTextOutlined />}>
            <Link to="/dashboard/chapter">Chương</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,20,0.08)' }}>
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserOutlined style={{ fontSize: '18px' }} />
                <span>Xin chào, <strong>{userInfo?.email || 'Admin'}</strong></span>
                <DownOutlined style={{ fontSize: '12px' }} />
              </div>
            </Dropdown>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: '#fff' }}>
          <Outlet context={{ userInfo, loading }} />
        </Content>
      </Layout>
      
      <Modal
        title="Thông tin cá nhân"
        open={isInfoVisible}
        onCancel={() => setIsInfoVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsInfoVisible(false)}>Đóng</Button>
        ]}
      >
        <Descriptions column={1} bordered size="small" style={{ marginTop: 16 }}>
          <Descriptions.Item label="ID">{userInfo?._id || userInfo?.id}</Descriptions.Item>
          <Descriptions.Item label="Email">{userInfo?.email}</Descriptions.Item>
          <Descriptions.Item label="Vai trò">{userInfo?.role || userInfo?.roles?.join(', ') || 'Admin'}</Descriptions.Item>
        </Descriptions>
      </Modal>

      <Modal
        title="Đổi mật khẩu"
        open={isPasswordVisible}
        onCancel={() => setIsPasswordVisible(false)}
        onOk={handleChangePassword}
        okText="Xác nhận"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={passwordForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="oldPassword" label="Mật khẩu cũ" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="confirmPassword" label="Xác nhận mật khẩu mới" rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới' }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Dashboard;
