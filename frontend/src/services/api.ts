import type { AuthResponse, Project, ProjectDetail, TestCase, User } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'RequestFailed',
        message: response.statusText,
      }));
      const detail = error.detail || error;
      throw new Error(detail.message || detail.error || 'Request failed');
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  register(name: string, email: string, password: string): Promise<AuthResponse> {
    return this.request('/api/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  login(email: string, password: string): Promise<AuthResponse> {
    return this.request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  logout(): Promise<void> {
    return this.request('/api/logout', { method: 'POST' });
  }

  getMe(): Promise<User> {
    return this.request('/api/users/me');
  }

  getProjects(): Promise<Project[]> {
    return this.request('/api/projects');
  }

  createProject(name: string, inputData: string): Promise<Project> {
    return this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name, input_data: inputData }),
    });
  }

  getProject(id: number): Promise<ProjectDetail> {
    return this.request(`/api/projects/${id}`);
  }

  deleteProject(id: number): Promise<void> {
    return this.request(`/api/projects/${id}`, { method: 'DELETE' });
  }

  regenerateProject(id: number): Promise<Project> {
    return this.request(`/api/projects/${id}/regenerate`, { method: 'POST' });
  }

  updateTestCase(
    id: number,
    data: Partial<Pick<TestCase, 'title' | 'description' | 'expected_outcome'>>
  ): Promise<TestCase> {
    return this.request(`/api/testcases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteTestCase(id: number): Promise<void> {
    return this.request(`/api/testcases/${id}`, { method: 'DELETE' });
  }

  async exportProject(id: number): Promise<void> {
    const token = this.getToken();
    const response = await fetch(`${API_BASE}/api/projects/${id}/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Export failed');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `testcases-${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  getAdminStats(): Promise<Record<string, unknown>> {
    return this.request('/api/admin/stats');
  }
}

export const api = new ApiClient();
