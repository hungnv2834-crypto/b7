import React, { useEffect, useState } from 'react';
import { Layout, Menu, Card, Descriptions, Spin, Button, message, Tag } from 'antd';
import { UserOutlined, LogoutOutlined, DashboardOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Header, Content, Sider } = Layout;

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        console.error('Lỗi lấy thông tin:', error);
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ height: '32px', margin: '16px', color: 'white', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
          Admin Dashboard
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            Tổng quan
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
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <Spin size="large" tip="Đang tải thông tin..." />
            </div>
          ) : userInfo ? (
            <Card title={<><UserOutlined/> Thông tin tài khoản</>} bordered={false} style={{ width: '100%', maxWidth: 800, margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <Descriptions bordered column={1} size="middle">
                <Descriptions.Item label="Email">{userInfo.email || <Tag color="warning">Chưa cập nhật</Tag>}</Descriptions.Item>
                <Descriptions.Item label="Quyền hạn (Role)">
                  {userInfo.role ? <Tag color="blue">{userInfo.role}</Tag> : <Tag color="default">USER</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color="success">Hoạt động</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tất cả thông tin (Raw Data)">
                  <pre style={{ margin: 0, padding: '10px', background: '#f5f5f5', borderRadius: '4px', overflowX: 'auto' }}>
                    {JSON.stringify(userInfo, null, 2)}
                  </pre>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px' }}>Không tải được thông tin cá nhân.</div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
