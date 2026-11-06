import axiosClient from './axiosClient';

export const tutorApi = {
  // Dashboard
  getDashboard: () => axiosClient.get('/tutor/dashboard/stats'),
  getIncome: (month) => axiosClient.get('/tutor/income', { params: month ? { month } : {} }),
  saveIncomeBankAccount: (data) => axiosClient.post('/tutor/income/bank-account', data),

  // Profile & Qualifications
  getProfile: () => axiosClient.get('/tutor/profile'),
  updateProfile: (data) => axiosClient.put('/tutor/profile', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatarFile', file);
    return axiosClient.post('/tutor/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getQualifications: () => axiosClient.get('/tutor/qualifications'),
  uploadQualification: (formData) =>
    axiosClient.post('/tutor/qualifications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteQualification: (id) => axiosClient.delete(`/tutor/qualifications/${id}`),

  // Schedule & Availability
  getSchedule: (weekOffset = 0, jumpDate = null) => {
    let url = `/tutor/schedules?weekOffset=${weekOffset}`;
    if (jumpDate) url += `&jumpDate=${encodeURIComponent(jumpDate)}`;
    return axiosClient.get(url);
  },
  createSession: (data) => axiosClient.post('/tutor/schedules/sessions', data),
  cancelSession: (id) => axiosClient.post(`/tutor/schedules/sessions/${id}/cancel`),
  confirmTrialSchedule: (data) => axiosClient.post('/tutor/schedules/trial/confirm', data),
  getAvailabilities: () => axiosClient.get('/tutor/availabilities'),
  saveAvailabilities: (data) => axiosClient.post('/tutor/availabilities', data),

  // Connection Requests
  getConnectionRequests: (params) => axiosClient.get('/tutor/connection-requests', { params }),
  acceptConnectionRequest: (id) => axiosClient.post(`/tutor/connection-requests/${id}/accept`),
  rejectConnectionRequest: (id, reason) =>
    axiosClient.post(`/tutor/connection-requests/${id}/reject`, { reason }),

  // Classrooms
  getClassrooms: (params) => axiosClient.get('/tutor/classrooms', { params }),
  getClassroom: (id) => axiosClient.get(`/tutor/classrooms/${id}`),
  getClassroomOptions: () => axiosClient.get('/tutor/classrooms/options'),
  createClassroom: (formData) =>
    axiosClient.post('/tutor/classrooms', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateClassroom: (id, data) => {
    if (data instanceof FormData) {
      return axiosClient.post(`/tutor/classrooms/${id}/update`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return axiosClient.put(`/tutor/classrooms/${id}`, data);
  },
  cancelClassroom: (id) => axiosClient.post(`/tutor/classrooms/${id}/cancel`),

  // Students & Subjects
  getStudents: (params) => axiosClient.get('/tutor/students', { params }),
  getSubjects: (params) => axiosClient.get('/tutor/subjects', { params }),
  addSubject: (data) => axiosClient.post('/tutor/subjects', data),
  updateSubjectRate: (id, hourlyFee) =>
    axiosClient.put(`/tutor/subjects/${id}`, { hourlyFee }),
  removeSubject: (id) => axiosClient.delete(`/tutor/subjects/${id}`),

  // Documents
  getDocuments: (params) => axiosClient.get('/tutor/documents', { params }),
  uploadDocument: (formData) =>
    axiosClient.post('/tutor/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteDocument: (id) => axiosClient.delete(`/tutor/documents/${id}`),

  // Reviews
  getReviews: (params) => axiosClient.get('/tutor/reviews', { params }),
};

export default tutorApi;
