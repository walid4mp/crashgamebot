-- Initial database setup for CrashGameBot
-- This script runs when PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create indexes for better performance (will be added after Prisma migration)
-- These are commented out since Prisma will handle the schema creation

-- Performance optimization indexes (to be created after Prisma setup)
/*
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_referrer ON users(referrer);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bets_chat_id ON bets(chat_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bets_round_id ON bets(round_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bets_created_at ON bets(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_rounds_status ON game_rounds(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_rounds_start_time ON game_rounds(start_time);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_chat_id ON transactions(chat_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
*/

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'CrashGameBot database initialized successfully';
END $$;
