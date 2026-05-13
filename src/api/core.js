import api from './axios'

// Users
export const getUsers = () => api.get('/users/')
export const createUser = (data) => api.post('/users/', data)
export const updateUser = (id, data) => api.patch(`/users/${id}/`, data)
export const deleteUser = (id) => api.delete(`/users/${id}/`)
export const archiveUser = (id) => api.patch(`/users/${id}/archive/`)

// Courses
export const getCourses   = ()        => api.get('/courses/')
export const createCourse = (data)    => api.post('/courses/', data)
export const updateCourse = (id,data) => api.patch(`/courses/${id}/`, data)
export const archiveCourse= (id)      => api.patch(`/courses/${id}/archive/`)

// Students
export const getStudents   = ()        => api.get('/students/')
export const createStudent = (data)    => api.post('/students/', data)
export const updateStudent = (id,data) => api.patch(`/students/${id}/`, data)
export const archiveStudent= (id)      => api.patch(`/students/${id}/archive/`)

// Teachers
export const getTeachers   = ()        => api.get('/teachers/')
export const createTeacher = (data)    => api.post('/teachers/', data)
export const updateTeacher = (id,data) => api.patch(`/teachers/${id}/`, data)
export const archiveTeacher= (id)      => api.patch(`/teachers/${id}/archive/`)

// Schedules
export const getSchedules   = ()        => api.get('/schedules/')
export const createSchedule = (data)    => api.post('/schedules/', data)
export const updateSchedule = (id,data) => api.patch(`/schedules/${id}/`, data)
export const archiveSchedule= (id)      => api.patch(`/schedules/${id}/archive/`)
export const deleteSchedule = (id)      => api.delete(`/schedules/${id}/`)

export const getBillings    = ()        => api.get('/billings/')
export const createBilling  = (data)    => api.post('/billings/', data)
export const updateBilling  = (id,data) => api.patch(`/billings/${id}/`, data)
export const markBillingPaid= (id)      => api.patch(`/billings/${id}/mark_paid/`)