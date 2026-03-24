import React, { useEffect, useState } from 'react';
import { Layout, Menu, Button, message } from 'antd';
import { UserOutlined, LogoutOutlined, DashboardOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import axios from 'axios';

const { Header, Content, Sider } = Layout;

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const getSelectedKey = () => {
    if (location.pathname.includes('/student')) return 'student';
    if (location.pathname.includes('/teacher')) return 'teacher';
    return 'overview';
  };

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
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,20,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span>Xin chào, <strong>{userInfo?.email || 'Admin'}</strong></span>
              <Button icon={<LogoutOutlined />} onClick={handleLogout} danger type="text">
                Đăng xuất
              </Button>
            </div>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: '#fff' }}>
          <Outlet context={{ userInfo, loading }} />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
