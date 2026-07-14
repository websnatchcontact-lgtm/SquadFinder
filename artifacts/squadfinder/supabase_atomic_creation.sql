-- ==================================================
-- DATABASE SCHEMA UPDATE
-- ==================================================

-- 1. Add dedicated creator_enrollment column to groups table
ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS creator_enrollment TEXT;

-- ==================================================
-- TRUE ATOMIC GROUP CREATION (RPC)
-- ==================================================

-- Drop existing functions if any
DROP FUNCTION IF EXISTS create_group_atomic(text, text, jsonb);
DROP FUNCTION IF EXISTS check_single_creator();

-- Create pure PostgreSQL atomic transaction for creating a group
CREATE OR REPLACE FUNCTION create_group_atomic(
  p_creator_name TEXT,
  p_creator_enrollment TEXT,
  p_members JSONB
) RETURNS JSONB AS $$
DECLARE
  v_group_id UUID;
  v_group_number BIGINT;
  v_has_created BOOLEAN;
  v_member RECORD;
BEGIN
  -- Validate single creator rule explicitly against the groups table
  SELECT EXISTS (
    SELECT 1 
    FROM groups 
    WHERE creator_enrollment = p_creator_enrollment
  ) INTO v_has_created;

  IF v_has_created THEN
    RAISE EXCEPTION 'You have already created a group. A student can create only one group.';
  END IF;

  -- 1. Insert Group (explicitly setting creator_enrollment)
  INSERT INTO groups (creator_name, creator_enrollment) 
  VALUES (p_creator_name, p_creator_enrollment) 
  RETURNING id, group_number INTO v_group_id, v_group_number;

  -- 2. Upsert Students and Insert Members
  FOR v_member IN SELECT * FROM jsonb_array_elements(p_members)
  LOOP
    -- Upsert student (only updates non-key fields)
    INSERT INTO students (enrollment, full_name, division, specialization)
    VALUES (
      v_member.value->>'enrollment', 
      v_member.value->>'name', 
      v_member.value->>'division', 
      v_member.value->>'specialization'
    )
    ON CONFLICT (enrollment) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        division = EXCLUDED.division,
        specialization = EXCLUDED.specialization;

    -- Insert group_member
    INSERT INTO group_members (group_id, enrollment, confirmed)
    VALUES (
      v_group_id, 
      v_member.value->>'enrollment', 
      (v_member.value->>'confirmed')::BOOLEAN
    );
  END LOOP;

  -- PostgreSQL implicitly commits the transaction here.
  -- If any error occurs inside the BEGIN/END block, it rolls back automatically.
  
  RETURN jsonb_build_object('id', v_group_id, 'group_number', v_group_number);
END;
$$ LANGUAGE plpgsql;
