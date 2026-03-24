const axios = require('axios');

async function test() {
  try {
    const loginRes = await axios.post('http://103.166.183.82:4040/api/v1/user/login', {
      email: 'levanquang@gmail.com',
      password: 'b19vt292'
    });
    const token = loginRes.data?.data?.token || loginRes.data?.token || loginRes.data?.data?.access_token || loginRes.data?.access_token || loginRes.data?.data?.accessToken || loginRes.data?.accessToken || loginRes.data?.data;
    
    console.log('Got token');
    
    const res = await axios.get('http://103.166.183.82:4040/api/v1/student/pageable?page=1&limit=10', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
test();
