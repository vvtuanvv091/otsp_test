import axiosClient from './axiosClient';

export const adminApi = {
  getProfile: () => axiosClient.get('/admin/profile'),
  updateProfile: (data) => axiosClient.put('/admin/profile', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatarFile', file);
    // axiosClient defaults POSTs to application/json. Override it for FormData so
    // Axios uses multipart encoding and ASP.NET can bind avatarFile.
    return axiosClient.post('/admin/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getPendingTutors: () => axiosClient.get('/admin/tutor-approvals'),
  getTutorApprovalDashboard: (params) => axiosClient.get('/admin/tutor-approvals/dashboard', { params }),
  getPendingQualifications: () => axiosClient.get('/admin/tutor-approvals/qualifications/pending'),
  approveTutor: (id) => axiosClient.post(`/admin/tutor-approvals/${id}/approve`),
  rejectTutor: (id, reason) =>
    axiosClient.post(`/admin/tutor-approvals/${id}/reject`, { reason }),
  approveQualification: (id) =>
    axiosClient.post(`/admin/tutor-approvals/qualifications/${id}/approve`),
  rejectQualification: (id, reason) =>
    axiosClient.post(`/admin/tutor-approvals/qualifications/${id}/reject`, { reason }),
  getQualificationFile: (id) =>
    axiosClient.get(`/admin/tutor-approvals/qualifications/${id}`, { responseType: 'blob' }),
  aiVerifyQualification: (id) =>
    axiosClient.post(`/admin/tutor-approvals/qualifications/${id}/ai-verify`),
  getStudents: (params) => axiosClient.get('/admin/students', { params }),
  updateStudent: (userId, data) => axiosClient.put(`/admin/students/${encodeURIComponent(userId)}`, data),
  deleteStudent: (userId) => axiosClient.delete(`/admin/students/${encodeURIComponent(userId)}`),
  lockStudent: (userId) => axiosClient.put(`/admin/students/${encodeURIComponent(userId)}/lock`),
  unlockStudent: (userId) => axiosClient.put(`/admin/students/${encodeURIComponent(userId)}/unlock`),
  getTutors: (params) => axiosClient.get('/admin/tutors', { params }),
  updateTutor: (userId, data) => axiosClient.put(`/admin/tutors/${encodeURIComponent(userId)}`, data),
  deleteTutor: (userId) => axiosClient.delete(`/admin/tutors/${encodeURIComponent(userId)}`),
  lockTutor: (userId) => axiosClient.put(`/admin/tutors/${encodeURIComponent(userId)}/lock`),
  unlockTutor: (userId) => axiosClient.put(`/admin/tutors/${encodeURIComponent(userId)}/unlock`),
  getConnectionRequests: (params) => axiosClient.get('/admin/connection-requests', { params }),
  cancelConnectionRequest: (id, reason) => axiosClient.post(`/admin/connection-requests/${id}/cancel`, { reason }),
  getClassrooms: (params) => axiosClient.get('/admin/classrooms', { params }),
  updateClassroom: (id, data) => axiosClient.put(`/admin/classrooms/${id}`, data),
  deleteClassroom: (id) => axiosClient.delete(`/admin/classrooms/${id}`),
  cancelClassroom: (id, reason) => axiosClient.post(`/admin/classrooms/${id}/cancel`, { reason }),
  cancelClassSession: (id, reason) => axiosClient.post(`/admin/classrooms/sessions/${id}/cancel`, { reason }),
  getSubjects: () => axiosClient.get('/admin/catalog/subjects'),
  createSubject: (data) => axiosClient.post('/admin/catalog/subjects', data),
  updateSubject: (id, data) => axiosClient.put(`/admin/catalog/subjects/${id}`, data),
  deleteSubject: (id) => axiosClient.delete(`/admin/catalog/subjects/${id}`),
  getGradeLevels: () => axiosClient.get('/admin/catalog/grade-levels'),
  createGradeLevel: (data) => axiosClient.post('/admin/catalog/grade-levels', data),
  updateGradeLevel: (id, data) => axiosClient.put(`/admin/catalog/grade-levels/${id}`, data),
  deleteGradeLevel: (id) => axiosClient.delete(`/admin/catalog/grade-levels/${id}`),
  getLearningDocuments: (params) => axiosClient.get('/admin/learning-documents', { params }),
  getLearningDocumentFile: (id) => axiosClient.get(`/admin/learning-documents/${id}/file`, { responseType: 'blob' }),
  approveLearningDocument: (id) => axiosClient.put(`/admin/learning-documents/${id}/approve`),
  rejectLearningDocument: (id, reason) => axiosClient.put(`/admin/learning-documents/${id}/reject`, { reason }),
  updateLearningDocument: (id, data) => axiosClient.put(`/admin/learning-documents/${id}`, data),
  deleteLearningDocument: (id) => axiosClient.delete(`/admin/learning-documents/${id}`),
  deleteComplaint: (id) => axiosClient.delete(`/admin/operations/complaints/${id}`),
};

export default adminApi;

