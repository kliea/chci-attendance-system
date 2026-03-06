-- Add overtime columns to attendance_logs table
ALTER TABLE public.attendance_logs 
ADD COLUMN IF NOT EXISTS overtime_in TIME,
ADD COLUMN IF NOT EXISTS overtime_out TIME;

-- Create function to calculate overtime hours and add to attendance record
CREATE OR REPLACE FUNCTION public.add_overtime_to_attendance(
    p_user_id UUID,
    p_date DATE,
    p_start_time TIME,
    p_end_time TIME
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_staff_id UUID;
    v_existing_record UUID;
    v_regular_hours INTERVAL;
    v_overtime_hours INTERVAL;
    v_time_in TIME;
    v_time_out TIME;
    v_overtime_in TIME;
    v_overtime_out TIME;
BEGIN
    -- Get staff_id from user profile
    SELECT s.id INTO v_staff_id
    FROM public.staff s
    JOIN public.profiles p ON s.bio_id = p.bio_id
    WHERE p.id = p_user_id;
    
    IF v_staff_id IS NULL THEN
        RAISE EXCEPTION 'User profile not linked to staff record';
    END IF;
    
    -- Check if attendance record exists for this date
    SELECT id INTO v_existing_record
    FROM public.attendance_logs
    WHERE staff_id = v_staff_id AND date = p_date;
    
    -- Calculate overtime hours (anything beyond 8 hours is overtime)
    v_regular_hours := INTERVAL '8 hours';
    v_overtime_hours := (p_end_time::timestamp - p_start_time::timestamp) - v_regular_hours;
    
    -- Only add overtime if it's positive (more than 8 hours)
    IF v_overtime_hours > INTERVAL '0 minutes' THEN
        v_overtime_in := p_start_time + INTERVAL '8 hours';
        v_overtime_out := p_end_time;
        
        IF v_existing_record IS NOT NULL THEN
            -- Update existing attendance record with overtime
            UPDATE public.attendance_logs
            SET 
                overtime_in = v_overtime_in,
                overtime_out = v_overtime_out,
                updated_at = now()
            WHERE id = v_existing_record;
        ELSE
            -- Create new attendance record with overtime
            INSERT INTO public.attendance_logs (
                staff_id,
                date,
                time_in,
                time_out,
                overtime_in,
                overtime_out,
                source
            ) VALUES (
                v_staff_id,
                p_date,
                p_start_time,
                p_end_time,
                v_overtime_in,
                v_overtime_out,
                'overtime_approval'
            );
        END IF;
    END IF;
END;
$$;

-- Create trigger to automatically add overtime when request is approved
CREATE OR REPLACE FUNCTION public.handle_overtime_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- When overtime request is approved, add overtime to attendance
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        PERFORM public.add_overtime_to_attendance(
            NEW.user_id,
            NEW.date,
            NEW.start_time,
            NEW.end_time
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS overtime_approval_trigger ON public.overtime_requests;

-- Create trigger to handle overtime approval
CREATE TRIGGER overtime_approval_trigger
AFTER UPDATE ON public.overtime_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_overtime_approval();
