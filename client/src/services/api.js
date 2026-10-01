import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
});

// Articles Public
export const getArticles = async (params = {}) => {
  const { data } = await api.get('/articles', { params });
  return data;
};

export const getBreakingArticles = async () => {
  const { data } = await api.get('/articles/breaking');
  return data;
};

export const getFeaturedArticles = async () => {
  const { data } = await api.get('/articles/featured');
  return data;
};

export const getTrendingArticles = async () => {
  const { data } = await api.get('/articles/trending');
  return data;
};

export const getArticleBySlug = async (slug) => {
  const { data } = await api.get(`/articles/${slug}`);
  return data;
};

// Categories
export const getCategories = async () => {
  const { data } = await api.get('/categories');
  return data;
};

export const createCategory = async (payload) => {
  const { data } = await api.post('/categories', payload);
  return data;
};

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
};

// Sources
export const getSources = async () => {
  const { data } = await api.get('/sources');
  return data;
};

export const createSource = async (payload) => {
  const { data } = await api.post('/sources', payload);
  return data;
};

export const updateSource = async (id, payload) => {
  const { data } = await api.patch(`/sources/${id}`, payload);
  return data;
};

export const deleteSource = async (id) => {
  const { data } = await api.delete(`/sources/${id}`);
  return data;
};

export const testSourceFeed = async (feedUrl) => {
  const { data } = await api.post('/sources/test', { feedUrl });
  return data;
};

// Admin Endpoints
export const adminLogin = async (email, password) => {
  const { data } = await api.post('/admin/login', { email, password });
  return data;
};

export const getAdminStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data;
};

export const getAdminArticles = async (params = {}) => {
  const { data } = await api.get('/admin/articles', { params });
  return data;
};

export const getAdminArticleById = async (id) => {
  const { data } = await api.get(`/admin/articles/${id}`);
  return data;
};

export const updateArticle = async (id, payload) => {
  const { data } = await api.put(`/admin/articles/${id}`, payload);
  return data;
};

export const deleteArticle = async (id) => {
  const { data } = await api.delete(`/admin/articles/${id}`);
  return data;
};

export const toggleArticleFlag = async (id, field) => {
  const { data } = await api.patch(`/admin/articles/${id}/toggle`, { field });
  return data;
};

export const getReviewQueue = async () => {
  const { data } = await api.get('/admin/review-queue');
  return data;
};

export const approveArticle = async (id, payload) => {
  const { data } = await api.patch(`/admin/articles/${id}/approve`, payload);
  return data;
};

export const rejectArticle = async (id) => {
  const { data } = await api.patch(`/admin/articles/${id}/reject`);
  return data;
};

export const createArticle = async (payload) => {
  const { data } = await api.post('/admin/articles', payload);
  return data;
};

// Crawler
export const runCrawler = async () => {
  const { data } = await api.post('/crawler/run');
  return data;
};

export const getCrawlerLogs = async () => {
  const { data } = await api.get('/crawler/logs');
  return data;
};

export default api;
