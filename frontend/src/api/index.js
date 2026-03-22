import api from './axios.js';

// ── Auth ──────────────────────────────────────────
export const authAPI = {
  login:          (data) => api.post('/auth/login', data),
  getMe:          ()     => api.get('/auth/me'),
  logout:         ()     => api.post('/auth/logout'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ── Dashboard ─────────────────────────────────────
export const dashboardAPI = {
  getStats:          ()       => api.get('/dashboard/stats'),
  getRevenueChart:   (days)   => api.get('/dashboard/revenue-chart', { params: { days } }),
  getRecentBookings: (limit)  => api.get('/dashboard/recent-bookings', { params: { limit } }),
  getRideDistribution: ()     => api.get('/dashboard/ride-distribution'),
};

// ── Cab Bookings ──────────────────────────────────
export const bookingsAPI = {
  getAll:       (params) => api.get('/bookings', { params }),
  getOne:       (id)     => api.get(`/bookings/${id}`),
  create:       (data)   => api.post('/bookings', data),
  updateStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
  remove:       (id)     => api.delete(`/bookings/${id}`),
};

// ── Intercity ─────────────────────────────────────
export const intercityAPI = {
  getAll:       (params) => api.get('/intercity', { params }),
  getOne:       (id)     => api.get(`/intercity/${id}`),
  create:       (data)   => api.post('/intercity', data),
  updateStatus: (id, data) => api.put(`/intercity/${id}/status`, data),
  remove:       (id)     => api.delete(`/intercity/${id}`),
};

// ── Rental ────────────────────────────────────────
export const rentalAPI = {
  getAll:       (params) => api.get('/rental', { params }),
  getOne:       (id)     => api.get(`/rental/${id}`),
  create:       (data)   => api.post('/rental', data),
  updateStatus: (id, data) => api.put(`/rental/${id}/status`, data),
  remove:       (id)     => api.delete(`/rental/${id}`),
};

// ── Rental Packages ───────────────────────────────
export const rentalPackagesAPI = {
  getAll:       (params) => api.get('/rental-packages', { params }),
  create:       (data)   => api.post('/rental-packages', data),
  update:       (id, data) => api.put(`/rental-packages/${id}`, data),
  updateStatus: (id, data) => api.patch(`/rental-packages/${id}/status`, data),
  remove:       (id)     => api.delete(`/rental-packages/${id}`),
};

// ── Customers ─────────────────────────────────────
export const customersAPI = {
  getAll:        (params) => api.get('/customers', { params }),
  getOne:        (id)     => api.get(`/customers/${id}`),
  create:        (data)   => api.post('/customers', data),
  update:        (id, data) => api.put(`/customers/${id}`, data),
  toggleStatus:  (id)     => api.put(`/customers/${id}/toggle-status`),
  updateWallet:  (id, data) => api.put(`/customers/${id}/wallet`, data),
  remove:        (id)     => api.delete(`/customers/${id}`),
};

// ── Drivers ───────────────────────────────────────
export const driversAPI = {
  getAll:       (params) => api.get('/drivers', { params }),
  getPending:   ()       => api.get('/drivers/pending'),
  getOne:       (id)     => api.get(`/drivers/${id}`),
  create:       (data)   => api.post('/drivers', data),
  update:       (id, data) => api.put(`/drivers/${id}`, data),
  approve:      (id)     => api.put(`/drivers/${id}/approve`),
  reject:       (id)     => api.put(`/drivers/${id}/reject`),
  toggleBlock:  (id)     => api.put(`/drivers/${id}/toggle-block`),
  remove:       (id)     => api.delete(`/drivers/${id}`),
};

// ── Employees ─────────────────────────────────────
export const employeesAPI = {
  getAll:        (params) => api.get('/employees', { params }),
  getOne:        (id)     => api.get(`/employees/${id}`),
  create:        (data)   => api.post('/employees', data),
  update:        (id, data) => api.put(`/employees/${id}`, data),
  toggleStatus:  (id)     => api.put(`/employees/${id}/toggle-status`),
  remove:        (id)     => api.delete(`/employees/${id}`),
};

// ── Roles ─────────────────────────────────────────
export const rolesAPI = {
  getAll:        (params) => api.get('/roles', { params }),
  getOne:        (id)     => api.get(`/roles/${id}`),
  create:        (data)   => api.post('/roles', data),
  update:        (id, data) => api.put(`/roles/${id}`, data),
  toggleStatus:  (id)     => api.put(`/roles/${id}/toggle-status`),
  remove:        (id)     => api.delete(`/roles/${id}`),
};


// ── Finance ───────────────────────────────────────
export const financeAPI = {
  getSummary:     (period) => api.get('/finance/summary', { params: { period } }),
  getTopDrivers:  (period) => api.get('/finance/top-drivers', { params: { period } }),
  getRevenueTrend:(days)   => api.get('/finance/revenue-trend', { params: { days } }),
};

// ── Support ───────────────────────────────────────
export const supportAPI = {
  getAll:       (params) => api.get('/support', { params }),
  getOne:       (id)     => api.get(`/support/${id}`),
  updateStatus: (id, data) => api.put(`/support/${id}/status`, data),
  addReply:     (id, data) => api.post(`/support/${id}/reply`, data),
  assign:       (id, data) => api.put(`/support/${id}/assign`, data),
};

// ── SOS ───────────────────────────────────────────
export const sosAPI = {
  getAll:      (params) => api.get('/sos', { params }),
  getOne:      (id)     => api.get(`/sos/${id}`),
  acknowledge: (id)     => api.put(`/sos/${id}/acknowledge`),
  resolve:     (id, data) => api.put(`/sos/${id}/resolve`, data),
};



// ── Coupons ───────────────────────────────────────
export const couponsAPI = {
  getAll:       (params) => api.get('/coupons', { params }),
  create:       (data)   => api.post('/coupons', data),
  update:       (id, data) => api.put(`/coupons/${id}`, data),
  toggleStatus: (id)     => api.put(`/coupons/${id}/toggle-status`),
  remove:       (id)     => api.delete(`/coupons/${id}`),
  validate:     (data)   => api.post('/coupons/validate', data),
};

// ── Incentives ────────────────────────────────────
export const incentivesAPI = {
  getAll:       (params) => api.get('/incentives', { params }),
  create:       (data)   => api.post('/incentives/create', data),
  update:       (id, data) => api.put(`/incentives/${id}`, data),
  toggleStatus: (id)     => api.patch(`/incentives/toggle/${id}`),
  getProgress:  (driverId) => api.get(`/incentives/progress/${driverId}`),
};

// ── Tour Packages ─────────────────────────────────
export const packagesAPI = {
  getAll:       (params) => api.get('/packages', { params }),
  getOne:       (id)     => api.get(`/packages/${id}`),
  create:       (data)   => api.post('/packages', data),
  update:       (id, data) => api.put(`/packages/${id}`, data),
  toggleStatus: (id)     => api.put(`/packages/${id}/toggle-status`),
  remove:       (id)     => api.delete(`/packages/${id}`),
};

// ── Destinations ──────────────────────────────────
export const destinationsAPI = {
  getAll:       ()       => api.get('/destinations'),
  getOne:       (id)     => api.get(`/destinations/${id}`),
  create:       (data)   => api.post('/destinations', data),
  update:       (id, data) => api.put(`/destinations/${id}`, data),
  updateStatus: (id, data) => api.patch(`/destinations/${id}/status`, data),
  remove:       (id)     => api.delete(`/destinations/${id}`),
};

// ── Services ──────────────────────────────────────
export const servicesAPI = {
  getAll:       (params) => api.get('/services', { params }),
  getOne:       (id)     => api.get(`/services/${id}`),
  create:       (data)   => api.post('/services', data),
  update:       (id, data) => api.put(`/services/${id}`, data),
  toggleStatus: (id, data) => api.patch(`/services/${id}/status`, data),
  remove:       (id)     => api.delete(`/services/${id}`),
};

// ── Settings ──────────────────────────────────────
export const settingsAPI = {
  getAll:          (params)      => api.get('/settings', { params }),
  getPublic:       ()            => api.get('/settings/public'),
  getByCategory:   (cat)         => api.get(`/settings/${cat}`),
  getByKey:        (key)         => api.get(`/settings/key/${key}`),
  update:          (data)        => api.put('/settings', data),
  updateCategory:  (cat, data)   => api.put(`/settings/${cat}`, data),
  updateKey:       (key, value)  => api.put(`/settings/key/${key}`, { value }),
  create:          (data)        => api.post('/settings', data),
  deleteKey:       (key)         => api.delete(`/settings/key/${key}`),
  seed:            ()            => api.post('/settings/seed'),
};

// ── Pricing ───────────────────────────────────────
export const pricingAPI = {
  getAll:       (params) => api.get('/pricing', { params }),
  getOne:       (id)     => api.get(`/pricing/${id}`),
  create:       (data)   => api.post('/pricing', data),
  update:       (id, data) => api.put(`/pricing/${id}`, data),
  updateStatus: (id, data) => api.patch(`/pricing/${id}/status`, data),
  remove:       (id)     => api.delete(`/pricing/${id}`),
};
