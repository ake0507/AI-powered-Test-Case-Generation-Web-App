export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface Project {
  id: number;
  user_id: number;
  name: string;
  input_data: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  test_case_count?: number;
}

export interface TestCase {
  id: number;
  project_id: number;
  title: string;
  description: string;
  expected_outcome: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectDetail extends Project {
  test_cases: TestCase[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ApiError {
  error: string;
  message: string;
}
