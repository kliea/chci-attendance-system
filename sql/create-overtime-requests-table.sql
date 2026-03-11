-- Create overtime_requests table
CREATE TABLE IF NOT EXISTS overtime_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('regular', 'weekend', 'holiday')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_overtime_requests_user_id ON overtime_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_overtime_requests_date ON overtime_requests(date);
CREATE INDEX IF NOT EXISTS idx_overtime_requests_status ON overtime_requests(status);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_overtime_requests_updated_at 
    BEFORE UPDATE ON overtime_requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional for testing)
INSERT INTO overtime_requests (user_id, date, start_time, end_time, reason, type, status)
SELECT 
    p.id,
    CURRENT_DATE - INTERVAL '7 days',
    '18:00:00',
    '22:00:00',
    'Completed project documentation and client deliverables',
    'regular',
    'approved'
FROM profiles p 
WHERE p.role = 'employee'
LIMIT 1;

INSERT INTO overtime_requests (user_id, date, start_time, end_time, reason, type, status)
SELECT 
    p.id,
    CURRENT_DATE - INTERVAL '3 days',
    '09:00:00',
    '17:00:00',
    'Weekend system maintenance and server updates',
    'weekend',
    'pending'
FROM profiles p 
WHERE p.role = 'employee'
LIMIT 1;
