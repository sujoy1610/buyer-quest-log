-- Create enum types
CREATE TYPE public.city_type AS ENUM ('Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other');
CREATE TYPE public.property_type AS ENUM ('Apartment', 'Villa', 'Plot', 'Office', 'Retail');
CREATE TYPE public.bhk_type AS ENUM ('1', '2', '3', '4', 'Studio');
CREATE TYPE public.purpose_type AS ENUM ('Buy', 'Rent');
CREATE TYPE public.timeline_type AS ENUM ('0-3m', '3-6m', '>6m', 'Exploring');
CREATE TYPE public.source_type AS ENUM ('Website', 'Referral', 'Walk-in', 'Call', 'Other');
CREATE TYPE public.status_type AS ENUM ('New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create buyers table
CREATE TABLE public.buyers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL CHECK (length(full_name) >= 2 AND length(full_name) <= 80),
  email TEXT,
  phone TEXT NOT NULL CHECK (phone ~ '^\d{10,15}$'),
  city city_type NOT NULL,
  property_type property_type NOT NULL,
  bhk bhk_type,
  purpose purpose_type NOT NULL,
  budget_min INTEGER CHECK (budget_min >= 0),
  budget_max INTEGER CHECK (budget_max >= 0),
  timeline timeline_type NOT NULL,
  source source_type NOT NULL,
  status status_type NOT NULL DEFAULT 'New',
  notes TEXT CHECK (length(notes) <= 1000),
  tags TEXT[],
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT budget_order_check CHECK (budget_max IS NULL OR budget_min IS NULL OR budget_max >= budget_min)
);

-- Enable RLS on buyers
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;

-- Create buyer_history table
CREATE TABLE public.buyer_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES public.buyers(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  diff JSONB NOT NULL
);

-- Enable RLS on buyer_history
ALTER TABLE public.buyer_history ENABLE ROW LEVEL SECURITY;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_buyers_updated_at
  BEFORE UPDATE ON public.buyers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to log buyer changes
CREATE OR REPLACE FUNCTION public.log_buyer_changes()
RETURNS TRIGGER AS $$
DECLARE
  changes JSONB := '{}';
  old_val TEXT;
  new_val TEXT;
BEGIN
  -- Compare each field and build diff
  IF OLD.full_name IS DISTINCT FROM NEW.full_name THEN
    changes := changes || jsonb_build_object('full_name', jsonb_build_object('old', OLD.full_name, 'new', NEW.full_name));
  END IF;
  
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    changes := changes || jsonb_build_object('email', jsonb_build_object('old', OLD.email, 'new', NEW.email));
  END IF;
  
  IF OLD.phone IS DISTINCT FROM NEW.phone THEN
    changes := changes || jsonb_build_object('phone', jsonb_build_object('old', OLD.phone, 'new', NEW.phone));
  END IF;
  
  IF OLD.city IS DISTINCT FROM NEW.city THEN
    changes := changes || jsonb_build_object('city', jsonb_build_object('old', OLD.city, 'new', NEW.city));
  END IF;
  
  IF OLD.property_type IS DISTINCT FROM NEW.property_type THEN
    changes := changes || jsonb_build_object('property_type', jsonb_build_object('old', OLD.property_type, 'new', NEW.property_type));
  END IF;
  
  IF OLD.bhk IS DISTINCT FROM NEW.bhk THEN
    changes := changes || jsonb_build_object('bhk', jsonb_build_object('old', OLD.bhk, 'new', NEW.bhk));
  END IF;
  
  IF OLD.purpose IS DISTINCT FROM NEW.purpose THEN
    changes := changes || jsonb_build_object('purpose', jsonb_build_object('old', OLD.purpose, 'new', NEW.purpose));
  END IF;
  
  IF OLD.budget_min IS DISTINCT FROM NEW.budget_min THEN
    changes := changes || jsonb_build_object('budget_min', jsonb_build_object('old', OLD.budget_min, 'new', NEW.budget_min));
  END IF;
  
  IF OLD.budget_max IS DISTINCT FROM NEW.budget_max THEN
    changes := changes || jsonb_build_object('budget_max', jsonb_build_object('old', OLD.budget_max, 'new', NEW.budget_max));
  END IF;
  
  IF OLD.timeline IS DISTINCT FROM NEW.timeline THEN
    changes := changes || jsonb_build_object('timeline', jsonb_build_object('old', OLD.timeline, 'new', NEW.timeline));
  END IF;
  
  IF OLD.source IS DISTINCT FROM NEW.source THEN
    changes := changes || jsonb_build_object('source', jsonb_build_object('old', OLD.source, 'new', NEW.source));
  END IF;
  
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    changes := changes || jsonb_build_object('status', jsonb_build_object('old', OLD.status, 'new', NEW.status));
  END IF;
  
  IF OLD.notes IS DISTINCT FROM NEW.notes THEN
    changes := changes || jsonb_build_object('notes', jsonb_build_object('old', OLD.notes, 'new', NEW.notes));
  END IF;
  
  IF OLD.tags IS DISTINCT FROM NEW.tags THEN
    changes := changes || jsonb_build_object('tags', jsonb_build_object('old', OLD.tags, 'new', NEW.tags));
  END IF;

  -- Only log if there are actual changes
  IF changes != '{}' THEN
    INSERT INTO public.buyer_history (buyer_id, changed_by, diff)
    VALUES (NEW.id, auth.uid(), changes);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to log buyer changes
CREATE TRIGGER log_buyer_changes_trigger
  AFTER UPDATE ON public.buyers
  FOR EACH ROW
  EXECUTE FUNCTION public.log_buyer_changes();

-- Create function to log buyer creation
CREATE OR REPLACE FUNCTION public.log_buyer_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.buyer_history (buyer_id, changed_by, diff)
  VALUES (NEW.id, auth.uid(), jsonb_build_object('action', 'created'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to log buyer creation
CREATE TRIGGER log_buyer_creation_trigger
  AFTER INSERT ON public.buyers
  FOR EACH ROW
  EXECUTE FUNCTION public.log_buyer_creation();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for buyers
CREATE POLICY "Users can view all buyers" ON public.buyers
  FOR SELECT USING (true);

CREATE POLICY "Users can create buyers" ON public.buyers
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own buyers" ON public.buyers
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own buyers" ON public.buyers
  FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for buyer_history
CREATE POLICY "Users can view history for accessible buyers" ON public.buyer_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.buyers 
      WHERE buyers.id = buyer_history.buyer_id
    )
  );

CREATE POLICY "System can insert history" ON public.buyer_history
  FOR INSERT WITH CHECK (auth.uid() = changed_by);