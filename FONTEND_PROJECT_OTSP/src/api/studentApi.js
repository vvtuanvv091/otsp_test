import axiosClient from './axiosClient';

export const studentApi = {
  // Dashboard Stats
  getDashboard: () => axiosClient.get('/student/dashboard/stats'),

  // Profile & Guardians
  getProfile: () => axiosClient.get('/student/profile'),
  updateProfile: (data) => axiosClient.put('/student/profile', data),
  addGuardian: (data) => axiosClient.post('/student/profile/guardians', data),
  removeGuardian: (id) => axiosClient.delete(`/student/profile/guardians/${id}`),
  uploadAvatar: (formData) =>
    axiosClient.post('/student/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Schedule & Classrooms
  getSchedule: (from, to) =>
    axiosClient.get('/student/schedules', { params: { from, to } }),
  getClassrooms: (status = 'Active', page = 1, pageSize = 10, search = '') =>
    axiosClient.get('/student/classrooms', { params: { status, page, pageSize, search } }),
  submitReview: (sessionId, data) =>
    axiosClient.post(`/student/classrooms/sessions/${sessionId}/reviews`, data),

  // Connection Requests & Booking
  getMyConnectionRequests: (status, page = 1, pageSize = 10, search = '') =>
    axiosClient.get('/student/connection-requests/my-requests', {
      params: { status: status === 'All' ? undefined : status, page, pageSize, search },
    }),
  cancelConnectionRequest: (id) =>
    axiosClient.post(`/student/connection-requests/${id}/cancel`),
  getTutorDetails: (tutorId) =>
    axiosClient.get(`/student/connection-requests/tutors/${tutorId}`),
  sendConnectionRequest: (data) =>
    axiosClient.post('/student/connection-requests', data),

  // Payments
  getPayments: () => axiosClient.get('/student/payments'),
  getPaymentCheckout: (paymentId) =>
    axiosClient.get(`/student/payments/${paymentId}/checkout`),
  checkPaymentStatus: (paymentId) =>
    axiosClient.get(`/student/payments/${paymentId}/status`),

  // Documents
  getDocuments: (params) => axiosClient.get('/student/documents', { params }),
};

export default studentApi;
