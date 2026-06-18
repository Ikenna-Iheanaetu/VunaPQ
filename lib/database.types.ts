// Hand-maintained to mirror supabase/migrations. Regenerate once the project
// exists with:  supabase gen types typescript --project-id <ref> > lib/database.types.ts

export type UserRole = 'student' | 'course_rep' | 'department_admin' | 'super_admin';
export type ExamType = 'exam' | 'test' | 'quiz' | 'assignment';
export type SemesterType = 'first' | 'second';
export type SolutionSource = 'ai' | 'human';
export type AssignmentStatus = 'active' | 'pending' | 'revoked';
export type TransferStatus = 'pending' | 'approved' | 'rejected';

type Timestamped = { created_at: string };

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: { id: string; name: string } & Timestamped;
        Insert: { id?: string; name: string; created_at?: string };
        Update: Partial<{ id: string; name: string; created_at: string }>;
        Relationships: [];
      };
      departments: {
        Row: { id: string; school_id: string | null; name: string; code: string } & Timestamped;
        Insert: { id?: string; school_id?: string | null; name: string; code: string; created_at?: string };
        Update: Partial<{ id: string; school_id: string | null; name: string; code: string; created_at: string }>;
        Relationships: [];
      };
      sessions: {
        Row: { id: string; label: string };
        Insert: { id?: string; label: string };
        Update: Partial<{ id: string; label: string }>;
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          department_id: string;
          level: number;
          semester: SemesterType;
          code: string;
          title: string;
          credit_load: number | null;
        } & Timestamped;
        Insert: {
          id?: string;
          department_id: string;
          level: number;
          semester: SemesterType;
          code: string;
          title: string;
          credit_load?: number | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['courses']['Insert']>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          matric_no: string | null;
          department_id: string | null;
          current_level: number | null;
          role: UserRole;
        } & Timestamped;
        Insert: {
          id: string;
          full_name?: string;
          matric_no?: string | null;
          department_id?: string | null;
          current_level?: number | null;
          role?: UserRole;
          created_at?: string;
        };
        Update: Partial<{
          full_name: string;
          matric_no: string | null;
          department_id: string | null;
          current_level: number | null;
          role: UserRole;
        }>;
        Relationships: [];
      };
      papers: {
        Row: {
          id: string;
          course_id: string;
          session_id: string;
          exam_type: ExamType;
          file_path: string;
          file_mime: string | null;
          title: string | null;
          uploaded_by: string | null;
          status: string;
        } & Timestamped;
        Insert: {
          id?: string;
          course_id: string;
          session_id: string;
          exam_type?: ExamType;
          file_path: string;
          file_mime?: string | null;
          title?: string | null;
          uploaded_by?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['papers']['Insert']>;
        Relationships: [];
      };
      questions: {
        Row: { id: string; paper_id: string; number: string | null; body_text: string | null; marks: number | null };
        Insert: { id?: string; paper_id: string; number?: string | null; body_text?: string | null; marks?: number | null };
        Update: Partial<{ paper_id: string; number: string | null; body_text: string | null; marks: number | null }>;
        Relationships: [];
      };
      solutions: {
        Row: {
          id: string;
          paper_id: string | null;
          question_id: string | null;
          content: string;
          source: SolutionSource;
          model: string | null;
          verified: boolean;
          verified_by: string | null;
        } & Timestamped;
        Insert: {
          id?: string;
          paper_id?: string | null;
          question_id?: string | null;
          content: string;
          source?: SolutionSource;
          model?: string | null;
          verified?: boolean;
          verified_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['solutions']['Insert']>;
        Relationships: [];
      };
      rep_assignments: {
        Row: {
          id: string;
          user_id: string;
          department_id: string;
          level: number;
          session_id: string | null;
          status: AssignmentStatus;
          assigned_by: string | null;
        } & Timestamped;
        Insert: {
          id?: string;
          user_id: string;
          department_id: string;
          level: number;
          session_id?: string | null;
          status?: AssignmentStatus;
          assigned_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['rep_assignments']['Insert']>;
        Relationships: [];
      };
      rep_transfers: {
        Row: {
          id: string;
          department_id: string;
          level: number;
          from_user: string | null;
          to_user: string | null;
          status: TransferStatus;
          initiated_by: string | null;
          approved_by: string | null;
        } & Timestamped;
        Insert: {
          id?: string;
          department_id: string;
          level: number;
          from_user?: string | null;
          to_user?: string | null;
          status?: TransferStatus;
          initiated_by?: string | null;
          approved_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['rep_transfers']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_active_rep: { Args: { dep: string; lvl: number }; Returns: boolean };
    };
    Enums: {
      user_role: UserRole;
      exam_type: ExamType;
      semester_type: SemesterType;
      solution_source: SolutionSource;
      assignment_status: AssignmentStatus;
      transfer_status: TransferStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
