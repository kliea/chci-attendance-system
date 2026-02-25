-- Add missing columns to rectification_requests table
-- These fields are needed for the rectification feature

-- Add time correction fields
ALTER TABLE rectification_requests 
ADD COLUMN IF NOT EXISTS time_in TIME,
ADD COLUMN IF NOT EXISTS time_out TIME;

-- Add status and review fields
ALTER TABLE rectification_requests 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS review_notes TEXT;

-- Add or update rectification_type constraint if needed
-- First, drop any existing constraint
ALTER TABLE rectification_requests DROP CONSTRAINT IF EXISTS rectification_requests_rectification_type_check;

-- Add the correct constraint with allowed values
ALTER TABLE rectification_requests 
ADD CONSTRAINT rectification_requests_rectification_type_check 
CHECK (rectification_type IN ('time_in', 'time_out', 'both', 'missing', 'other'));

-- Add created_at field if it doesn't exist
ALTER TABLE rectification_requests 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_rectification_requests_status ON rectification_requests(status);
CREATE INDEX IF NOT EXISTS idx_rectification_requests_user_id ON rectification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_rectification_requests_date ON rectification_requests(date);

-- Add RLS policies for rectification_requests
ALTER TABLE rectification_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own requests
CREATE POLICY "Users can view own rectification requests" ON rectification_requests
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Managers can view all rectification requests
CREATE POLICY "Managers can view all rectification requests" ON rectification_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.userrole_id IN (
                SELECT id FROM userrole 
                WHERE role_name IN ('admin', 'manager', 'supervisor')
            )
        )
    );

-- Policy: Users can insert their own requests
CREATE POLICY "Users can create own rectification requests" ON rectification_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Managers can update requests (approve/reject)
CREATE POLICY "Managers can update rectification requests" ON rectification_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.userrole_id IN (
                SELECT id FROM userrole 
                WHERE role_name IN ('admin', 'manager', 'supervisor')
            )
        )
    );

-- Policy: No one can delete requests (preserve audit trail)
CREATE POLICY "No deletion of rectification requests" ON rectification_requests
    FOR DELETE USING (false);
