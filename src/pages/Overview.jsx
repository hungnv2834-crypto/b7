import React from 'react';
import { Card, Descriptions, Spin, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useOutletContext } from 'react-router-dom';

const Overview = () => {
  const { userInfo, loading } = useOutletContext();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );
  }

  if (!userInfo) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Không tải được thông tin cá nhân.</div>;
  }

  return (
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
  );
};

export default Overview;
