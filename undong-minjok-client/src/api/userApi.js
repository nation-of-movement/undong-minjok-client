import api from './axios.js';

export const getMyInfoApi = () => {
  return api.get('/users/me')
}

export const updateNicknameApi = (nickname) => {
  return api.patch('/users/nickname', { nickname })
}

export const updateBioApi = (bio) => {
  return api.patch('/users/bio', { bio })
}

export const uploadProfileImageApi = (file) => {
  const formData = new FormData()
  formData.append('file', file)

  return api.post('/users/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const deleteUserApi = () => {
  return api.delete('/users')
}

export const resetPasswordApi = (data) => {
  return api.post("/users/reset-password", data).then(res => res.data);
};

