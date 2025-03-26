export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          password: string
          phone: string | null
          account_type: string
          real_balance: number
          demo_balance: number
          bonus_balance: number
          document: string | null
          verified: boolean
          kyc_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          password: string
          phone?: string | null
          account_type?: string
          real_balance?: number
          demo_balance?: number
          bonus_balance?: number
          document?: string | null
          verified?: boolean
          kyc_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          password?: string
          phone?: string | null
          account_type?: string
          real_balance?: number
          demo_balance?: number
          bonus_balance?: number
          document?: string | null
          verified?: boolean
          kyc_approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reset_codes: {
        Row: {
          id: string
          email: string
          code: string
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          code: string
          expires_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          code?: string
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: string
          amount: number
          date: string
          status: string
          method: string | null
          details: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          amount: number
          date: string
          status: string
          method?: string | null
          details?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          amount?: number
          date?: string
          status?: string
          method?: string | null
          details?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      trades: {
        Row: {
          id: string
          user_id: string
          symbol: string
          type: string
          amount: number
          entry_price: number
          exit_price: number | null
          possible_profit: number
          profit: number
          expiration: number
          status: string
          result: string | null
          created_at: string
          closed_at: string | null
          account_type: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          symbol: string
          type: string
          amount: number
          entry_price: number
          exit_price?: number | null
          possible_profit: number
          profit?: number
          expiration: number
          status: string
          result?: string | null
          created_at?: string
          closed_at?: string | null
          account_type?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          symbol?: string
          type?: string
          amount?: number
          entry_price?: number
          exit_price?: number | null
          possible_profit?: number
          profit?: number
          expiration?: number
          status?: string
          result?: string | null
          created_at?: string
          closed_at?: string | null
          account_type?: string
          updated_at?: string
        }
      }
    }
  }
}