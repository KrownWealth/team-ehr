export interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
}

export interface ApiResponse<T = any> {
  status: "success" | "error";
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface VitalsAnalysis {
  alerts: VitalAlert[];
  warnings: VitalAlert[];
  normal: string[];
}

export interface VitalAlert {
  type: "CRITICAL" | "WARNING";
  parameter: string;
  value: any;
  message: string;
}
